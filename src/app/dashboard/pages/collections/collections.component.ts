import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LoadCollections } from '@app/dashboard/pages/collections/state/collections/collections.actions';
import { NetworksState } from '@core/store/network/networks.state';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionsState } from '@app/dashboard/pages/collections/state/collections/collections.state';
import { Collections } from '@protokol/nft-client';
import { PaginationMeta, TableColumnConfig } from '@app/@shared/interfaces/table.types';

@Component({
	selector: 'app-collections',
	templateUrl: './collections.component.html',
	styleUrls: ['./collections.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsComponent implements OnInit, OnDestroy {
	@Select(CollectionsState.getCollectionIds) collectionIds$: Observable<string[]>;
	@Select(CollectionsState.getMeta) meta$: Observable<PaginationMeta>;

	isLoading$ = new BehaviorSubject(false);

	rows$: Observable<Collections[]> = of([]);
	tableColumns: TableColumnConfig<Collections>[];

	constructor(private store: Store) {
		this.tableColumns = [{
			propertyName: 'name',
			headerName: 'Name'
		}, {
			propertyName: 'description',
			headerName: 'Description'
		}];
	}

	ngOnInit() {
		this.rows$ = this.collectionIds$
			.pipe(
				distinctUntilChanged(),
				switchMap(collectionsIds =>
					this.store.select(CollectionsState.getCollectionsByIds(collectionsIds))
						.pipe(
							filter(collection => collection.some(c => !!c))
						)
				),
				tap(() => this.isLoading$.next(false))
			);

		this.store.select(NetworksState.getBaseUrl)
			.pipe(
				untilDestroyed(this),
				filter(baseUrl => !!baseUrl),
				tap(() => this.isLoading$.next(true)),
				tap(() => this.store.dispatch(new LoadCollections()))
			).subscribe();
	}

	ngOnDestroy() {}
}
