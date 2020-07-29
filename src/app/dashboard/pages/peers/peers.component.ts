import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { NzMessageService, NzTableQueryParams } from 'ng-zorro-antd';
import { Logger } from '@app/@core/services/logger.service';
import { PeersState } from '@app/dashboard/pages/peers/state/peers/peers.state';
import { LoadPeers } from '@app/dashboard/pages/peers/state/peers/peers.actions';
import { Router } from '@angular/router';
import { Peers } from '@app/dashboard/pages/peers/interfaces/peer.types';
import { PeerUtils } from '@app/dashboard/pages/peers/utils/peer-utils';

@Component({
  selector: 'app-peers',
  templateUrl: './peers.component.html',
  styleUrls: ['./peers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeersComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Select(PeersState.getPeersIds) peerIds$: Observable<string[]>;
  @Select(PeersState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('pluginsTpl', { static: true }) pluginsTpl!: TemplateRef<{
    row: Peers;
  }>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
    row: Peers;
  }>;

  isLoading$ = new BehaviorSubject(false);

  rows$: Observable<Peers[]> = of([]);
  tableColumns: TableColumnConfig<Peers>[];

  constructor(
    private store: Store,
    private router: Router,
    private nzMessageService: NzMessageService
  ) {}

  ngOnInit() {
    this.tableColumns = [
      {
        propertyName: 'ip',
        headerName: 'Ip',
        sortBy: true,
        width: '150px',
      },
      {
        propertyName: 'port',
        headerName: 'Port',
        width: '80px',
      },
      {
        propertyName: 'version',
        headerName: 'Version',
        width: '120px',
      },
      {
        propertyName: 'height',
        headerName: 'Height',
        width: '120px',
      },
      {
        propertyName: 'latency',
        headerName: 'Latency',
      },
      {
        headerName: 'Plugins',
        columnTransformTpl: this.pluginsTpl,
      },
      {
        headerName: 'Actions',
        columnTransformTpl: this.actionsTpl,
        width: '120px',
      },
    ];

    this.rows$ = this.peerIds$.pipe(
      distinctUntilChanged(),
      switchMap((peerIds) =>
        this.store.select(PeersState.getPeersByIds(peerIds))
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.store
      .select(NetworksState.getBaseUrl)
      .pipe(
        untilDestroyed(this),
        filter((baseUrl) => !!baseUrl),
        tap(() => this.isLoading$.next(true)),
        tap(() => this.store.dispatch(new LoadPeers()))
      )
      .subscribe();
  }

  paginationChange(params: NzTableQueryParams) {
    this.store.dispatch(new LoadPeers(params));
  }

  ngOnDestroy() {}

  showConfig(event: MouseEvent, peer: Peers) {
    event.preventDefault();

    const peerCoreApiUrl = PeerUtils.getApiUrlFromPeer(peer);
    if (!peerCoreApiUrl) {
      this.nzMessageService.error(
        'Unable to find core-api enabled on the peer!'
      );
    }

    this.router.navigate(['/dashboard/nodes', peerCoreApiUrl]);
  }
}
