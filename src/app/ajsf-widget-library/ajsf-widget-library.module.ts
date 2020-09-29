import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WidgetConfigService } from './services/widget-config.service';
import { JsonSchemaFormModule } from '@ajsf/core';
import { AntInputComponent } from '@app/ajsf-widget-library/components/ant-input/ant-input.component';
import { AntNumberComponent } from './components/ant-number/ant-number.component';
import { AntAddReferenceComponent } from './components/ant-add-reference/ant-add-reference.component';
import { AntButtonComponent } from './components/ant-button/ant-button.component';
import { AntSubmitComponent } from './components/ant-submit/ant-submit.component';
import { AntSelectComponent } from './components/ant-select/ant-select.component';
import { AntFrameworkComponent } from './components/ant-framework/ant-framework.component';
import { SharedModule } from '@shared/shared.module';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';

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
    SharedModule,
    NzFormModule,
  ],
  exports: [...declareAndExportComponents],
})
export class AjsfWidgetLibraryModule {}
