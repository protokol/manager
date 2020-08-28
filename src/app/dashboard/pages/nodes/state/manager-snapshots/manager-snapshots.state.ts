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
import { patch, removeItem } from '@ngxs/store/operators';
import { NodeManagerService } from '@core/services/node-manager.service';
import {
  LoadManagerSnapshots,
  MANAGER_SNAPSHOTS_TYPE_NAME,
  ManagerCreateSnapshot,
  ManagerDeleteSnapshot,
  ManagerRestoreSnapshot,
  SetManagerSnapshotsByIds,
} from './manager-snapshots.actions';
import { SnapshotsListItem } from '@core/interfaces/core-manager.types';

interface ManagerSnapshotsStateModel {
  managerSnapshotsIds: string[];
  managerSnapshots: { [name: string]: SnapshotsListItem };
}

const MANAGER_SNAPSHOTS_DEFAULT_STATE: ManagerSnapshotsStateModel = {
  managerSnapshotsIds: [],
  managerSnapshots: {},
};

@State<ManagerSnapshotsStateModel>({
  name: MANAGER_SNAPSHOTS_TYPE_NAME,
  defaults: { ...MANAGER_SNAPSHOTS_DEFAULT_STATE },
})
@Injectable()
export class ManagerSnapshotsState {
  readonly log = new Logger(this.constructor.name);

  constructor(private nodeManagerService: NodeManagerService) {}

  @Selector()
  static getManagerSnapshotsIds({
    managerSnapshotsIds,
  }: ManagerSnapshotsStateModel) {
    return managerSnapshotsIds;
  }

  @Selector()
  static getManagerSnapshots({ managerSnapshots }: ManagerSnapshotsStateModel) {
    return managerSnapshots;
  }

  static getManagerSnapshotsByIds(managerSnapshotsIds: string[]) {
    return createSelector(
      [ManagerSnapshotsState.getManagerSnapshots],
      (
        managerSnapshots: ReturnType<
          typeof ManagerSnapshotsState.getManagerSnapshots
        >
      ) => {
        if (!managerSnapshotsIds.length) {
          return [];
        }

        return managerSnapshotsIds.map((cId) => managerSnapshots[cId]);
      }
    );
  }

  @Action(LoadManagerSnapshots)
  loadManagerSnapshots(
    { patchState, dispatch }: StateContext<ManagerSnapshotsStateModel>,
    { managerUrl }: LoadManagerSnapshots
  ) {
    return this.nodeManagerService.snapshotsList(managerUrl).pipe(
      tap((snapshots = []) =>
        dispatch(new SetManagerSnapshotsByIds(snapshots))
      ),
      tap((snapshots = []) => {
        patchState({
          managerSnapshotsIds: snapshots.map((p) => p.name),
        });
      })
    );
  }

  @Action(SetManagerSnapshotsByIds)
  setManagerSnapshotsByIds(
    { setState }: StateContext<ManagerSnapshotsStateModel>,
    { snapshots }: SetManagerSnapshotsByIds
  ) {
    const managerSnapshotsSet = Array.isArray(snapshots)
      ? snapshots
      : [snapshots];

    setState(
      patch({
        managerSnapshots: patch(
          managerSnapshotsSet.reduce(
            (acc, value) => ({
              ...acc,
              [value.name]: value,
            }),
            {}
          )
        ),
      })
    );
  }

  @Action(ManagerCreateSnapshot)
  managerCreateSnapshot(
    {}: StateContext<ManagerSnapshotsStateModel>,
    { payload, managerUrl }: ManagerCreateSnapshot
  ) {
    return this.nodeManagerService.snapshotsCreate(payload, managerUrl);
  }

  @Action(ManagerRestoreSnapshot)
  managerRestoreSnapshot(
    {}: StateContext<ManagerSnapshotsStateModel>,
    { payload, managerUrl }: ManagerRestoreSnapshot
  ) {
    return this.nodeManagerService.snapshotsRestore(payload, managerUrl);
  }

  @Action(ManagerDeleteSnapshot)
  managerDeleteSnapshot(
    { setState }: StateContext<ManagerSnapshotsStateModel>,
    { snapshotName, managerUrl }: ManagerDeleteSnapshot
  ) {
    return this.nodeManagerService
      .snapshotDelete(snapshotName, managerUrl)
      .pipe(
        tap(() => {
          setState(
            patch({
              managerSnapshotsIds: removeItem<string>(
                (id) => id === snapshotName
              ),
            })
          );
        })
      );
  }
}
