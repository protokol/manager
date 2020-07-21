import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TableColumnConfig } from '@shared/interfaces/table.types';
import { Logger } from '@core/services/logger.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {
  ProcessListItem,
  ProcessStatus,
} from '@core/interfaces/core-manager.types';
import { TextUtils } from '@core/utils/text-utils';
import { NodeManagerService } from '@core/services/node-manager.service';
import { untilDestroyed } from '@core/until-destroyed';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-process-list-table',
  templateUrl: './process-list-table.component.html',
  styleUrls: ['./process-list-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcessListTableComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  rows$: Observable<ProcessListItem[]>;
  rowsLoading$: BehaviorSubject<{
    [name: string]: { isLoading: boolean; type: string };
  }> = new BehaviorSubject({});

  tableColumns: TableColumnConfig<ProcessListItem>[];

  @Input('rows')
  set _rows(rows$: Observable<ProcessListItem[]>) {
    this.rows$ = rows$.pipe(
      tap((rows) => {
        this.rowsLoading$.next(
          rows.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.name]: {
                isLoading: false,
                type: undefined,
              },
            }),
            {}
          )
        );
      })
    );
  }

  @ViewChild('cpuTpl', { static: true }) cpuTpl!: TemplateRef<{
    row: ProcessListItem;
  }>;
  @ViewChild('memoryTpl', { static: true }) memoryTpl!: TemplateRef<{
    row: ProcessListItem;
  }>;
  @ViewChild('statusTpl', { static: true }) statusTpl!: TemplateRef<{
    row: ProcessListItem;
  }>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
    row: ProcessListItem;
  }>;

  constructor(
    private nodeManagerService: NodeManagerService,
    private nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.tableColumns = [
      {
        propertyName: 'name',
        headerName: 'Name',
      },
      {
        headerName: 'Status',
        columnTransformTpl: this.statusTpl,
      },
      {
        headerName: 'CPU',
        columnTransformTpl: this.cpuTpl,
      },
      {
        headerName: 'Memory',
        columnTransformTpl: this.memoryTpl,
      },
      {
        propertyName: 'pid',
        headerName: 'Pid',
      },
      {
        headerName: 'Actions',
        columnTransformTpl: this.actionsTpl,
      },
    ];
  }

  restartProcess(event: MouseEvent, row: ProcessListItem) {
    event.preventDefault();

    this.setRowLoading(row.name, true, 'restart');

    this.nodeManagerService
      .processRestart(row.name)
      .pipe(
        untilDestroyed(this),
        tap(
          () => {},
          (err) => {
            this.log.error(err);
            this.nzMessageService.error(
              `Restart process "${row.name}" failed!`
            );
          }
        ),
        finalize(() => this.setRowLoading(row.name, false))
      )
      .subscribe();
  }

  processStop(event: MouseEvent, row: ProcessListItem) {
    event.preventDefault();

    this.setRowLoading(row.name, true, 'stop');

    this.nodeManagerService
      .processStop(row.name)
      .pipe(
        untilDestroyed(this),
        tap(
          () => {},
          (err) => {
            this.log.error(err);
            this.nzMessageService.error(`Stop process "${row.name}" failed!`);
          }
        ),
        finalize(() => this.setRowLoading(row.name, false))
      )
      .subscribe();
  }

  setRowLoading(processName: string, isLoading: boolean, type?: string) {
    this.rowsLoading$.next({
      ...this.rowsLoading$.getValue(),
      [processName]: {
        isLoading,
        type,
      },
    });
  }

  transformText(status: ProcessStatus) {
    return TextUtils.capitalizeFirst(status);
  }

  startProcess(event: MouseEvent, row: ProcessListItem) {
    event.preventDefault();

    this.setRowLoading(row.name, true, 'start');

    this.nodeManagerService
      .processStart(row.name)
      .pipe(
        untilDestroyed(this),
        tap(
          () => {},
          (err) => {
            this.log.error(err);
            this.nzMessageService.error(`Start process "${row.name}" failed!`);
          }
        ),
        finalize(() => this.setRowLoading(row.name, false))
      )
      .subscribe();
  }

  formatMemory(memory: number) {
    if (!memory) {
      return 0;
    }

    return (memory / 1024).toFixed(2);
  }

  ngOnDestroy(): void {}
}
