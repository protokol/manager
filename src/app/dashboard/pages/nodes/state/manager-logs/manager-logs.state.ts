import { Logger } from '@core/services/logger.service';
import {
  State,
  Action,
  StateContext,
  Selector,
  createSelector,
  Actions,
  Store,
  ofActionDispatched,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { NodeManagerService } from '@core/services/node-manager.service';
import {
  MANAGER_LOGS_TYPE_NAME,
  ManagerLogsStartPooling,
  ManagerLogsStopPooling,
} from './manager-logs.actions';
import { insertItem, patch } from '@ngxs/store/operators';
import { of, timer } from 'rxjs';
import { exhaustMap, takeUntil, tap } from 'rxjs/operators';

export interface LogListItem {
  from: number;
  to: number;
  lines: string;
}

interface LogEntity {
  fetchedTotalLines: number;
  totalLines: number;
  linesCollection: LogListItem[];
}

interface ManagerLogsStateModel {
  managerLogs: { [logName: string]: LogEntity };
}

const MANAGER_LOGS_DEFAULT_STATE: ManagerLogsStateModel = {
  managerLogs: {},
};

@State<ManagerLogsStateModel>({
  name: MANAGER_LOGS_TYPE_NAME,
  defaults: { ...MANAGER_LOGS_DEFAULT_STATE },
})
@Injectable()
export class ManagerLogsState {
  readonly log = new Logger(this.constructor.name);

  constructor(
    private nodeManagerService: NodeManagerService,
    private actions$: Actions,
    private store: Store
  ) {}

  @Selector()
  static getManagerLogs({ managerLogs }: ManagerLogsStateModel) {
    return managerLogs;
  }

  static getManagerLog(logName: string) {
    return createSelector(
      [ManagerLogsState.getManagerLogs],
      (
        managerLogs: ReturnType<typeof ManagerLogsState.getManagerLogs>
      ): LogEntity => {
        if (managerLogs.hasOwnProperty(logName)) {
          return managerLogs[logName];
        }
        return undefined;
      }
    );
  }

  static getManagerLogTotalLines(logName: string) {
    return createSelector(
      [ManagerLogsState.getManagerLog(logName)],
      (
        { totalLines, fetchedTotalLines }: Partial<LogEntity> = {
          totalLines: -1,
          fetchedTotalLines: -1,
        }
      ): { totalLines: number; fetchedTotalLines: number } => {
        return { totalLines, fetchedTotalLines };
      }
    );
  }

  static hasManagerLogRange(logName: string, from: number, to: number) {
    return createSelector(
      [ManagerLogsState.getManagerLog(logName)],
      (
        { linesCollection }: Partial<LogEntity> = { linesCollection: [] }
      ): boolean => {
        if (linesCollection.length) {
          return linesCollection.some((c) => c.from === from && c.to === to);
        }
        return false;
      }
    );
  }

  static getLogs(logName: string) {
    return createSelector(
      [ManagerLogsState.getManagerLog(logName)],
      (
        { linesCollection }: Partial<LogEntity> = { linesCollection: [] }
      ): LogListItem[] => {
        return linesCollection;
      }
    );
  }

  @Action(ManagerLogsStartPooling)
  managerLogsStartPooling(
    { setState }: StateContext<ManagerLogsStateModel>,
    { logName: name, managerUrl }: ManagerLogsStartPooling
  ) {
    setState(
      patch({
        managerLogs: patch({
          [name]: {
            totalLines: -1,
            fetchedTotalLines: -1,
            linesCollection: [],
          } as LogEntity,
        }),
      })
    );

    timer(0, 3000)
      .pipe(
        // Check if there are any new lines available
        exhaustMap(() => {
          return this.nodeManagerService.logLog({ name }, managerUrl).pipe(
            tap(({ totalLines }) => {
              setState(
                patch({
                  managerLogs: patch({
                    [name]: patch({
                      totalLines,
                    }),
                  }),
                })
              );
            })
          );
        }),
        // Fetch new lines when available
        exhaustMap(() => {
          const { totalLines, fetchedTotalLines } = this.store.selectSnapshot(
            ManagerLogsState.getManagerLogTotalLines(name)
          );

          if (totalLines <= 0) {
            return of({});
          }

          const fromLine = (() => {
            if (fetchedTotalLines <= 0) {
              return totalLines > 100 ? totalLines - 100 : 1;
            }
            return fetchedTotalLines;
          })();
          const range = (() => {
            if (fetchedTotalLines <= 0) {
              return totalLines > 100 ? 100 : totalLines;
            }
            return totalLines - fetchedTotalLines;
          })();

          const isItemInCollection = this.store.selectSnapshot(
            ManagerLogsState.hasManagerLogRange(
              name,
              fromLine,
              fromLine + range
            )
          );
          if (isItemInCollection || range <= 0) {
            return of({});
          }

          return this.nodeManagerService
            .logLog(
              {
                name,
                fromLine,
                range,
              },
              managerUrl
            )
            .pipe(
              tap(({ lines }) => {
                setState(
                  patch({
                    managerLogs: patch({
                      [name]: patch({
                        fetchedTotalLines: totalLines,
                        linesCollection: insertItem<LogListItem>({
                          from: fromLine,
                          to: fromLine + range,
                          lines,
                        }),
                      }),
                    }),
                  })
                );
              })
            );
        }),
        takeUntil(
          this.actions$.pipe(ofActionDispatched(ManagerLogsStopPooling))
        )
      )
      .subscribe();
  }

  @Action(ManagerLogsStopPooling)
  managerLogsStopPooling(
    { setState }: StateContext<ManagerLogsStateModel>,
    { logName }: ManagerLogsStopPooling
  ) {
    setState(
      patch({
        managerLogs: patch({
          [logName]: patch({}),
        }),
      })
    );
  }
}
