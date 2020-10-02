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
  GUARDIAN_TYPE_NAME,
  LoadGuardianGroups,
  SetGuardianGroupsByIds,
  LoadGuardianGroup,
  LoadTransactionTypes,
  LoadGuardianConfigurations,
  SetGuardianUsersByIds,
  LoadGuardianUsers,
  LoadGuardianUser,
  LoadGuardianUserGroups,
  GuardianUserLoadOptions,
  LoadGuardianGroupUsers,
  ClearGuardianGroupUsers
} from '@app/dashboard/pages/guardian/state/guardian/guardian.actions';
import { GuardianGroupsService } from '@core/services/guardian-groups.service';
import { TransactionTypes } from '@arkecosystem/client';
import { GuardianUsersService } from '@core/services/guardian-users.service';
import { GuardianUserExtended } from '@app/dashboard/pages/guardian/interfaces/guardian.types';
import { EMPTY } from 'rxjs';

interface GuardianGroupsStateModel {
  transactionTypes?: TransactionTypes | null;
  configurations?: GuardianResourcesTypes.GuardianConfigurations | null;
  groupIds: string[];
  groups: { [name: string]: GuardianResourcesTypes.Group };
  groupsMeta: PaginationMeta | null;
  userPubKeys: string[];
  users: { [pubKey: string]: GuardianResourcesTypes.User };
  userGroups: { [pubKey: string]: GuardianResourcesTypes.Group[] };
  usersMeta: PaginationMeta | null;
  groupUsers: { [name: string]: string[] };
}

const AUCTIONS_DEFAULT_STATE: GuardianGroupsStateModel = {
  transactionTypes: undefined,
  configurations: undefined,
  groupIds: [],
  groups: {},
  groupsMeta: null,
  userPubKeys: [],
  users: {},
  userGroups: {},
  usersMeta: null,
  groupUsers: {}
};

@State<GuardianGroupsStateModel>({
  name: GUARDIAN_TYPE_NAME,
  defaults: { ...AUCTIONS_DEFAULT_STATE },
})
@Injectable()
export class GuardianState {
  readonly log = new Logger(this.constructor.name);

  constructor(private guardianGroupsService: GuardianGroupsService, private guardianUsersService: GuardianUsersService) {}

  @Selector()
  static getTransactionTypes({ transactionTypes }: GuardianGroupsStateModel) {
    return transactionTypes;
  }

  @Selector()
  static getGuardianConfigurations({ configurations }: GuardianGroupsStateModel) {
    return configurations;
  }

  @Selector()
  static getGuardianGroupIds({ groupIds }: GuardianGroupsStateModel) {
    return groupIds;
  }

  @Selector()
  static getGuardianGroupsMeta({ groupsMeta }: GuardianGroupsStateModel) {
    return groupsMeta;
  }

  @Selector()
  static getGuardianGroups({ groups }: GuardianGroupsStateModel) {
    return groups;
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

  @Selector()
  static getGuardianUserPubKeys({ userPubKeys }: GuardianGroupsStateModel) {
    return userPubKeys;
  }

  @Selector()
  static getGuardianUsersMeta({ usersMeta }: GuardianGroupsStateModel) {
    return usersMeta;
  }

  @Selector()
  static getGuardianUsers({ users }: GuardianGroupsStateModel) {
    return users;
  }

  @Selector()
  static getGuardianUsersGroups({ userGroups }: GuardianGroupsStateModel) {
    return userGroups;
  }

  static getGuardianUsersByPubKeys(
    guardianUserPubKeys: string[],
    { withGroups }: GuardianUserLoadOptions = { withGroups: false }
  ) {
    return createSelector(
      [
        GuardianState.getGuardianUsers,
        GuardianState.getGuardianUsersGroups
      ],
      (
        guardianUsers: ReturnType<typeof GuardianState.getGuardianUsers>,
        guardianUsersGroups: ReturnType<typeof GuardianState.getGuardianUsersGroups>
      ): GuardianUserExtended[] => {
        if (!guardianUserPubKeys.length) {
          return [];
        }

        return guardianUserPubKeys.map((pubKey) => {
          const user = guardianUsers[pubKey];
          if (!user) {
            return null;
          }

          if (withGroups) {
            return Object.assign({}, user, {
              _groups: guardianUsersGroups.hasOwnProperty(pubKey)
                ? guardianUsersGroups[pubKey]
                : null,
            });
          }
          return user;
        });
      }
    );
  }

  @Selector()
  static getGuardianGroupUsers({ groupUsers }: GuardianGroupsStateModel) {
    return groupUsers;
  }

  static getGuardianGroupUsersByGroupName(groupName: string) {
    return createSelector(
      [GuardianState.getGuardianGroupUsers],
      (groupUsers: ReturnType<typeof GuardianState.getGuardianGroupUsers>) => {
        const users = groupUsers[groupName];
        if (!Array.isArray(users)) {
          return null;
        }

        return users;
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

      return this.guardianGroupsService
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
        );
    }
    return EMPTY;
  }

  @Action(LoadGuardianConfigurations)
  loadGuardianConfigurations(
    { getState, setState }: StateContext<GuardianGroupsStateModel>
  ) {
    const { configurations } = getState();

    if (!configurations && configurations !== null) {
      setState(
        patch({
          configurations: null
        })
      );

      this.guardianGroupsService
        .getConfiguration()
        .pipe(
          tap(
            (data) => {
              setState(
                patch({
                  configurations: data
                })
              );
            },
            () => {
              setState(
                patch({
                  configurations: undefined
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
              groups: patch({ [groupName]: undefined })
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
            groupIds: data.map((g) => g.name),
            groupsMeta: meta,
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
        groups: groupsSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.name]: value,
          }),
          { ...getState().groups }
        ),
      })
    );
  }

  @Action(LoadGuardianUser)
  loadGuardianUser(
    { setState, dispatch }: StateContext<GuardianGroupsStateModel>,
    { publicKey }: LoadGuardianUser
  ) {
    return this.guardianUsersService.getUser(publicKey).pipe(
      tap(
        (data) => dispatch(new SetGuardianUsersByIds(data)),
        () => {
          setState(
            patch({
              users: patch({ [publicKey]: undefined })
            })
          );
        }
      )
    );
  }

  @Action(LoadGuardianUsers)
  loadGuardianUsers(
    { patchState, dispatch }: StateContext<GuardianGroupsStateModel>,
    { options: { withGroups } }: LoadGuardianUsers
  ) {
    this.guardianUsersService.getUsers()
      .pipe(
        tap(({ data }) => dispatch(new SetGuardianUsersByIds(data))),
        tap(({ data, meta }) => {
          patchState({
            userPubKeys: data.map((g) => g.publicKey),
            usersMeta: meta
          });
        }),
        tap(({ data }) => {
          if (withGroups) {
            data.forEach(({ publicKey }) => {
              dispatch(new LoadGuardianUserGroups(publicKey));
            });
          }
        })
      )
      .subscribe();
  }

  @Action(SetGuardianUsersByIds)
  setGuardianUsersByIds(
    { setState, getState }: StateContext<GuardianGroupsStateModel>,
    { users }: SetGuardianUsersByIds
  ) {
    const usersSet = Array.isArray(users) ? users : [users];

    setState(
      patch({
        users: usersSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.publicKey]: value
          }),
          { ...getState().users }
        )
      })
    );
  }

  @Action(LoadGuardianUserGroups)
  loadGuardianUserGroups(
    { setState }: StateContext<GuardianGroupsStateModel>,
    { publicKey }: LoadGuardianUserGroups
  ) {
    return this.guardianUsersService.getUserPermissions(publicKey).pipe(
      tap(
        (data) => {
          setState(
            patch({
              userGroups: patch({ [publicKey]: data })
            })
          );
        },
        () => {
          setState(
            patch({
              userGroups: patch({ [publicKey]: undefined })
            })
          );
        }
      )
    );
  }

  @Action(ClearGuardianGroupUsers)
  clearGuardianGroupUsers(
    { setState }: StateContext<GuardianGroupsStateModel>,
    { groupName }: ClearGuardianGroupUsers
  ) {
    setState(
      patch({
        groupUsers: patch({ [groupName]: null })
      })
    );
  }

  @Action(LoadGuardianGroupUsers)
  loadGuardianGroupUsers(
    { setState, dispatch }: StateContext<GuardianGroupsStateModel>,
    { groupName }: LoadGuardianGroupUsers
  ) {
    return this.guardianUsersService.getGroupUsers(groupName).pipe(
      tap(
        (data) => {
          dispatch(new SetGuardianUsersByIds(data));

          setState(
            patch({
              groupUsers: patch({ [groupName]: data.map(({ publicKey }) => publicKey) })
            })
          );
        },
        () => {
          setState(
            patch({
              groupUsers: patch({ [groupName]: undefined })
            })
          );
        }
      )
    );
  }
}
