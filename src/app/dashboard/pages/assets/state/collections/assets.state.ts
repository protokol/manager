import { Logger } from '@core/services/logger.service';
import {
  State,
  Action,
  StateContext,
  createSelector,
  Selector,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { patch } from '@ngxs/store/operators';
import { PaginationMeta } from '@shared/interfaces/table.types';
import { TableUtils } from '@shared/utils/table-utils';
import { ASSETS_TYPE_NAME, LoadAssets, SetAssetsByIds } from './assets.actions';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { LoadCollection } from '@core/store/collections/collections.actions';
import {
  CollectionsState,
  CollectionsStateModel,
} from '@core/store/collections/collections.state';
import { AssetWithCollection } from '@app/dashboard/pages/assets/interfaces/asset.types';
import { AssetsService } from '@core/services/assets.service';

interface AssetsStateModel {
  assetsIds: string[];
  assets: { [name: string]: BaseResourcesTypes.Assets };
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

  constructor(private assetsService: AssetsService) {}

  @Selector()
  static getAssetsIds({ assetsIds }: AssetsStateModel) {
    return assetsIds;
  }

  @Selector()
  static getMeta({ meta }: AssetsStateModel) {
    return meta;
  }

  static getAssetsByIds(
    assetIds: string[],
    options: { withCollections } = { withCollections: false }
  ) {
    return createSelector(
      [AssetsState, CollectionsState],
      (
        { assets }: AssetsStateModel,
        { collections }: CollectionsStateModel
      ): AssetWithCollection[] => {
        if (!assetIds.length) {
          return [];
        }

        const { withCollections } = options;
        return assetIds.map((cId) => {
          if (withCollections) {
            const { collectionId } = assets[cId] || {};
            return Object.assign({}, assets[cId], {
              collection: collectionId ? collections[collectionId] : undefined,
            });
          }

          return assets[cId];
        });
      }
    );
  }

  @Action(LoadAssets)
  loadAssets(
    { patchState, dispatch }: StateContext<AssetsStateModel>,
    { tableQueryParams, options }: LoadAssets
  ) {
    this.assetsService
      .getAssets(TableUtils.toAllCollectionQuery(tableQueryParams))
      .pipe(
        tap(({ data }) => dispatch(new SetAssetsByIds(data))),
        tap(({ data, meta }) => {
          patchState({
            assetsIds: data.map((c) => c.id),
            meta,
          });
        }),
        tap(({ data }) => {
          if (options.withLoadCollection) {
            data.forEach((c) => {
              dispatch(new LoadCollection(c.collectionId));
            });
          }
        })
      )
      .subscribe();
  }

  @Action(SetAssetsByIds)
  setAssetsByIds(
    { setState }: StateContext<AssetsStateModel>,
    { assets }: SetAssetsByIds
  ) {
    const assetsSet = Array.isArray(assets) ? assets : [assets];

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
