import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './components/table/table.component';
import {
  NzButtonModule,
  NzDropDownModule,
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

const declareAndExportComponents = [TableComponent, TextClipperComponent];

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
  ],
  declarations: [...declareAndExportComponents],
  exports: [...declareAndExportComponents],
})
export class SharedModule {}
