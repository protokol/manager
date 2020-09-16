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
import { ExchangeResourcesTypes } from '@protokol/client';
import { TradesService } from '@core/services/trades.service';
import {
  TRADES_TYPE_NAME,
  LoadTrades,
  SetTradesByIds,
  LoadTrade,
} from '@app/dashboard/pages/trades/state/trades/trades.actions';

interface TradesStateModel {
  tradesIds: string[];
  trades: { [name: string]: ExchangeResourcesTypes.Trades };
  tradeDetails: { [name: string]: ExchangeResourcesTypes.TradeById };
  meta: PaginationMeta | null;
}

const TRADES_DEFAULT_STATE: TradesStateModel = {
  tradesIds: [],
  trades: {},
  tradeDetails: {},
  meta: null,
};

@State<TradesStateModel>({
  name: TRADES_TYPE_NAME,
  defaults: { ...TRADES_DEFAULT_STATE },
})
@Injectable()
export class TradesState {
  readonly log = new Logger(this.constructor.name);

  constructor(private tradesService: TradesService) {}

  @Selector()
  static getTradesIds({ tradesIds }: TradesStateModel) {
    return tradesIds;
  }

  @Selector()
  static getTrades({ trades }: TradesStateModel) {
    return trades;
  }

  @Selector()
  static getTradeDetails({ tradeDetails }: TradesStateModel) {
    return tradeDetails;
  }

  @Selector()
  static getMeta({ meta }: TradesStateModel) {
    return meta;
  }

  static getTradesByIds(tradesIds: string[]) {
    return createSelector(
      [TradesState.getTrades],
      (trades: ReturnType<typeof TradesState.getTrades>) => {
        if (!tradesIds.length) {
          return [];
        }

        return tradesIds.map((cId) => trades[cId]);
      }
    );
  }

  static getTradeDetailsByIds(tradesIds: string[]) {
    return createSelector(
      [TradesState.getTradeDetails],
      (tradeDetails: ReturnType<typeof TradesState.getTrades>) => {
        if (!tradesIds.length) {
          return [];
        }

        return tradesIds.map((cId) => tradeDetails[cId]);
      }
    );
  }

  @Action(LoadTrade)
  loadTrade(
    { getState, setState }: StateContext<TradesStateModel>,
    { tradeId }: LoadTrade
  ) {
    const trade = getState().tradeDetails[tradeId];

    if (!trade && trade !== null) {
      setState(
        patch({
          tradeDetails: patch({ [tradeId]: null }),
        })
      );

      this.tradesService
        .getTrade(tradeId)
        .pipe(
          tap(
            (data) => {
              setState(
                patch({
                  tradeDetails: patch({ [tradeId]: data }),
                })
              );
            },
            () => {
              setState(
                patch({
                  tradeDetails: patch({ [tradeId]: undefined }),
                })
              );
            }
          )
        )
        .subscribe();
    }
  }

  @Action(LoadTrades)
  loadTrades(
    { patchState, dispatch }: StateContext<TradesStateModel>,
    { tableQueryParams }: LoadTrades
  ) {
    const hasFilters =
      tableQueryParams &&
      tableQueryParams.filter &&
      tableQueryParams.filter.length;
    const loadTrades$ = hasFilters
      ? this.tradesService.searchTrades(
          TableUtils.toTableApiQuery(tableQueryParams)
        )
      : this.tradesService.getTrades(
          TableUtils.toTableApiQuery(tableQueryParams)
        );

    loadTrades$
      .pipe(
        tap(({ data }) => dispatch(new SetTradesByIds(data))),
        tap(({ data, meta }) => {
          patchState({
            tradesIds: data.map((a) => a.id),
            meta,
          });
        })
      )
      .subscribe();
  }

  @Action(SetTradesByIds)
  setTradesByIds(
    { setState, getState }: StateContext<TradesStateModel>,
    { trades }: SetTradesByIds
  ) {
    const tradesSet = Array.isArray(trades) ? trades : [trades];

    setState(
      patch({
        trades: tradesSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.id]: value,
          }),
          { ...getState().trades }
        ),
      })
    );
  }
}
