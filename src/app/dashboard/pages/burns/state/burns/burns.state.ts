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
import { BURNS_TYPE_NAME, LoadBurns, SetBurnsByIds } from './burns.actions';
import { BurnsService } from '@core/services/burns.service';

interface BurnsStateModel {
  burnsIds: string[];
  burns: { [name: string]: BaseResourcesTypes.Burns };
  meta: PaginationMeta | null;
}

const BURNS_DEFAULT_STATE: BurnsStateModel = {
  burnsIds: [],
  burns: {},
  meta: null,
};

@State<BurnsStateModel>({
  name: BURNS_TYPE_NAME,
  defaults: { ...BURNS_DEFAULT_STATE },
})
@Injectable()
export class BurnsState {
  readonly log = new Logger(this.constructor.name);

  constructor(private burnsService: BurnsService) {}

  @Selector()
  static getBurnsIds({ burnsIds }: BurnsStateModel) {
    return burnsIds;
  }

  @Selector()
  static getMeta({ meta }: BurnsStateModel) {
    return meta;
  }

  static getBurnsByIds(burnsIds: string[]) {
    return createSelector([BurnsState], ({ burns }: BurnsStateModel) => {
      if (!burnsIds.length) {
        return [];
      }

      return burnsIds.map((cId) => burns[cId]);
    });
  }

  @Action(LoadBurns)
  loadBurns(
    { patchState, dispatch }: StateContext<BurnsStateModel>,
    { tableQueryParams }: LoadBurns
  ) {
    this.burnsService
      .getBurns(TableUtils.toTableApiQuery(tableQueryParams))
      .pipe(
        tap(({ data }) => dispatch(new SetBurnsByIds(data))),
        tap(({ data, meta }) => {
          if (data.length) {
            patchState({
              burnsIds: data.map((t) => t.id),
              meta,
            });
          }
        })
      )
      .subscribe();
  }

  @Action(SetBurnsByIds)
  setBurnsByIds(
    { setState, getState }: StateContext<BurnsStateModel>,
    { burns }: SetBurnsByIds
  ) {
    const burnsSet = Array.isArray(burns) ? burns : [burns];

    setState(
      patch({
        burns: burnsSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.id]: value,
          }),
          { ...getState().burns }
        ),
      })
    );
  }
}
