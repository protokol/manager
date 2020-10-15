import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  Input, OnInit,
  TemplateRef, ViewChild
} from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-json-view-modal',
  templateUrl: './json-view-modal.component.html',
  styleUrls: ['./json-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonViewModalComponent implements OnInit {
  readonly editorOptions: JsonEditorOptions;

  jsonData: any = null;

  @Input() inputData;
  @Input() footer?: TemplateRef<{ data: any }>;
  @Input() header;

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  constructor(private modalRef: NzModalRef, private cd: ChangeDetectorRef) {
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

  onDataChange(data: any) {
    this.jsonData = data;
  }
}
