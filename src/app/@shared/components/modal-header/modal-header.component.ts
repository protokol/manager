import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-modal-header',
  templateUrl: './modal-header.component.html',
  styleUrls: ['./modal-header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalHeaderComponent {
  @Input() modalRef: NzModalRef = null;

  constructor() {}
}
