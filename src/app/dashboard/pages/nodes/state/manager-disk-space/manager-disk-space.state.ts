import { Logger } from '@core/services/logger.service';
import {
  State,
  Action,
  StateContext,
  Selector,
  Actions,
  ofActionDispatched,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { NodeManagerService } from '@core/services/node-manager.service';
import { timer } from 'rxjs';
import { exhaustMap, takeUntil, tap } from 'rxjs/operators';
import { InfoDiskSpaceItem } from '@core/interfaces/core-manager.types';
import {
  MANAGER_DISK_SPACE_TYPE_NAME,
  ManagerDiskSpaceStartPooling,
  ManagerDiskSpaceStopPooling,
} from './manager-disk-space.actions';

interface ManagerDiskSpaceStateModel {
  diskSpace: InfoDiskSpaceItem[];
}

const MANAGER_DISK_SPACE_DEFAULT_STATE: ManagerDiskSpaceStateModel = {
  diskSpace: [],
};

@State<ManagerDiskSpaceStateModel>({
  name: MANAGER_DISK_SPACE_TYPE_NAME,
  defaults: { ...MANAGER_DISK_SPACE_DEFAULT_STATE },
})
@Injectable()
export class ManagerDiskSpaceState {
  readonly log = new Logger(this.constructor.name);

  constructor(
    private nodeManagerService: NodeManagerService,
    private actions$: Actions
  ) {}

  @Selector()
  static getManagerDiskSpace({ diskSpace }: ManagerDiskSpaceStateModel) {
    return diskSpace;
  }

  @Action(ManagerDiskSpaceStartPooling)
  managerDiskSpaceStartPooling(
    { patchState }: StateContext<ManagerDiskSpaceStateModel>,
    { managerUrl }: ManagerDiskSpaceStartPooling
  ) {
    timer(0, 60000)
      .pipe(
        exhaustMap(() => {
          return this.nodeManagerService.infoDiskSpace(managerUrl).pipe(
            tap((diskSpace) => {
              patchState({
                diskSpace,
              });
            })
          );
        }),
        takeUntil(
          this.actions$.pipe(ofActionDispatched(ManagerDiskSpaceStopPooling))
        )
      )
      .subscribe();
  }

  @Action(ManagerDiskSpaceStopPooling)
  managerDiskSpaceStopPooling({
    patchState,
  }: StateContext<ManagerDiskSpaceStateModel>) {
    patchState({
      diskSpace: [],
    });
  }
}
