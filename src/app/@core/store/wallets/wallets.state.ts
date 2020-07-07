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
import { Wallet } from '@arkecosystem/client/dist/resourcesTypes/wallets';
import {
  LoadWallet,
  LoadWallets,
  SetWalletsByIds,
  WalletLoadOptions,
  WALLETS_TYPE_NAME,
} from './wallets.actions';
import { WalletsService } from '@core/services/wallets.service';
import { forkJoin } from 'rxjs';
import { CollectionsService } from '@core/services/collections.service';
import { CollectionsWallet } from '@protokol/nft-client/dist/resourcesTypes/base/collections';
import { AssetsWallet } from '@protokol/nft-client/dist/resourcesTypes/base';
import { AssetsService } from '@core/services/assets.service';

interface WalletsStateModel {
  walletsIds: string[];
  wallets: { [name: string]: Wallet };
  collectionsWallet: { [collectionId: string]: CollectionsWallet };
  assetsWallet: { [assetId: string]: AssetsWallet };
  meta: PaginationMeta | null;
}

const WALLETS_DEFAULT_STATE: WalletsStateModel = {
  walletsIds: [],
  wallets: {},
  collectionsWallet: {},
  assetsWallet: {},
  meta: null,
};

@State<WalletsStateModel>({
  name: WALLETS_TYPE_NAME,
  defaults: { ...WALLETS_DEFAULT_STATE },
})
@Injectable()
export class WalletsState {
  readonly log = new Logger(this.constructor.name);

  constructor(
    private walletsService: WalletsService,
    private collectionsService: CollectionsService,
    private assetsService: AssetsService
  ) {}

  @Selector()
  static getWalletsIds({ walletsIds }: WalletsStateModel) {
    return walletsIds;
  }

  @Selector()
  static getMeta({ meta }: WalletsStateModel) {
    return meta;
  }

  static getWalletsByIds(
    walletIds: string[],
    { collectionId, assetId }: WalletLoadOptions = {
      collectionId: undefined,
      assetId: undefined,
    }
  ) {
    return createSelector(
      [WalletsState],
      ({ wallets, collectionsWallet, assetsWallet }: WalletsStateModel) => {
        if (!walletIds.length) {
          return [];
        }

        return walletIds.map((cId) => {
          const wallet = wallets[cId];

          if (collectionId) {
            return {
              wallet,
              collectionsWallet: collectionsWallet.hasOwnProperty(collectionId)
                ? collectionsWallet[collectionId]
                : null,
            };
          }

          if (assetId) {
            return {
              wallet,
              assetsWallet: assetsWallet.hasOwnProperty(assetId)
                ? assetsWallet[assetId]
                : null,
            };
          }

          return {
            wallet,
          };
        });
      }
    );
  }

  @Action(LoadWallet)
  loadWallet(
    { getState, setState, dispatch }: StateContext<WalletsStateModel>,
    { walletId, options: { collectionId, assetId } }: LoadWallet
  ) {
    const wallet = getState().wallets[walletId];

    if (!wallet && wallet !== null) {
      setState(
        patch({
          wallets: patch({ [walletId]: null }),
        })
      );
    }

    const obs$ = [];

    obs$.push(
      this.walletsService.getWallet(walletId).pipe(
        tap(
          (data) => dispatch(new SetWalletsByIds(data)),
          () => {
            setState(
              patch({
                wallets: patch({ [walletId]: undefined }),
              })
            );
          }
        )
      )
    );

    const setCollectionsWallet = (collectionWallet?: CollectionsWallet) => {
      setState(
        patch({
          collectionsWallet: patch({
            [collectionId]: collectionWallet,
          }),
        })
      );
    };

    if (collectionId) {
      obs$.push(
        this.collectionsService.getCollectionOwner(collectionId).pipe(
          tap(
            (data) => setCollectionsWallet(data),
            () => setCollectionsWallet()
          )
        )
      );
    } else {
      setCollectionsWallet();
    }

    const setAssetsWallet = (assetsWallet?: AssetsWallet) => {
      setState(
        patch({
          assetsWallet: patch({
            [assetId]: assetsWallet,
          }),
        })
      );
    };

    if (assetId) {
      obs$.push(
        this.assetsService.getAssetOwner(assetId).pipe(
          tap(
            (data) => setAssetsWallet(data),
            () => setAssetsWallet()
          )
        )
      );
    } else {
      setAssetsWallet();
    }

    forkJoin(obs$).subscribe();
  }

  @Action(LoadWallets)
  loadWallets(
    { patchState, dispatch }: StateContext<WalletsStateModel>,
    { tableQueryParams }: LoadWallets
  ) {
    this.walletsService
      .getWallets(TableUtils.toTableApiQuery(tableQueryParams))
      .pipe(
        tap(({ data }) => dispatch(new SetWalletsByIds(data))),
        tap(({ data, meta }) => {
          if (data.length) {
            patchState({
              walletsIds: data.map((i) => i.publicKey),
              meta,
            });
          }
        })
      )
      .subscribe();
  }

  @Action(SetWalletsByIds)
  setWalletsByIds(
    { setState, getState }: StateContext<WalletsStateModel>,
    { wallets }: SetWalletsByIds
  ) {
    const walletsSet = Array.isArray(wallets) ? wallets : [wallets];

    setState(
      patch({
        wallets: walletsSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.publicKey]: value,
            [value.address]: value,
          }),
          { ...getState().wallets }
        ),
      })
    );
  }
}
