import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { NgTerminal } from 'ng-terminal';
import { BehaviorSubject } from 'rxjs';
import { TextUtils } from '@core/utils/text-utils';
import { Store } from '@ngxs/store';
import {
  ManagerLogsStartPooling,
  ManagerLogsStopPooling,
} from '@app/dashboard/pages/nodes/state/manager-logs/manager-logs.actions';
import { untilDestroyed } from '@core/until-destroyed';
import { tap } from 'rxjs/operators';
import {
  LogListItem,
  ManagerLogsState,
} from '@app/dashboard/pages/nodes/state/manager-logs/manager-logs.state';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-terminal-view-modal',
  templateUrl: './terminal-view-modal.component.html',
  styleUrls: ['./terminal-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalViewModalComponent implements AfterViewInit, OnDestroy {
  logs$ = new BehaviorSubject('');
  linesFrom = -1;
  linesTo = -1;
  subscribedLogName: string;

  @Input('input')
  set input(input: string) {
    this.logs$.next(input);
  }

  @Input('logName')
  set logName(logName: string) {
    this.subscribedLogName = logName;

    this.store
      .select(ManagerLogsState.getLogs(logName))
      .pipe(
        untilDestroyed(this),
        tap((linesCollection) => {
          if (linesCollection.length === 1) {
            const [linesItem] = linesCollection;
            this.writeToTerminal(linesItem);
          } else {
            const linesItem = linesCollection.find(
              (c) => c.from === this.linesTo
            );
            if (linesItem) {
              this.writeToTerminal(linesItem);
            }
          }
        })
      )
      .subscribe();

    this.store.dispatch(new ManagerLogsStartPooling(logName));
  }

  @ViewChild('ngTerminal', { static: true }) child: NgTerminal;

  constructor(private store: Store, private nzModalRef: NzModalRef) {
    this.nzModalRef.afterClose
      .pipe(
        tap(() => {
          if (this.subscribedLogName) {
            this.store.dispatch(
              new ManagerLogsStopPooling(this.subscribedLogName)
            );
          }
        })
      )
      .subscribe();
  }

  writeToTerminal(logEntity: LogListItem) {
    this.child.write(`\n\r${TextUtils.replaceWithTerminalBr(logEntity.lines)}`);
    this.linesFrom = logEntity.from;
    this.linesTo = logEntity.to;
  }

  ngAfterViewInit() {
    this.child.write(TextUtils.replaceWithTerminalBr(this.logs$.getValue()));
  }

  ngOnDestroy(): void {}
}
