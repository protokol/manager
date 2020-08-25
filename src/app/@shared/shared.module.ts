import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './components/table/table.component';
import {
  NzButtonModule,
  NzDividerModule,
  NzDropDownModule,
  NzFormModule,
  NzGridModule,
  NzIconModule,
  NzInputModule,
  NzMessageModule,
  NzModalModule,
  NzNotificationModule,
  NzSelectModule,
  NzSpinModule,
  NzTableModule,
  NzToolTipModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { TextClipperComponent } from './components/text-clipper/text-clipper.component';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SchemaContainerComponent } from './components/schema-container/schema-container.component';
import { SchemaContainerItemComponent } from './components/schema-container-item/schema-container-item.component';
import { TextAnimateComponent } from './components/text-animate/text-animate.component';
import { NgLetModule } from '@core/directives/ngLet.module';
import { JsonViewModalComponent } from '@shared/components/json-view-modal/json-view-modal.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { AssetCreateModalComponent } from './components/asset-create-modal/asset-create-modal.component';
import { CollectionSelectComponent } from './components/collection-select/collection-select.component';
import { JsonSchemaFormModule } from '@ajsf/core';
import { NzSpaceModule } from 'ng-zorro-antd/space';

const declareAndExportComponents = [
  TableComponent,
  TextClipperComponent,
  SchemaContainerComponent,
  SchemaContainerItemComponent,
  TextAnimateComponent,
  JsonViewModalComponent,
  AssetCreateModalComponent,
  CollectionSelectComponent,
];

@NgModule({
  imports: [
    CommonModule,
    NzTableModule,
    NzToolTipModule,
    NzTypographyModule,
    ClipboardModule,
    NzMessageModule,
    NzDropDownModule,
    NzIconModule,
    NzInputModule,
    FormsModule,
    NzButtonModule,
    NzGridModule,
    NgLetModule,
    NgJsonEditorModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzDividerModule,
    NzSpinModule,
    JsonSchemaFormModule,
    NzNotificationModule,
    NzModalModule,
    NzSpaceModule,
  ],
  declarations: [...declareAndExportComponents],
  exports: [...declareAndExportComponents],
})
export class SharedModule {}
