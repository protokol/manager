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
  selector: 'app-collection-view-modal',
  templateUrl: './collection-view-modal.component.html',
  styleUrls: ['./collection-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionViewModalComponent implements OnInit {
  readonly editorOptions: JsonEditorOptions;

  framework = WidgetConfigService.getFramework();
  isProduction = environment.production;

  @Input() jsonSchema: object;
  @Input() schemaName: string;

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  constructor(public modalRef: NzModalRef, private cd: ChangeDetectorRef) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';
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
