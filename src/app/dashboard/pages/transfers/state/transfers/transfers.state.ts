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
import { BaseResourcesTypes } from '@protokol/nft-client';
import {
  LoadTransfers,
  SetTransfersByIds,
  TRANSFERS_TYPE_NAME,
} from '@app/dashboard/pages/transfers/state/transfers/transfers.actions';
import { TransfersService } from '@core/services/transfers.service';

interface TransfersStateModel {
  transfersIds: string[];
  transfers: { [name: string]: BaseResourcesTypes.Transfers };
  meta: PaginationMeta | null;
}

const TRANSFERS_DEFAULT_STATE: TransfersStateModel = {
  transfersIds: [],
  transfers: {},
  meta: null,
};

@State<TransfersStateModel>({
  name: TRANSFERS_TYPE_NAME,
  defaults: { ...TRANSFERS_DEFAULT_STATE },
})
@Injectable()
export class TransfersState {
  readonly log = new Logger(this.constructor.name);

  constructor(private transfersService: TransfersService) {}

  @Selector()
  static getTransfersIds({ transfersIds }: TransfersStateModel) {
    return transfersIds;
  }

  @Selector()
  static getMeta({ meta }: TransfersStateModel) {
    return meta;
  }

  static getTransfersByIds(transfersIds: string[]) {
    return createSelector(
      [TransfersState],
      ({ transfers }: TransfersStateModel) => {
        if (!transfersIds.length) {
          return [];
        }

        return transfersIds.map((cId) => transfers[cId]);
      }
    );
  }

  @Action(LoadTransfers)
  loadAssets(
    { patchState, dispatch }: StateContext<TransfersStateModel>,
    { tableQueryParams }: LoadTransfers
  ) {
    this.transfersService
      .getTransfers(TableUtils.toAllCollectionQuery(tableQueryParams))
      .pipe(
        tap(({ data }) => dispatch(new SetTransfersByIds(data))),
        tap(({ data, meta }) => {
          if (data.length) {
            patchState({
              transfersIds: data.map((t) => t.id),
              meta,
            });
          }
        })
      )
      .subscribe();
  }

  @Action(SetTransfersByIds)
  setAssetsByIds(
    { setState, getState }: StateContext<TransfersStateModel>,
    { transfers }: SetTransfersByIds
  ) {
    const transfersSet = Array.isArray(transfers) ? transfers : [transfers];

    setState(
      patch({
        transfers: transfersSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.id]: value,
          }),
          { ...getState().transfers }
        ),
      })
    );
  }
}
