import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-text-view-modal',
  templateUrl: './text-view-modal.component.html',
  styleUrls: ['./text-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextViewModalComponent {
  @Input() text = '';

  constructor() {}
}
