import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { WidgetConfigService } from '@app/ajsf-widget-library/services/widget-config.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-asset-view-modal',
  templateUrl: './asset-view-modal.component.html',
  styleUrls: ['./asset-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetViewModalComponent {
  readonly editorOptions: JsonEditorOptions;

  @Input() jsonSchema: object;
  @Input() formValues: object;

  widgets = WidgetConfigService.getWidgets();
  isProduction = environment.production;

  constructor() {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'view';
    this.editorOptions.expandAll = true;
  }
}
