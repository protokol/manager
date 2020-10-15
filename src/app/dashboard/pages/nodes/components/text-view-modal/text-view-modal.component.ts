import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-text-view-modal',
  templateUrl: './text-view-modal.component.html',
  styleUrls: ['./text-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextViewModalComponent implements OnInit {
  @Input() text = '';

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  constructor(private modalRef: NzModalRef, private cd: ChangeDetectorRef) {}

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
