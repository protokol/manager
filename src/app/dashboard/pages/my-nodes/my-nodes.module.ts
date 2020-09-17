import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import {
  NzButtonModule,
  NzCheckboxModule,
  NzDropDownModule,
  NzGridModule,
  NzIconModule,
  NzModalModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { FormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { MyNodesComponent } from '@app/dashboard/pages/my-nodes/my-nodes.component';
import { MyNodesRoutingModule } from '@app/dashboard/pages/my-nodes/my-nodes-routing.module';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@NgModule({
  imports: [
    MyNodesRoutingModule,
    CommonModule,
    SharedModule,
    NzModalModule,
    NgJsonEditorModule,
    NzGridModule,
    NzCheckboxModule,
    FormsModule,
    NgLetModule,
    NzButtonModule,
    NzDropDownModule,
    NzIconModule,
    NzTypographyModule,
    NzSpaceModule,
  ],
  providers: [],
  declarations: [MyNodesComponent],
  exports: [],
})
export class MyNodesModule {}
