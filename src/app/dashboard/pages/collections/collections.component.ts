import {
	ChangeDetectionStrategy,
	Component,
	OnDestroy,
	OnInit,
	TemplateRef,
	ViewChild,
	ViewContainerRef,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LoadCollections } from '@app/dashboard/pages/collections/state/collections/collections.actions';
import { NetworksState } from '@core/store/network/networks.state';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionsState } from '@app/dashboard/pages/collections/state/collections/collections.state';
import { Collections } from '@protokol/nft-client';
import {
	PaginationMeta,
	TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { NzModalService, NzTableQueryParams } from 'ng-zorro-antd';
import { CollectionsViewModalComponent } from '@app/dashboard/pages/collections/components/collections-view-modal/collections-view-modal.component';

@Component({
	selector: 'app-collections',
	templateUrl: './collections.component.html',
	styleUrls: ['./collections.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsComponent implements OnInit, OnDestroy {
	@Select(CollectionsState.getCollectionIds) collectionIds$: Observable<
		string[]
	>;
	@Select(CollectionsState.getMeta) meta$: Observable<PaginationMeta>;

	@ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
		row: Collections;
	}>;
	@ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
		row: Collections;
	}>;
	@ViewChild('ownerTpl', { static: true }) ownerTpl!: TemplateRef<{
		row: Collections;
	}>;

	isLoading$ = new BehaviorSubject(false);

	rows$: Observable<Collections[]> = of([]);
	tableColumns: TableColumnConfig<Collections>[];

	constructor(
		private store: Store,
		private nzModalService: NzModalService,
		private viewContainerRef: ViewContainerRef
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
				propertyName: 'name',
				headerName: 'Name',
				sortBy: true,
			},
			{
				propertyName: 'description',
				headerName: 'Description',
				sortBy: true,
			},
			{
				propertyName: 'maximumSupply',
				headerName: 'Supply',
				sortBy: true,
			},
			{
				propertyName: 'senderPublicKey',
				headerName: 'Owner',
				columnTransformTpl: this.ownerTpl,
				sortBy: true,
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
					.select(CollectionsState.getCollectionsByIds(collectionsIds))
					.pipe(filter((collection) => collection.some((c) => !!c)))
			),
			tap(() => this.isLoading$.next(false))
		);

		this.store
			.select(NetworksState.getBaseUrl)
			.pipe(
				untilDestroyed(this),
				filter((baseUrl) => !!baseUrl),
				tap(() => this.isLoading$.next(true)),
				tap(() => this.store.dispatch(new LoadCollections()))
			)
			.subscribe();
	}

	ngOnDestroy() {}

	showJsonSchema(event: MouseEvent, row: Collections) {
		event.preventDefault();

		this.nzModalService.create({
			nzTitle: `"${row.name}" json schema`,
			nzContent: CollectionsViewModalComponent,
			nzViewContainerRef: this.viewContainerRef,
			nzGetContainer: () => document.body,
			nzComponentParams: {
				jsonSchema: row.jsonSchema,
			},
			nzFooter: null,
		});
	}

	paginationChange(params: NzTableQueryParams) {}
}
