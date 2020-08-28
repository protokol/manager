import {
  ChangeDetectionStrategy,
  Component,
  Input,
  TemplateRef,
} from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';

@Component({
  selector: 'app-json-view-modal',
  templateUrl: './json-view-modal.component.html',
  styleUrls: ['./json-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonViewModalComponent {
  readonly editorOptions: JsonEditorOptions;

  jsonData: any = null;

  @Input() inputData;
  @Input() footer?: TemplateRef<{ data: any }>;

  constructor() {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
  }

  onDataChange(data: any) {
    this.jsonData = data;
  }
}
