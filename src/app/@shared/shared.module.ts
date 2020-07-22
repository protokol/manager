import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './components/table/table.component';
import {
  NzButtonModule,
  NzDropDownModule,
  NzGridModule,
  NzIconModule,
  NzInputModule,
  NzMessageModule,
  NzTableModule,
  NzToolTipModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { TextClipperComponent } from './components/text-clipper/text-clipper.component';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule } from '@angular/forms';
import { SchemaContainerComponent } from './components/schema-container/schema-container.component';
import { SchemaContainerItemComponent } from './components/schema-container-item/schema-container-item.component';
import { TextAnimateComponent } from './components/text-animate/text-animate.component';
import { NgLetModule } from '@core/directives/ngLet.module';
import { JsonViewModalComponent } from '@shared/components/json-view-modal/json-view-modal.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';

const declareAndExportComponents = [
  TableComponent,
  TextClipperComponent,
  SchemaContainerComponent,
  SchemaContainerItemComponent,
  TextAnimateComponent,
  JsonViewModalComponent,
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
  ],
  declarations: [...declareAndExportComponents],
  exports: [...declareAndExportComponents],
})
export class SharedModule {}
