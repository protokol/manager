import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { TableColumnConfig } from '@shared/interfaces/table.types';
import { InfoDiskSpaceItem } from '@core/interfaces/core-manager.types';
import { Logger } from '@core/services/logger.service';
import { Observable } from 'rxjs';
import { MemoryUtils } from '@core/utils/memory-utils';
import { Select, Store } from '@ngxs/store';
import { ManagerDiskSpaceState } from '@app/dashboard/pages/nodes/state/manager-disk-space/manager-disk-space.state';
import {
  ManagerDiskSpaceStartPooling,
  ManagerDiskSpaceStopPooling,
} from '@app/dashboard/pages/nodes/state/manager-disk-space/manager-disk-space.actions';

@Component({
  selector: 'app-disk-space-table',
  templateUrl: './disk-space-table.component.html',
  styleUrls: ['./disk-space-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiskSpaceTableComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Select(ManagerDiskSpaceState.getManagerDiskSpace) rows$: Observable<
    InfoDiskSpaceItem[]
  >;

  tableColumns: TableColumnConfig<InfoDiskSpaceItem>[];

  @ViewChild('usedTpl', { static: true }) usedTpl!: TemplateRef<{
    row: InfoDiskSpaceItem;
  }>;
  @ViewChild('availableTpl', { static: true }) availableTpl!: TemplateRef<{
    row: InfoDiskSpaceItem;
  }>;
  @ViewChild('sizeTpl', { static: true }) sizeTpl!: TemplateRef<{
    row: InfoDiskSpaceItem;
  }>;
  @ViewChild('capacityTpl', { static: true }) capacityTpl!: TemplateRef<{
    row: InfoDiskSpaceItem;
  }>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(new ManagerDiskSpaceStartPooling());

    this.tableColumns = [
      {
        propertyName: 'mountpoint',
        headerName: 'Mount point',
        width: '150px',
      },
      {
        propertyName: 'filesystem',
        headerName: 'File system',
        width: '150px',
      },
      {
        propertyName: 'used',
        headerName: 'Used',
        columnTransformTpl: this.usedTpl,
        width: '120px',
      },
      {
        propertyName: 'available',
        headerName: 'Available',
        columnTransformTpl: this.availableTpl,
        width: '120px',
      },
      {
        propertyName: 'size',
        headerName: 'Size',
        columnTransformTpl: this.sizeTpl,
        width: '120px',
      },
      {
        propertyName: 'capacity',
        headerName: 'Capacity',
        columnTransformTpl: this.capacityTpl,
        width: '80px',
      },
    ];
  }

  formatMemory(memory: number) {
    return MemoryUtils.toGb(memory);
  }

  formatCapacity(capacity) {
    if (!capacity) {
      return 0;
    }
    return capacity * 100;
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ManagerDiskSpaceStopPooling());
  }
}
