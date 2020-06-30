import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';
import { IClipboardResponse } from 'ngx-clipboard';
import { TextUtils } from '@core/utils/text-utils';

@Component({
	selector: 'app-text-clipper',
	templateUrl: './text-clipper.component.html',
	styleUrls: ['./text-clipper.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextClipperComponent {
	text$ = new BehaviorSubject('');

	@Input('text')
	set _text(text: string) {
		if (text && text.length > 0) {
			this.text$.next(text);
		}
	}

	constructor(private nzMessageService: NzMessageService) {}

	copiedSuccessful(event: IClipboardResponse) {
		if (event.isSuccess) {
			this.nzMessageService.success('Copied to clipboard');
		} else {
			this.nzMessageService.warning('Failed to copy to clipboard');
		}
	}

	get textClipped$(): Observable<string> {
		return this.text$.pipe(
			map(TextUtils.clip)
		);
	}
}
