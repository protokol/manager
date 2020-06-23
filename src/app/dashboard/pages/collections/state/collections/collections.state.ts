import { Logger } from '@core/services/logger.service';
import {
	State,
	Action,
	StateContext,
	Store,
	createSelector,
	Selector,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { NodeClientService } from '@core/services/node-client.service';
import { tap } from 'rxjs/operators';
import { Collections } from '@protokol/nft-client';
import {
	COLLECTIONS_TYPE_NAME,
	LoadCollections,
	SetCollectionsByIds,
} from '@app/dashboard/pages/collections/state/collections/collections.actions';
import { NetworksState } from '@core/store/network/networks.state';
import { patch } from '@ngxs/store/operators';
import { PaginationMeta } from '@shared/interfaces/table.types';

interface CollectionsStateModel {
	collectionsIds: string[];
	collections: { [name: string]: Collections };
	meta: PaginationMeta | null;
}

const COLLECTIONS_DEFAULT_STATE: CollectionsStateModel = {
	collectionsIds: [],
	collections: {},
	meta: null,
};

@State<CollectionsStateModel>({
	name: COLLECTIONS_TYPE_NAME,
	defaults: { ...COLLECTIONS_DEFAULT_STATE },
})
@Injectable()
export class CollectionsState {
	readonly log = new Logger(this.constructor.name);

	constructor(
		private nodeClientService: NodeClientService,
		private store: Store
	) {}

	@Selector()
	static getCollectionIds({ collectionsIds }: CollectionsStateModel) {
		return collectionsIds;
	}

	@Selector()
	static getMeta({ meta }: CollectionsStateModel) {
		return meta;
	}

	static getCollectionsByIds(collectionIds: string[]) {
		return createSelector(
			[CollectionsState],
			({ collections }: CollectionsStateModel) => {
				if (!collectionIds.length) {
					return [];
				}

				return collectionIds.map((cId) => collections[cId]);
			}
		);
	}

	@Action(LoadCollections)
	loadCollections({
		patchState,
		dispatch,
	}: StateContext<CollectionsStateModel>) {
		const baseUrl = this.store.selectSnapshot(NetworksState.getBaseUrl);

		this.nodeClientService
			.getCollections(baseUrl)
			.pipe(
				tap(({ data }) => dispatch(new SetCollectionsByIds(data))),
				tap(({ data, meta }) => {
					patchState({
						collectionsIds: data.map((c) => c.id),
						meta,
					});
				})
			)
			.subscribe();

		this.nodeClientService.getAssets(baseUrl).subscribe();
	}

	@Action(SetCollectionsByIds)
	setCollectionsByIds(
		{ setState }: StateContext<CollectionsStateModel>,
		{ collections }: SetCollectionsByIds
	) {
		const collectionSet = Array.isArray(collections)
			? collections
			: [collections];

		setState(
			patch({
				collections: collectionSet.reduce(
					(acc, value) => ({
						...acc,
						[value.id]: value,
					}),
					{}
				),
			})
		);
	}
}
