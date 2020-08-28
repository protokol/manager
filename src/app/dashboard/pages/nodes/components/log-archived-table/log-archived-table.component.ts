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
import { LogArchivedItem } from '@core/interfaces/core-manager.types';
import { Logger } from '@core/services/logger.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { finalize, tap } from 'rxjs/operators';
import { NodeManagerService } from '@core/services/node-manager.service';
import { untilDestroyed } from '@core/until-destroyed';
import { MemoryUtils } from '@core/utils/memory-utils';
import { TextViewModalComponent } from '@app/dashboard/pages/nodes/components/text-view-modal/text-view-modal.component';

@Component({
  selector: 'app-log-archived-table',
  templateUrl: './log-archived-table.component.html',
  styleUrls: ['./log-archived-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogArchivedTableComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  rows$: Observable<LogArchivedItem[]>;
  rowsLoading$: BehaviorSubject<{
    [name: string]: boolean;
  }> = new BehaviorSubject({});

  tableColumns: TableColumnConfig[];

  @Input() managerUrl;

  @Input('rows')
  set _rows(rows$: Observable<LogArchivedItem[]>) {
    this.rows$ = rows$.pipe(
      tap((rows) => {
        this.rowsLoading$.next(
          rows.reduce(
            (acc, curr) => ({
              ...acc,
              [curr.name]: false,
            }),
            {}
          )
        );
      })
    );
  }

  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
    row: LogArchivedItem;
  }>;
  @ViewChild('sizeTpl', { static: true }) sizeTpl!: TemplateRef<{
    row: LogArchivedItem;
  }>;

  constructor(
    private nzModalService: NzModalService,
    private nodeManagerService: NodeManagerService,
    private nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.tableColumns = [
      {
        propertyName: 'name',
        headerName: 'Log Name',
      },
      {
        propertyName: 'size',
        headerName: 'Size',
        columnTransformTpl: this.sizeTpl,
      },
      {
        headerName: 'Actions',
        columnTransformTpl: this.actionsTpl,
      },
    ];
  }

  viewLog(event: MouseEvent, row: LogArchivedItem) {
    event.preventDefault();

    this.rowsLoading$.next({
      ...this.rowsLoading$.getValue(),
      [row.name]: true,
    });

    this.nodeManagerService
      .logDownload(row.downloadLink, this.managerUrl)
      .pipe(
        untilDestroyed(this),
        tap(
          (logs) => {
            this.nzModalService.create({
              nzTitle: `"${row.name}" log`,
              nzContent: TextViewModalComponent,
              nzComponentParams: {
                text: logs,
              },
              nzFooter: null,
              nzWidth: '75vw',
            });
          },
          (err) => {
            this.log.error(err);
            this.nzMessageService.error(
              `Retrieving log file: "${row.name}" failed!`
            );
          }
        ),
        finalize(() =>
          this.rowsLoading$.next({
            ...this.rowsLoading$.getValue(),
            [row.name]: false,
          })
        )
      )
      .subscribe();
  }

  formatMemory(memory: number) {
    return MemoryUtils.toMb(memory);
  }

  ngOnDestroy(): void {}
}
