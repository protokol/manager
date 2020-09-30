import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IClipboardResponse } from 'ngx-clipboard';
import { TextUtils } from '@core/utils/text-utils';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-text-clipper',
  templateUrl: './text-clipper.component.html',
  styleUrls: ['./text-clipper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextClipperComponent {
  text$ = new BehaviorSubject('');
  shouldCopy$ = new BehaviorSubject(true);

  @Input('copy')
  set _copy(copy: boolean) {
    this.shouldCopy$.next(copy);
  }

  @Input('text')
  set _text(text: string) {
    if (text && text.length > 0) {
      this.text$.next(text);
    }
  }

  @Output() clicked = new EventEmitter<void>();

  constructor(private nzMessageService: NzMessageService) {}

  copiedSuccessful(event: IClipboardResponse) {
    if (event.isSuccess) {
      this.nzMessageService.success('Copied to clipboard');
    } else {
      this.nzMessageService.warning('Failed to copy to clipboard');
    }
  }

  get textClipped$(): Observable<string> {
    return this.text$.pipe(map(TextUtils.clip));
  }

  onClick(event: MouseEvent) {
    event.preventDefault();

    this.clicked.next();
  }
}
