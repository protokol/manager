import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule, NzInputModule, NzSelectModule } from 'ng-zorro-antd';
import { WidgetConfigService } from './services/widget-config.service';
import { JsonSchemaFormModule } from '@ajsf/core';
import { AntInputComponent } from '@app/ajsf-widget-library/components/ant-input/ant-input.component';
import { AntNumberComponent } from './components/ant-number/ant-number.component';
import { AntAddReferenceComponent } from './components/ant-add-reference/ant-add-reference.component';
import { AntButtonComponent } from './components/ant-button/ant-button.component';
import { AntSubmitComponent } from './components/ant-submit/ant-submit.component';
import { AntSelectComponent } from './components/ant-select/ant-select.component';
import { AntFrameworkComponent } from './components/ant-framework/ant-framework.component';

const declareAndExportComponents = [
  AntInputComponent,
  AntNumberComponent,
  AntAddReferenceComponent,
  AntButtonComponent,
  AntSubmitComponent,
  AntSelectComponent,
  AntFrameworkComponent,
];

@NgModule({
  declarations: [...declareAndExportComponents],
  providers: [WidgetConfigService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzInputModule,
    JsonSchemaFormModule,
    NzButtonModule,
    NzSelectModule,
    FormsModule,
  ],
  exports: [...declareAndExportComponents],
})
export class AjsfWidgetLibraryModule {}
