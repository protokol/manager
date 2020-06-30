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
import {
  COLLECTIONS_TYPE_NAME,
  LoadCollection,
  LoadCollections,
  SetCollectionsByIds,
} from '@core/store/collections/collections.actions';
import { NetworksState } from '@core/store/network/networks.state';
import { patch } from '@ngxs/store/operators';
import { PaginationMeta } from '@shared/interfaces/table.types';
import { TableUtils } from '@shared/utils/table-utils';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { CollectionsService } from '@core/services/collections.service';

export interface CollectionsStateModel {
  collectionsIds: string[];
  collections: {
    [name: string]: BaseResourcesTypes.Collections | null | undefined;
  };
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

  constructor(private collectionsService: CollectionsService) {}

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

  @Action(LoadCollection)
  loadCollection(
    { getState, setState, dispatch }: StateContext<CollectionsStateModel>,
    { collectionId }: LoadCollection
  ) {
    const collection = getState().collections[collectionId];

    if (!collection && collection !== null) {
      setState(
        patch({
          collections: patch({ [collectionId]: null }),
        })
      );

      this.collectionsService
        .getCollection(collectionId)
        .pipe(
          tap(
            (data) => dispatch(new SetCollectionsByIds(data)),
            () => {
              setState(
                patch({
                  collections: patch({ [collectionId]: undefined }),
                })
              );
            }
          )
        )
        .subscribe();
    }
  }

  @Action(LoadCollections)
  loadCollections(
    { patchState, dispatch }: StateContext<CollectionsStateModel>,
    { tableQueryParams }: LoadCollections
  ) {
    this.collectionsService
      .getCollections(TableUtils.toAllCollectionQuery(tableQueryParams))
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
  }

  @Action(SetCollectionsByIds)
  setCollectionsByIds(
    { patchState, getState }: StateContext<CollectionsStateModel>,
    { collections }: SetCollectionsByIds
  ) {
    const collectionSet = Array.isArray(collections)
      ? collections
      : [collections];

    patchState({
      collections: collectionSet.reduce(
        (acc, value) => ({
          ...acc,
          [value.id]: value,
        }),
        { ...getState().collections }
      ),
    });
  }
}
