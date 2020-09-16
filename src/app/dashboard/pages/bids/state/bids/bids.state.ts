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
import { BidsService } from '@core/services/bids.service';
import {
  BIDS_TYPE_NAME,
  LoadBids,
  SetBidsByIds,
} from '@app/dashboard/pages/bids/state/bids/bids.actions';

interface BidsStateModel {
  bidsIds: string[];
  bids: { [name: string]: ExchangeResourcesTypes.Bids };
  meta: PaginationMeta | null;
}

const BIDS_DEFAULT_STATE: BidsStateModel = {
  bidsIds: [],
  bids: {},
  meta: null,
};

@State<BidsStateModel>({
  name: BIDS_TYPE_NAME,
  defaults: { ...BIDS_DEFAULT_STATE },
})
@Injectable()
export class BidsState {
  readonly log = new Logger(this.constructor.name);

  constructor(private bidsService: BidsService) {}

  @Selector()
  static getBidsIds({ bidsIds }: BidsStateModel) {
    return bidsIds;
  }

  @Selector()
  static getMeta({ meta }: BidsStateModel) {
    return meta;
  }

  static getBidsByIds(bidsIds: string[]) {
    return createSelector([BidsState], ({ bids }: BidsStateModel) => {
      if (!bidsIds.length) {
        return [];
      }

      return bidsIds.map((cId) => bids[cId]);
    });
  }

  @Action(LoadBids)
  loadBids(
    { patchState, dispatch }: StateContext<BidsStateModel>,
    { options: { tableQueryParams, canceled } }: LoadBids
  ) {
    const hasFilters =
      tableQueryParams &&
      tableQueryParams.filter &&
      tableQueryParams.filter.length;
    const loadBids$ = canceled
      ? this.bidsService.canceledBids(
          TableUtils.toTableApiQuery(tableQueryParams)
        )
      : hasFilters
      ? this.bidsService.searchBids(
          TableUtils.toTableApiQuery(tableQueryParams)
        )
      : this.bidsService.getBids(TableUtils.toTableApiQuery(tableQueryParams));

    loadBids$
      .pipe(
        tap(({ data }) => dispatch(new SetBidsByIds(data))),
        tap(({ data, meta }) => {
          patchState({
            bidsIds: data.map((a) => a.id),
            meta,
          });
        })
      )
      .subscribe();
  }

  @Action(SetBidsByIds)
  setBidsByIds(
    { setState, getState }: StateContext<BidsStateModel>,
    { bids }: SetBidsByIds
  ) {
    const bidsSet = Array.isArray(bids) ? bids : [bids];

    setState(
      patch({
        bids: bidsSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.id]: value,
          }),
          { ...getState().bids }
        ),
      })
    );
  }
}
