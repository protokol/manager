import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NodeManagerService } from '@core/services/node-manager.service';
import { untilDestroyed } from '@core/until-destroyed';
import { Select, Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import { Observable, of, timer } from 'rxjs';
import {
  CoreManagerVersionResponse,
  LogArchivedItem,
  ProcessListItem,
} from '@core/interfaces/core-manager.types';
import { distinctUntilChanged, exhaustMap, switchMap } from 'rxjs/operators';
import { ManagerProcessesState } from '@app/dashboard/pages/nodes/state/manager-processes/manager-processes.state';
import { LoadManagerProcesses } from '../../state/manager-processes/manager-processes.actions';

@Component({
  selector: 'app-node-manager-details',
  templateUrl: './node-manager-details.component.html',
  styleUrls: ['./node-manager-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeManagerDetailsComponent implements OnInit, OnDestroy {
  descriptionColumns = { xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 };

  @Select(NetworksState.getNodeManagerUrl()) nodeManagerUrl$;
  @Select(ManagerProcessesState.getManagerProcessesIds)
  managerProcessesIds$: Observable<
    ReturnType<typeof ManagerProcessesState.getManagerProcessesIds>
  >;

  infoCoreVersion$: Observable<CoreManagerVersionResponse['result']> = of(null);
  logArchived$: Observable<LogArchivedItem[]> = of([]);
  processList$: Observable<ProcessListItem[]> = of([]);

  constructor(
    private nodeManagerService: NodeManagerService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.infoCoreVersion$ = this.nodeManagerService
      .infoCoreVersion()
      .pipe(untilDestroyed(this));

    this.logArchived$ = this.nodeManagerService
      .logArchived()
      .pipe(untilDestroyed(this));

    this.processList$ = this.managerProcessesIds$.pipe(
      distinctUntilChanged(),
      switchMap((processIds) =>
        this.store.select(
          ManagerProcessesState.getManagerProcessesByIds(processIds)
        )
      )
    );

    timer(0, 3000)
      .pipe(
        untilDestroyed(this),
        exhaustMap(() => this.store.dispatch(new LoadManagerProcesses()))
      )
      .subscribe();
  }

  ngOnDestroy(): void {}
}
