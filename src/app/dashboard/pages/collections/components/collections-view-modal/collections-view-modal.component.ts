import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { WidgetConfigService } from '@app/ajsf-widget-library/services/widget-config.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-collections-view-modal',
  templateUrl: './collections-view-modal.component.html',
  styleUrls: ['./collections-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsViewModalComponent {
  readonly editorOptions: JsonEditorOptions;

  widgets = WidgetConfigService.getWidgets();
  isProduction = environment.production;

  @Input() jsonSchema: object;

  constructor() {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
  }
}
