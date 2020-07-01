import { ChangeDetectionStrategy, Component } from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { WidgetConfigService } from '@app/ajsf-widget-library/services/widget-config.service';
import { environment } from '@env/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Logger } from '@core/services/logger.service';

@Component({
  selector: 'app-collection-create-modal',
  templateUrl: './collection-create-modal.component.html',
  styleUrls: ['./collection-create-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionCreateModalComponent {
  readonly log = new Logger(this.constructor.name);
  readonly editorOptions: JsonEditorOptions;

  collectionForm!: FormGroup;
  framework = WidgetConfigService.getFramework();
  isProduction = environment.production;

  constructor(private formBuilder: FormBuilder) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';

    this.createForm();
  }

  private createForm() {
    this.collectionForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      maximumSupply: [
        '',
        [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)],
      ],
      jsonSchema: ['', Validators.required],
    });
  }

  c(controlName: string) {
    return this.collectionForm.controls[controlName];
  }

  createCollection(event: any) {
    this.log.info('submit', event);
  }
}
