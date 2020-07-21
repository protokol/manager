import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-log-view-modal',
  templateUrl: './log-view-modal.component.html',
  styleUrls: ['./log-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogViewModalComponent {
  @Input() logs = '';

  constructor() {}
}
