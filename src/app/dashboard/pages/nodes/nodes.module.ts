import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NodesRoutingModule } from '@app/dashboard/pages/nodes/nodes-routing.module';
import { NodeDetailsComponent } from '@app/dashboard/pages/nodes/components/node-details/node-details.component';
import {
  NzBadgeModule,
  NzButtonModule,
  NzDescriptionsModule,
  NzDividerModule,
  NzFormModule,
  NzGridModule,
  NzIconModule,
  NzInputModule,
  NzModalModule,
  NzSpinModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NodeManagerSettingsModalComponent } from './components/node-manager-settings-modal/node-manager-settings-modal.component';
import { NodeManagerDetailsComponent } from './components/node-manager-details/node-manager-details.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogArchivedTableComponent } from './components/log-archived-table/log-archived-table.component';
import { LogViewModalComponent } from '@app/dashboard/pages/nodes/components/log-view-modal/log-view-modal.component';
import { NgLetModule } from '@core/directives/ngLet.module';
import { ProcessListTableComponent } from '@app/dashboard/pages/nodes/components/process-list-table/process-list-table.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NgxsModule } from '@ngxs/store';
import { ManagerProcessesState } from '@app/dashboard/pages/nodes/state/manager-processes/manager-processes.state';

@NgModule({
  imports: [
    NgxsModule.forFeature([ManagerProcessesState]),
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
  ],
  providers: [],
  declarations: [
    NodeDetailsComponent,
    NodeManagerDetailsComponent,
    NodeManagerSettingsModalComponent,
    LogArchivedTableComponent,
    LogViewModalComponent,
    ProcessListTableComponent,
  ],
  exports: [],
})
export class NodesModule {}
