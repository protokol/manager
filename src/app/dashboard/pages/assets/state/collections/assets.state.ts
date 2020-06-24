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
import { NetworksState } from '@core/store/network/networks.state';
import { patch } from '@ngxs/store/operators';
import { PaginationMeta } from '@shared/interfaces/table.types';
import { TableUtils } from '@shared/utils/table-utils';
import { Assets } from '@protokol/nft-client/dist/resourcesTypes/base';
import { ASSETS_TYPE_NAME, LoadAssets, SetAssetsByIds } from './assets.actions';

interface AssetsStateModel {
	assetsIds: string[];
	assets: { [name: string]: Assets };
	meta: PaginationMeta | null;
}

const ASSETS_DEFAULT_STATE: AssetsStateModel = {
	assetsIds: [],
	assets: {},
	meta: null,
};

@State<AssetsStateModel>({
	name: ASSETS_TYPE_NAME,
	defaults: { ...ASSETS_DEFAULT_STATE },
})
@Injectable()
export class AssetsState {
	readonly log = new Logger(this.constructor.name);

	constructor(
		private nodeClientService: NodeClientService,
		private store: Store
	) {}

	@Selector()
	static getAssetsIds({ assetsIds }: AssetsStateModel) {
		return assetsIds;
	}

	@Selector()
	static getMeta({ meta }: AssetsStateModel) {
		return meta;
	}

	static getAssetsByIds(assetIds: string[]) {
		return createSelector(
			[AssetsState],
			({ assets }: AssetsStateModel) => {
				if (!assetIds.length) {
					return [];
				}

				return assetIds.map((cId) => assets[cId]);
			}
		);
	}

	@Action(LoadAssets)
	loadAssets({
		patchState,
		dispatch,
	}: StateContext<AssetsStateModel>, {
		tableQueryParams
	}: LoadAssets) {
		const baseUrl = this.store.selectSnapshot(NetworksState.getBaseUrl);

		this.nodeClientService
			.getAssets(baseUrl, TableUtils.toAllCollectionQuery(tableQueryParams))
			.pipe(
				tap(({ data }) => dispatch(new SetAssetsByIds(data))),
				tap(({ data, meta }) => {
					patchState({
						assetsIds: data.map((c) => c.id),
						meta,
					});
				})
			)
			.subscribe();
	}

	@Action(SetAssetsByIds)
	setAssetsByIds(
		{ setState }: StateContext<AssetsStateModel>,
		{ assets }: SetAssetsByIds
	) {
		const assetsSet = Array.isArray(assets)
			? assets
			: [assets];

		setState(
			patch({
				assets: assetsSet.reduce(
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
