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
import {
  NzBreakpointService,
  NzMessageService,
  NzModalService,
} from 'ng-zorro-antd';
import { Store } from '@ngxs/store';
import {
  StartManagerProcess,
  StopManagerProcess,
} from '@app/dashboard/pages/nodes/state/manager-processes/manager-processes.actions';
import { MemoryUtils } from '@core/utils/memory-utils';
import { TerminalViewModalComponent } from '@app/dashboard/pages/nodes/components/terminal-view-modal/terminal-view-modal.component';

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
  terminalViewName$ = new BehaviorSubject('');

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

  @ViewChild('assetAttributesModalTitleTpl', { static: true })
  assetAttributesModalTitleTpl!: TemplateRef<{}>;

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

  startProcess({ name }: ProcessListItem) {
    this.setRowLoading(name, true, 'start');

    this.store
      .dispatch(new StartManagerProcess(name, this.managerUrl))
      .pipe(
        untilDestroyed(this),
        tap(
          () => {},
          (err) => {
            this.log.error(err);
            this.nzMessageService.error(`Start process "${name}" failed!`);
          }
        ),
        finalize(() => this.setRowLoading(name, false))
      )
      .subscribe();
  }

  restartProcess({ name }: ProcessListItem) {
    this.setRowLoading(name, true, 'restart');

    this.nodeManagerService
      .processRestart(name)
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

    this.terminalViewName$.next(name);
    this.nzModalService.create({
      nzTitle: this.assetAttributesModalTitleTpl,
      nzContent: TerminalViewModalComponent,
      nzComponentParams: {
        logName: name,
        managerUrl: this.managerUrl,
      },
      nzFooter: null,
      nzWidth: '75vw',
    });
  }
}
