import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NzTSType } from 'ng-zorro-antd/core/types';

@Component({
  selector: 'app-popover-helper',
  templateUrl: './popover-helper.component.html',
  styleUrls: ['./popover-helper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverHelperComponent {
  @Input() popoverTitle: NzTSType;
  @Input() popoverContent: NzTSType;
  @Input() placement = 'bottomCenter';

  constructor() {}
}
