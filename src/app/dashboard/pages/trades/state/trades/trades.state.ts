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
import { ExchangeResourcesTypes } from '@protokol/nft-client';
import { TradesService } from '@core/services/trades.service';
import {
  TRADES_TYPE_NAME,
  LoadTrades,
  SetTradesByIds,
} from '@app/dashboard/pages/trades/state/trades/trades.actions';

interface TradesStateModel {
  tradesIds: string[];
  trades: { [name: string]: ExchangeResourcesTypes.Trades };
  meta: PaginationMeta | null;
}

const TRADES_DEFAULT_STATE: TradesStateModel = {
  tradesIds: [],
  trades: {},
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
  static getMeta({ meta }: TradesStateModel) {
    return meta;
  }

  static getTradesByIds(tradesIds: string[]) {
    return createSelector([TradesState], ({ trades }: TradesStateModel) => {
      if (!tradesIds.length) {
        return [];
      }

      return tradesIds.map((cId) => trades[cId]);
    });
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
