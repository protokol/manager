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
import { AuctionsService } from '@core/services/auctions.service';
import {
  AUCTIONS_TYPE_NAME,
  LoadAuctions,
  SetAuctionsByIds,
} from './auctions.actions';

interface AuctionsStateModel {
  auctionsIds: string[];
  auctions: { [name: string]: ExchangeResourcesTypes.Auctions };
  meta: PaginationMeta | null;
}

const AUCTIONS_DEFAULT_STATE: AuctionsStateModel = {
  auctionsIds: [],
  auctions: {},
  meta: null,
};

@State<AuctionsStateModel>({
  name: AUCTIONS_TYPE_NAME,
  defaults: { ...AUCTIONS_DEFAULT_STATE },
})
@Injectable()
export class AuctionsState {
  readonly log = new Logger(this.constructor.name);

  constructor(private auctionsService: AuctionsService) {}

  @Selector()
  static getAuctionsIds({ auctionsIds }: AuctionsStateModel) {
    return auctionsIds;
  }

  @Selector()
  static getMeta({ meta }: AuctionsStateModel) {
    return meta;
  }

  static getAuctionsByIds(auctionsIds: string[]) {
    return createSelector(
      [AuctionsState],
      ({ auctions }: AuctionsStateModel) => {
        if (!auctionsIds.length) {
          return [];
        }

        return auctionsIds.map((cId) => auctions[cId]);
      }
    );
  }

  @Action(LoadAuctions)
  loadAuctions(
    { patchState, dispatch }: StateContext<AuctionsStateModel>,
    { options: { tableQueryParams, canceled } }: LoadAuctions
  ) {
    const hasFilters =
      tableQueryParams &&
      tableQueryParams.filter &&
      tableQueryParams.filter.length;
    const loadAuctions$ = canceled
      ? this.auctionsService.getAllCanceledAuctions(
          TableUtils.toTableApiQuery(tableQueryParams)
        )
      : hasFilters
      ? this.auctionsService.searchAuctions(
          TableUtils.toTableApiQuery(tableQueryParams)
        )
      : this.auctionsService.getAuctions(
          TableUtils.toTableApiQuery(tableQueryParams)
        );

    loadAuctions$
      .pipe(
        tap(({ data }) => dispatch(new SetAuctionsByIds(data))),
        tap(({ data, meta }) => {
          patchState({
            auctionsIds: data.map((a) => a.id),
            meta,
          });
        })
      )
      .subscribe();
  }

  @Action(SetAuctionsByIds)
  setAuctionsByIds(
    { setState, getState }: StateContext<AuctionsStateModel>,
    { auctions }: SetAuctionsByIds
  ) {
    const auctionsSet = Array.isArray(auctions) ? auctions : [auctions];

    setState(
      patch({
        auctions: auctionsSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.id]: value,
          }),
          { ...getState().auctions }
        ),
      })
    );
  }
}
