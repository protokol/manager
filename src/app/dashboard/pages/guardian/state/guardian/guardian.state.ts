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
import { GuardianResourcesTypes } from '@protokol/client';
import {
  GUARDIAN_TYPE_NAME, LoadGuardianGroups,
  SetGuardianGroupsByIds,
  LoadGuardianGroup, LoadTransactionTypes, LoadGuardianConfigurations
} from '@app/dashboard/pages/guardian/state/guardian/guardian.actions';
import { GuardianGroupsService } from '@core/services/guardian-groups.service';
import { TransactionTypes } from '@arkecosystem/client';

interface GuardianGroupsStateModel {
  transactionTypes?: TransactionTypes | null;
  guardianConfigurations?: GuardianResourcesTypes.GuardianConfigurations | null;
  guardianGroupIds: string[];
  guardianGroups: { [name: string]: GuardianResourcesTypes.Group };
  meta: PaginationMeta | null;
}

const AUCTIONS_DEFAULT_STATE: GuardianGroupsStateModel = {
  transactionTypes: undefined,
  guardianConfigurations: undefined,
  guardianGroupIds: [],
  guardianGroups: {},
  meta: null,
};

@State<GuardianGroupsStateModel>({
  name: GUARDIAN_TYPE_NAME,
  defaults: { ...AUCTIONS_DEFAULT_STATE },
})
@Injectable()
export class GuardianState {
  readonly log = new Logger(this.constructor.name);

  constructor(private guardianGroupsService: GuardianGroupsService) {}

  @Selector()
  static getGuardianGroupIds({ guardianGroupIds }: GuardianGroupsStateModel) {
    return guardianGroupIds;
  }

  @Selector()
  static getMeta({ meta }: GuardianGroupsStateModel) {
    return meta;
  }

  @Selector()
  static getGuardianGroups({ guardianGroups }: GuardianGroupsStateModel) {
    return guardianGroups;
  }

  @Selector()
  static getTransactionTypes({ transactionTypes }: GuardianGroupsStateModel) {
    return transactionTypes;
  }

  @Selector()
  static getGuardianConfigurations({ guardianConfigurations }: GuardianGroupsStateModel) {
    return guardianConfigurations;
  }

  static getGuardianGroupsByIds(guardianGroupIds: string[]) {
    return createSelector(
      [GuardianState.getGuardianGroups],
      (guardianGroups: ReturnType<typeof GuardianState.getGuardianGroups>) => {
        if (!guardianGroupIds.length) {
          return [];
        }

        return guardianGroupIds.map((gName) => guardianGroups[gName]);
      }
    );
  }

  @Action(LoadTransactionTypes)
  loadTransactionTypes(
    { getState, setState }: StateContext<GuardianGroupsStateModel>
  ) {
    const { transactionTypes } = getState();

    if (!transactionTypes && transactionTypes !== null) {
      setState(
        patch({
          transactionTypes: null
        })
      );

      this.guardianGroupsService
        .getTransactionTypes()
        .pipe(
          tap(
            (data) => {
              setState(
                patch({
                  transactionTypes: data
                })
              );
            },
            () => {
              setState(
                patch({
                  transactionTypes: undefined
                })
              );
            }
          )
        )
        .subscribe();
    }
  }

  @Action(LoadGuardianConfigurations)
  loadGuardianConfigurations(
    { getState, setState }: StateContext<GuardianGroupsStateModel>
  ) {
    const { guardianConfigurations } = getState();

    if (!guardianConfigurations && guardianConfigurations !== null) {
      setState(
        patch({
          guardianConfigurations: null
        })
      );

      this.guardianGroupsService
        .getConfiguration()
        .pipe(
          tap(
            (data) => {
              setState(
                patch({
                  guardianConfigurations: data
                })
              );
            },
            () => {
              setState(
                patch({
                  guardianConfigurations: undefined
                })
              );
            }
          )
        )
        .subscribe();
    }
  }

  @Action(LoadGuardianGroup)
  loadGuardianGroup(
    { setState, dispatch }: StateContext<GuardianGroupsStateModel>,
    { groupName }: LoadGuardianGroup
  ) {
    return this.guardianGroupsService.getGroup(groupName).pipe(
      tap(
        (data) => dispatch(new SetGuardianGroupsByIds(data)),
        () => {
          setState(
            patch({
              guardianGroups: patch({ [groupName]: undefined })
            })
          );
        }
      )
    );
  }

  @Action(LoadGuardianGroups)
  loadGuardianGroups(
    { patchState, dispatch }: StateContext<GuardianGroupsStateModel>
  ) {
    this.guardianGroupsService.getGroups()
      .pipe(
        tap(({ data }) => dispatch(new SetGuardianGroupsByIds(data))),
        tap(({ data, meta }) => {
          patchState({
            guardianGroupIds: data.map((g) => g.name),
            meta,
          });
        })
      )
      .subscribe();
  }

  @Action(SetGuardianGroupsByIds)
  setGuardianGroupsByIds(
    { setState, getState }: StateContext<GuardianGroupsStateModel>,
    { groups }: SetGuardianGroupsByIds
  ) {
    const groupsSet = Array.isArray(groups) ? groups : [groups];

    setState(
      patch({
        guardianGroups: groupsSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.name]: value,
          }),
          { ...getState().guardianGroups }
        ),
      })
    );
  }
}
