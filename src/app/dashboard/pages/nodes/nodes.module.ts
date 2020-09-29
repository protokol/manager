import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NodesRoutingModule } from '@app/dashboard/pages/nodes/nodes-routing.module';
import { NodeDetailsComponent } from '@app/dashboard/pages/nodes/components/node-details/node-details.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NodeManagerSettingsModalComponent } from './components/node-manager-settings-modal/node-manager-settings-modal.component';
import { NodeManagerDetailsComponent } from './components/node-manager-details/node-manager-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogArchivedTableComponent } from './components/log-archived-table/log-archived-table.component';
import { NgLetModule } from '@core/directives/ngLet.module';
import { ProcessListTableComponent } from '@app/dashboard/pages/nodes/components/process-list-table/process-list-table.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NgxsModule } from '@ngxs/store';
import { ManagerProcessesState } from '@app/dashboard/pages/nodes/state/manager-processes/manager-processes.state';
import { TextViewModalComponent } from './components/text-view-modal/text-view-modal.component';
import { ManagerSnapshotsState } from '@app/dashboard/pages/nodes/state/manager-snapshots/manager-snapshots.state';
import { SnapshotsTableComponent } from '@app/dashboard/pages/nodes/components/snapshots-table/snapshots-table.component';
import { SnapshotCreateModalComponent } from '@app/dashboard/pages/nodes/components/snapshot-create-modal/snapshot-create-modal.component';
import { SnapshotRestoreModalComponent } from '@app/dashboard/pages/nodes/components/snapshot-restore-modal/snapshot-restore-modal.component';
import { TerminalViewModalComponent } from '@app/dashboard/pages/nodes/components/terminal-view-modal/terminal-view-modal.component';
import { NgTerminalModule } from 'ng-terminal';
import { ManagerLogsState } from '@app/dashboard/pages/nodes/state/manager-logs/manager-logs.state';
import { ManagerDiskSpaceState } from '@app/dashboard/pages/nodes/state/manager-disk-space/manager-disk-space.state';
import { DiskSpaceTableComponent } from '@app/dashboard/pages/nodes/components/disk-space-table/disk-space-table.component';
import { MyNodesUpdateModalComponent } from '@app/dashboard/pages/nodes/components/my-nodes-update-modal/my-nodes-update-modal.component';
import { ArgsModalComponent } from '@app/dashboard/pages/nodes/components/args-modal/args-modal.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';

@NgModule({
  imports: [
    NgxsModule.forFeature([
      ManagerProcessesState,
      ManagerSnapshotsState,
      ManagerLogsState,
      ManagerDiskSpaceState,
    ]),
    NodesRoutingModule,
    CommonModule,
    SharedModule,
    NzSpinModule,
    NzDescriptionsModule,
    NzTypographyModule,
    NzDividerModule,
    NgJsonEditorModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    NzFormModule,
    NzInputModule,
    ReactiveFormsModule,
    NzModalModule,
    NgLetModule,
    FormsModule,
    NzBadgeModule,
    NzSpaceModule,
    NzDropDownModule,
    NzCheckboxModule,
    NzPopconfirmModule,
    NgTerminalModule,
    NzSelectModule,
    NzRadioModule,
  ],
  providers: [],
  declarations: [
    NodeDetailsComponent,
    NodeManagerDetailsComponent,
    NodeManagerSettingsModalComponent,
    LogArchivedTableComponent,
    TextViewModalComponent,
    ProcessListTableComponent,
    SnapshotsTableComponent,
    SnapshotCreateModalComponent,
    SnapshotRestoreModalComponent,
    TerminalViewModalComponent,
    DiskSpaceTableComponent,
    MyNodesUpdateModalComponent,
    ArgsModalComponent,
  ],
  exports: [],
})
export class NodesModule {}
