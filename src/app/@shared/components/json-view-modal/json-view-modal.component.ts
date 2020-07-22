import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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

  constructor() {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
  }
}
