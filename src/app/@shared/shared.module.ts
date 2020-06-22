import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './components/table/table.component';
import { NzTableModule } from 'ng-zorro-antd';

const declareAndExportComponents = [
	TableComponent
];

@NgModule({
	imports: [CommonModule, NzTableModule],
	declarations: [...declareAndExportComponents, TableComponent],
	exports: [...declareAndExportComponents],
})
export class SharedModule {}
