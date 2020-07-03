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
import {
  AssetLoadOptions,
  ASSETS_TYPE_NAME,
  LoadAsset,
  LoadAssets,
  SetAssetsByIds,
} from './assets.actions';
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
    { withCollection }: AssetLoadOptions
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

        return assetIds.map((cId) => {
          if (withCollection) {
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

  @Action(LoadAsset)
  loadAsset(
    { getState, setState, dispatch }: StateContext<AssetsStateModel>,
    { assetId, options: { withCollection } }: LoadAsset
  ) {
    const asset = getState().assets[assetId];

    if (!asset && asset !== null) {
      setState(
        patch({
          assets: patch({ [assetId]: null }),
        })
      );

      this.assetsService
        .getAsset(assetId)
        .pipe(
          tap(
            (data) => dispatch(new SetAssetsByIds(data)),
            () => {
              setState(
                patch({
                  assets: patch({ [assetId]: undefined }),
                })
              );
            }
          ),
          tap((data) => {
            if (withCollection) {
              dispatch(new LoadCollection(data.collectionId));
            }
          })
        )
        .subscribe();
    }
  }

  @Action(LoadAssets)
  loadAssets(
    { patchState, dispatch }: StateContext<AssetsStateModel>,
    { tableQueryParams, options: { withCollection } }: LoadAssets
  ) {
    const hasFilters =
      tableQueryParams &&
      tableQueryParams.filter &&
      tableQueryParams.filter.length;
    const loadAssets$ = hasFilters
      ? this.assetsService.searchAssets(
          TableUtils.toTableApiQuery(tableQueryParams)
        )
      : this.assetsService.getAssets(
          TableUtils.toTableApiQuery(tableQueryParams)
        );

    loadAssets$
      .pipe(
        tap(({ data }) => dispatch(new SetAssetsByIds(data))),
        tap(({ data, meta }) => {
          if (data.length) {
            patchState({
              assetsIds: data.map((c) => c.id),
              meta,
            });
          }
        }),
        tap(({ data }) => {
          if (withCollection) {
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
    { setState, getState }: StateContext<AssetsStateModel>,
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
          { ...getState().assets }
        ),
      })
    );
  }
}
