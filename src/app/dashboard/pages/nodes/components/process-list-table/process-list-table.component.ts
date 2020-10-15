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
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import {
  ProcessListItem,
  ProcessStatus,
} from '@core/interfaces/core-manager.types';
import { TextUtils } from '@core/utils/text-utils';
import { NodeManagerService } from '@core/services/node-manager.service';
import { untilDestroyed } from '@core/until-destroyed';
import { Store } from '@ngxs/store';
import {
  StartManagerProcess,
  StopManagerProcess,
} from '@app/dashboard/pages/nodes/state/manager-processes/manager-processes.actions';
import { MemoryUtils } from '@core/utils/memory-utils';
import { TerminalViewModalComponent } from '@app/dashboard/pages/nodes/components/terminal-view-modal/terminal-view-modal.component';
import { ArgsModalComponent } from '@app/dashboard/pages/nodes/components/args-modal/args-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';
import { NzMessageService } from 'ng-zorro-antd/message';

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
  isXxlScreen$ = new BehaviorSubject(true);

  tableColumns: TableColumnConfig<ProcessListItem>[];

  @Input() managerUrl;

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
    private nzMessageService: NzMessageService,
    private store: Store,
    private nzModalService: NzModalService,
    private nzBreakpointService: NzBreakpointService
  ) {
    this.nzBreakpointService
      .subscribe({
        xs: '(max-width: 575px)',
        sm: '(min-width: 576px)',
        md: '(min-width: 768px)',
        lg: '(min-width: 992px)',
        xl: '(min-width: 1200px)',
        xxl: '(min-width: 1600px)',
      })
      .pipe(
        untilDestroyed(this),
        tap((breakpoint) => {
          switch (breakpoint) {
            case 'xs':
            case 'sm':
            case 'md':
            case 'lg':
            case 'xl':
              return this.isXxlScreen$.next(false);
            default:
              return this.isXxlScreen$.next(true);
          }
        })
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.tableColumns = [
      {
        propertyName: 'name',
        headerName: 'Name',
        width: '120px',
      },
      {
        headerName: 'Status',
        columnTransformTpl: this.statusTpl,
        width: '150px',
      },
      {
        headerName: 'CPU',
        columnTransformTpl: this.cpuTpl,
        width: '80px',
      },
      {
        headerName: 'Memory',
        columnTransformTpl: this.memoryTpl,
        width: '200px',
      },
      {
        propertyName: 'pid',
        headerName: 'Pid',
      },
      {
        headerName: 'Actions',
        columnTransformTpl: this.actionsTpl,
        width: 'auto',
      },
    ];
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

  startProcess(
    event: MouseEvent,
    { name }: ProcessListItem,
    argsProcessStartModalTitleTpl: TemplateRef<{}>
  ) {
    event.preventDefault();

    this.setRowLoading(name, true, 'start');

    const complete$ = (args) =>
      this.store
        .dispatch(new StartManagerProcess(name, args, this.managerUrl))
        .pipe(
          untilDestroyed(this),
          tap(() => {
            this.nzMessageService.success(`Process "${name}" started!`);
          }),
          catchError((err) => {
            this.log.error(err);
            this.nzMessageService.error(`Process start "${name}" failed!`);
            return of(null);
          }),
          finalize(() => this.setRowLoading(name, false))
        );

    this.nzModalService.create({
      nzTitle: argsProcessStartModalTitleTpl,
      nzContent: ArgsModalComponent,
      nzComponentParams: {
        complete$,
      },
      nzFooter: null,
      nzWidth: '35vw',
    });
  }

  restartProcess({ name }: ProcessListItem) {
    this.setRowLoading(name, true, 'restart');

    this.nodeManagerService
      .processRestart(name, this.managerUrl)
      .pipe(
        untilDestroyed(this),
        tap(
          () => {},
          (err) => {
            this.log.error(err);
            this.nzMessageService.error(`Restart process "${name}" failed!`);
          }
        ),
        finalize(() => this.setRowLoading(name, false))
      )
      .subscribe();
  }

  processStop({ name }: ProcessListItem) {
    this.setRowLoading(name, true, 'stop');

    this.store
      .dispatch(new StopManagerProcess(name, this.managerUrl))
      .pipe(
        untilDestroyed(this),
        tap(
          () => {},
          (err) => {
            this.log.error(err);
            this.nzMessageService.error(`Stop process "${name}" failed!`);
          }
        ),
        finalize(() => this.setRowLoading(name, false))
      )
      .subscribe();
  }

  formatMemory(memory: number) {
    return MemoryUtils.toMb(memory);
  }

  ngOnDestroy(): void {}

  logProcess(event: MouseEvent, { name }: ProcessListItem) {
    event.preventDefault();

    this.nzModalService.create({
      nzContent: TerminalViewModalComponent,
      nzComponentParams: {
        logName: name,
        managerUrl: this.managerUrl,
        header: `Log process ${name}`
      },
      nzWidth: '75vw',
      nzFooter: null,
    });
  }
}
