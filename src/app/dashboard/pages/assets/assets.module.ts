import { NgModule } from '@angular/core';
import { AssetsRoutingModule } from './assets-routing.module';
import { AssetsComponent } from './assets.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { AssetViewModalComponent } from '@app/dashboard/pages/assets/components/asset-view-modal/asset-view-modal.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JsonSchemaFormModule } from '@ajsf/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';

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
