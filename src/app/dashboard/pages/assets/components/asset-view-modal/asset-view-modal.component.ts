import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { WidgetConfigService } from '@app/ajsf-widget-library/services/widget-config.service';
import { environment } from '@env/environment';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-asset-view-modal',
  templateUrl: './asset-view-modal.component.html',
  styleUrls: ['./asset-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetViewModalComponent implements OnInit {
  readonly editorOptions: JsonEditorOptions;

  @Input() jsonSchema: object;
  @Input() formValues: object;
  @Input() assetDetailId: string;

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  framework = WidgetConfigService.getFramework();
  isProduction = environment.production;

  constructor(public modalRef: NzModalRef, private cd: ChangeDetectorRef) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'view';
    this.editorOptions.expandAll = true;
  }

  ngOnInit(): void {
    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.modalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzWidth: '75vw',
      });
      this.cd.markForCheck();
    });
  }
}
