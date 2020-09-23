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
  GUARDIAN_GROUPS_TYPE_NAME, LoadGuardianGroups,
  SetGuardianGroupsByIds,
  LoadGuardianGroup
} from '@app/dashboard/pages/guardian-groups/state/guardian-groups/guardian-groups.actions';
import { GuardianGroupsService } from '@core/services/guardian-groups.service';

interface GuardianGroupsStateModel {
  guardianGroupIds: string[];
  guardianGroups: { [name: string]: GuardianResourcesTypes.Group };
  meta: PaginationMeta | null;
}

const AUCTIONS_DEFAULT_STATE: GuardianGroupsStateModel = {
  guardianGroupIds: [],
  guardianGroups: {},
  meta: null,
};

@State<GuardianGroupsStateModel>({
  name: GUARDIAN_GROUPS_TYPE_NAME,
  defaults: { ...AUCTIONS_DEFAULT_STATE },
})
@Injectable()
export class GuardianGroupsState {
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

  static getGuardianGroupsByIds(guardianGroupIds: string[]) {
    return createSelector(
      [GuardianGroupsState],
      ({ guardianGroups }: GuardianGroupsStateModel) => {
        if (!guardianGroupIds.length) {
          return [];
        }

        return guardianGroupIds.map((gName) => guardianGroups[gName]);
      }
    );
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
