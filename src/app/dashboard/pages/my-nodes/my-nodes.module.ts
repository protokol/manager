import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { FormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { MyNodesComponent } from '@app/dashboard/pages/my-nodes/my-nodes.component';
import { MyNodesRoutingModule } from '@app/dashboard/pages/my-nodes/my-nodes-routing.module';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';

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
