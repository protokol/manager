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

const declareAndExportComponents = [
  TableComponent,
  TextClipperComponent,
  SchemaContainerComponent,
  SchemaContainerItemComponent,
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
  ],
  declarations: [...declareAndExportComponents],
  exports: [...declareAndExportComponents],
})
export class SharedModule {}
