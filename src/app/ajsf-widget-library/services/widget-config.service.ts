import { Injectable } from '@angular/core';
import { AntInputComponent } from '@app/ajsf-widget-library/components/ant-input/ant-input.component';
import { AntNumberComponent } from '@app/ajsf-widget-library/components/ant-number/ant-number.component';
import { AntAddReferenceComponent } from '@app/ajsf-widget-library/components/ant-add-reference/ant-add-reference.component';
import { AntButtonComponent } from '@app/ajsf-widget-library/components/ant-button/ant-button.component';
import { AntSubmitComponent } from '@app/ajsf-widget-library/components/ant-submit/ant-submit.component';
import { AntSelectComponent } from '@app/ajsf-widget-library/components/ant-select/ant-select.component';

@Injectable()
export class WidgetConfigService {
  constructor() {}

  static getWidgets() {
    return {
      $ref: AntAddReferenceComponent,
      text: AntInputComponent,
      number: AntNumberComponent,
      button: AntButtonComponent,
      submit: AntSubmitComponent,
      select: AntSelectComponent,
    };
  }
}
