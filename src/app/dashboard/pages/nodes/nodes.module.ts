import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NodesRoutingModule } from '@app/dashboard/pages/nodes/nodes-routing.module';
import { NodeDetailsComponent } from '@app/dashboard/pages/nodes/components/node-details/node-details.component';
import {
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

@NgModule({
  imports: [
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
  ],
  providers: [],
  declarations: [
    NodeDetailsComponent,
    NodeManagerDetailsComponent,
    NodeManagerSettingsModalComponent,
    LogArchivedTableComponent,
    LogViewModalComponent,
  ],
  exports: [],
})
export class NodesModule {}
