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
import { MemoryUtils } from '@core/utils/memory-utils';
import { SnapshotsListItem } from '@core/interfaces/core-manager.types';
import { SnapshotRestoreModalComponent } from '@app/dashboard/pages/nodes/components/snapshot-restore-modal/snapshot-restore-modal.component';
import { untilDestroyed } from '@core/until-destroyed';
import { ManagerDeleteSnapshot } from '@app/dashboard/pages/nodes/state/manager-snapshots/manager-snapshots.actions';
import { Store } from '@ngxs/store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-snapshots-table',
  templateUrl: './snapshots-table.component.html',
  styleUrls: ['./snapshots-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapshotsTableComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Input() managerUrl;

  rows$: Observable<SnapshotsListItem[]>;
  rowsLoading$: BehaviorSubject<{
    [name: string]: { isLoading: boolean; type: string };
  }> = new BehaviorSubject({});

  tableColumns: TableColumnConfig<SnapshotsListItem>[];

  @Input('rows')
  set _rows(rows$: Observable<SnapshotsListItem[]>) {
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

  @ViewChild('sizeTpl', { static: true }) sizeTpl!: TemplateRef<{
    row: SnapshotsListItem;
  }>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
    row: SnapshotsListItem;
  }>;

  constructor(
    private nzModalService: NzModalService,
    private store: Store,
    private nzMessageService: NzMessageService
  ) {}

  ngOnInit(): void {
    this.tableColumns = [
      {
        propertyName: 'name',
        headerName: 'Name',
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

  setRowLoading(processName: string, isLoading: boolean, type?: string) {
    this.rowsLoading$.next({
      ...this.rowsLoading$.getValue(),
      [processName]: {
        isLoading,
        type,
      },
    });
  }

  formatMemory(memory: number) {
    return MemoryUtils.toMb(memory);
  }

  ngOnDestroy(): void {}

  restoreSnapshot(event: MouseEvent, row: SnapshotsListItem) {
    event.preventDefault();

    this.setRowLoading(row.name, true, 'create');

    const modalRef = this.nzModalService.create({
      nzContent: SnapshotRestoreModalComponent,
      nzComponentParams: {
        snapshotName: row.name,
        managerUrl: this.managerUrl,
      },
      nzFooter: null,
    });

    modalRef.afterClose
      .pipe(
        untilDestroyed(this),
        tap(() => this.setRowLoading(row.name, false))
      )
      .subscribe();
  }

  deleteSnapshot({ name }: SnapshotsListItem) {
    this.setRowLoading(name, true, 'delete');

    this.store
      .dispatch(new ManagerDeleteSnapshot(name, this.managerUrl))
      .pipe(
        untilDestroyed(this),
        tap(
          () => {
            this.nzMessageService.error(`Snapshot "${name}" deleted!`);
          },
          (err) => {
            this.log.error(err);
            this.nzMessageService.error(`Deleting snapshot "${name}" failed!`);
          }
        ),
        finalize(() => this.setRowLoading(name, false))
      )
      .subscribe();
  }
}
