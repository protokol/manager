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
import { debounceTime, distinctUntilChanged, first, tap } from 'rxjs/operators';
import {
  LogListItem,
  ManagerLogsState,
} from '@app/dashboard/pages/nodes/state/manager-logs/manager-logs.state';
import { SearchAddon } from 'xterm-addon-search';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-terminal-view-modal',
  templateUrl: './terminal-view-modal.component.html',
  styleUrls: ['./terminal-view-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TerminalViewModalComponent implements AfterViewInit, OnDestroy {
  private termSearch = new SearchAddon();
  managerUrl$ = new BehaviorSubject('');
  logs$ = new BehaviorSubject('');
  searchTerm$ = new BehaviorSubject('');
  isSearching$ = new BehaviorSubject(false);
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

    this.managerUrl$
      .pipe(
        first((url) => !!url),
        tap((url) =>
          this.store.dispatch(new ManagerLogsStartPooling(logName, url))
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  @Input('managerUrl')
  set managerUrl(managerUrl: string) {
    this.managerUrl$.next(managerUrl);
  }

  @ViewChild('ngTerminal', { static: true }) terminal: NgTerminal;

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

    this.searchTerm$
      .pipe(
        debounceTime(750),
        distinctUntilChanged(),
        tap((value) => this.isSearching$.next(!!value)),
        tap((value) => {
          if (!value) {
            this.getCoreTerminal.scrollToBottom();
          } else {
            this.termSearch.findNext(value);
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  writeToTerminal(logEntity: LogListItem) {
    const lines = `\n\r${TextUtils.replaceWithTerminalBr(logEntity.lines)}`;
    this.terminal.write(lines);
    this.logs$.next(`${this.logs$.getValue()}${lines}`);
    this.linesFrom = logEntity.from;
    this.linesTo = logEntity.to;
  }

  get getCoreTerminal() {
    return this.terminal.underlying;
  }

  ngAfterViewInit() {
    this.getCoreTerminal.loadAddon(this.termSearch);
    this.terminal.write(TextUtils.replaceWithTerminalBr(this.logs$.getValue()));
  }

  ngOnDestroy(): void {}

  onSearchPrevious(event: MouseEvent) {
    event.preventDefault();

    this.termSearch.findPrevious(this.searchTerm$.getValue());
  }

  onSearchNext(event: MouseEvent) {
    event.preventDefault();

    this.termSearch.findNext(this.searchTerm$.getValue());
  }
}
