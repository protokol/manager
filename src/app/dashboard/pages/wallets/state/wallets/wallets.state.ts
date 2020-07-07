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
  LoadWallets,
  SetWalletsByIds,
  WALLETS_TYPE_NAME,
} from './wallets.actions';
import { WalletsService } from '@core/services/wallets.service';

interface WalletsStateModel {
  walletsIds: string[];
  wallets: { [name: string]: Wallet };
  meta: PaginationMeta | null;
}

const WALLETS_DEFAULT_STATE: WalletsStateModel = {
  walletsIds: [],
  wallets: {},
  meta: null,
};

@State<WalletsStateModel>({
  name: WALLETS_TYPE_NAME,
  defaults: { ...WALLETS_DEFAULT_STATE },
})
@Injectable()
export class WalletsState {
  readonly log = new Logger(this.constructor.name);

  constructor(private walletsService: WalletsService) {}

  @Selector()
  static getWalletsIds({ walletsIds }: WalletsStateModel) {
    return walletsIds;
  }

  @Selector()
  static getMeta({ meta }: WalletsStateModel) {
    return meta;
  }

  static getWalletsByIds(walletIds: string[]) {
    return createSelector([WalletsState], ({ wallets }: WalletsStateModel) => {
      if (!walletIds.length) {
        return [];
      }

      return walletIds.map((cId) => wallets[cId]);
    });
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
          }),
          { ...getState().wallets }
        ),
      })
    );
  }
}
