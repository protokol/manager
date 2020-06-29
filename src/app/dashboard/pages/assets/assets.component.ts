import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
	PaginationMeta,
	TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { NzTableQueryParams } from 'ng-zorro-antd';
import { AssetsState } from '@app/dashboard/pages/assets/state/collections/assets.state';
import { LoadAssets } from '@app/dashboard/pages/assets/state/collections/assets.actions';
import { Logger } from '@app/@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/nft-client';

@Component({
	selector: 'app-assets',
	templateUrl: './assets.component.html',
	styleUrls: ['./assets.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsComponent implements OnInit, OnDestroy {
	readonly log = new Logger(this.constructor.name);

	private params: NzTableQueryParams;

	@Select(AssetsState.getAssetsIds) collectionIds$: Observable<
		string[]
	>;
	@Select(AssetsState.getMeta) meta$: Observable<PaginationMeta>;

	@ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
		row: BaseResourcesTypes.Assets;
	}>;
	@ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
		row: BaseResourcesTypes.Assets;
	}>;
	@ViewChild('collectionIdTpl', { static: true }) collectionIdTpl!: TemplateRef<{
		row: BaseResourcesTypes.Assets;
	}>;
	@ViewChild('ownerTpl', { static: true }) ownerTpl!: TemplateRef<{
		row: BaseResourcesTypes.Assets;
	}>;

	isLoading$ = new BehaviorSubject(false);

	rows$: Observable<BaseResourcesTypes.Assets[]> = of([]);
	tableColumns: TableColumnConfig<BaseResourcesTypes.Assets>[];

	constructor(
		private store: Store
	) {}

	ngOnInit() {
		this.tableColumns = [
			{
				propertyName: 'id',
				headerName: 'Id',
				columnTransformTpl: this.idTpl,
				sortBy: true,
			},
			{
				propertyName: 'collectionId',
				headerName: 'Collection',
				columnTransformTpl: this.collectionIdTpl
			},
			{
				propertyName: 'ownerPublicKey',
				headerName: 'Owner',
				columnTransformTpl: this.ownerTpl
			},
			{
				headerName: 'Actions',
				columnTransformTpl: this.actionsTpl,
			},
		];

		this.rows$ = this.collectionIds$.pipe(
			distinctUntilChanged(),
			switchMap((collectionsIds) =>
				this.store
					.select(AssetsState.getAssetsByIds(collectionsIds, { withCollections: true }))
					.pipe(
						filter(assets => {
							if (!assets.length) {
								return true;
							}
							return assets.every(a => a.collection !== null);
						})
					)
			),
			tap(() => this.isLoading$.next(false))
		);

		this.store
			.select(NetworksState.getBaseUrl)
			.pipe(
				untilDestroyed(this),
				filter((baseUrl) => !!baseUrl),
				tap(() => this.isLoading$.next(true)),
				tap(() => this.store.dispatch(new LoadAssets(undefined, { withLoadCollection: true })))
			)
			.subscribe();
	}

	ngOnDestroy() {}

	showAttributes(event: MouseEvent, row: BaseResourcesTypes.Assets) {
		event.preventDefault();

		this.log.info('row', row);
	}

	paginationChange(params: NzTableQueryParams) {
		// TODO: Fix multiple emit bug
		if (!this.params) {
			this.params = params;
		} else {
			this.store.dispatch(new LoadAssets(params));
		}
	}
}
