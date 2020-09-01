import { NgModule } from '@angular/core';
import { AssetsRoutingModule } from './assets-routing.module';
import { AssetsComponent } from './assets.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import {
  NzButtonModule,
  NzGridModule,
  NzModalModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { AssetViewModalComponent } from '@app/dashboard/pages/assets/components/asset-view-modal/asset-view-modal.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JsonSchemaFormModule } from '@ajsf/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@NgModule({
  imports: [
    AssetsRoutingModule,
    CommonModule,
    SharedModule,
    NzModalModule,
    NgJsonEditorModule,
    NzGridModule,
    JsonSchemaFormModule,
    ReactiveFormsModule,
    NzButtonModule,
    NgLetModule,
    NzSpaceModule,
    NzTypographyModule,
  ],
  providers: [],
  declarations: [AssetsComponent, AssetViewModalComponent],
  exports: [],
})
export class AssetsModule {}
