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

  @Input() data;
  @Input() footer?: TemplateRef<{ data: any }>;

  constructor() {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
  }
}
