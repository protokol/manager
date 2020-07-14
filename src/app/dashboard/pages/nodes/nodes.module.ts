import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NodesRoutingModule } from '@app/dashboard/pages/nodes/nodes-routing.module';
import { NodeDetailsComponent } from '@app/dashboard/pages/nodes/components/node-details/node-details.component';
import {
  NzDescriptionsModule,
  NzDividerModule,
  NzGridModule,
  NzSpinModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { NgJsonEditorModule } from 'ang-jsoneditor';

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
  ],
  providers: [],
  declarations: [NodeDetailsComponent],
  exports: [],
})
export class NodesModule {}
