import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild,
} from '@angular/core';
import { NgTerminal } from 'ng-terminal';
import { BehaviorSubject } from 'rxjs';
import { TextUtils } from '@core/utils/text-utils';

@Component({
  selector: 'app-terminal-view-modal',
  templateUrl: './terminal-view-modal.component.html',
  styleUrls: ['./terminal-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalViewModalComponent implements AfterViewInit {
  logs$ = new BehaviorSubject('');

  @Input('input')
  set input(input: string) {
    this.logs$.next(input);
  }

  @ViewChild('ngTerminal', { static: true }) child: NgTerminal;

  constructor() {}

  ngAfterViewInit() {
    this.child.write(TextUtils.replaceWithTerminalBr(this.logs$.getValue()));
  }
}
