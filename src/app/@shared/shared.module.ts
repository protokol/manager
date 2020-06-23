import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './components/table/table.component';
import {
	NzMessageModule,
	NzTableModule,
	NzToolTipModule,
	NzTypographyModule,
} from 'ng-zorro-antd';
import { TextClipperComponent } from './components/text-clipper/text-clipper.component';
import { ClipboardModule } from 'ngx-clipboard';

const declareAndExportComponents = [TableComponent, TextClipperComponent];

@NgModule({
	imports: [
		CommonModule,
		NzTableModule,
		NzToolTipModule,
		NzTypographyModule,
		ClipboardModule,
		NzMessageModule,
	],
	declarations: [...declareAndExportComponents],
	exports: [...declareAndExportComponents],
})
export class SharedModule {}
