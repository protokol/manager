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
import { ProcessListItem } from '@core/interfaces/core-manager.types';
import {
  LoadManagerProcesses,
  MANAGER_PROCESSES_TYPE_NAME,
  RestartManagerProcess,
  SetManagerProcessesByIds,
  StartManagerProcess,
  StopManagerProcess,
} from '@app/dashboard/pages/nodes/state/manager-processes/manager-processes.actions';
import { NodeManagerService } from '@core/services/node-manager.service';

interface ManagerProcessesStateModel {
  managerProcessesIds: string[];
  managerProcesses: { [name: string]: ProcessListItem };
}

const MANAGER_PROCESSES_DEFAULT_STATE: ManagerProcessesStateModel = {
  managerProcessesIds: [],
  managerProcesses: {},
};

@State<ManagerProcessesStateModel>({
  name: MANAGER_PROCESSES_TYPE_NAME,
  defaults: { ...MANAGER_PROCESSES_DEFAULT_STATE },
})
@Injectable()
export class ManagerProcessesState {
  readonly log = new Logger(this.constructor.name);

  constructor(private nodeManagerService: NodeManagerService) {}

  @Selector()
  static getManagerProcessesIds({
    managerProcessesIds,
  }: ManagerProcessesStateModel) {
    return managerProcessesIds;
  }

  @Selector()
  static getManagerProcesses({ managerProcesses }: ManagerProcessesStateModel) {
    return managerProcesses;
  }

  static getManagerProcessesByIds(managerProcessesIds: string[]) {
    return createSelector(
      [ManagerProcessesState.getManagerProcesses],
      (
        managerProcesses: ReturnType<
          typeof ManagerProcessesState.getManagerProcesses
        >
      ) => {
        if (!managerProcessesIds.length) {
          return [];
        }

        return managerProcessesIds.map((cId) => managerProcesses[cId]);
      }
    );
  }

  @Action(LoadManagerProcesses)
  loadManagerProcesses(
    { patchState, dispatch }: StateContext<ManagerProcessesStateModel>,
    { managerUrl }: LoadManagerProcesses
  ) {
    return this.nodeManagerService.processList(managerUrl).pipe(
      tap((processes) => dispatch(new SetManagerProcessesByIds(processes))),
      tap((processes) => {
        patchState({
          managerProcessesIds: processes.map((p) => p.name),
        });
      })
    );
  }

  @Action(StartManagerProcess)
  startManagerProcess(
    { setState, dispatch }: StateContext<ManagerProcessesStateModel>,
    { processName, args, managerUrl }: StartManagerProcess
  ) {
    return this.nodeManagerService
      .processStart(processName, args, managerUrl)
      .pipe(
        tap(
          (process) => dispatch(new SetManagerProcessesByIds(process)),
          () => {
            setState(
              patch({
                managerProcesses: patch({ [processName]: undefined }),
              })
            );
          }
        )
      );
  }

  @Action(RestartManagerProcess)
  restartManagerProcess(
    { setState, dispatch }: StateContext<ManagerProcessesStateModel>,
    { processName, managerUrl }: RestartManagerProcess
  ) {
    return this.nodeManagerService.processRestart(processName, managerUrl).pipe(
      tap(
        (process) => dispatch(new SetManagerProcessesByIds(process)),
        () => {
          setState(
            patch({
              managerProcesses: patch({ [processName]: undefined }),
            })
          );
        }
      )
    );
  }

  @Action(StopManagerProcess)
  stopManagerProcess(
    { setState, dispatch }: StateContext<ManagerProcessesStateModel>,
    { processName, managerUrl }: StopManagerProcess
  ) {
    return this.nodeManagerService.processStop(processName, managerUrl).pipe(
      tap(
        (process) => dispatch(new SetManagerProcessesByIds(process)),
        () => {
          setState(
            patch({
              managerProcesses: patch({ [processName]: undefined }),
            })
          );
        }
      )
    );
  }

  @Action(SetManagerProcessesByIds)
  setManagerProcessesByIds(
    { setState }: StateContext<ManagerProcessesStateModel>,
    { processes }: SetManagerProcessesByIds
  ) {
    const managerProcessesSet = Array.isArray(processes)
      ? processes
      : [processes];

    setState(
      patch({
        managerProcesses: patch(
          managerProcessesSet.reduce(
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
}
