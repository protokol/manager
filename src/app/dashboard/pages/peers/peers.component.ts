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
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
  switchMap,
  tap,
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { TableColumnConfig } from '@app/@shared/interfaces/table.types';
import { Logger } from '@app/@core/services/logger.service';
import { PeersState } from '@app/dashboard/pages/peers/state/peers/peers.state';
import {
  PeersStartPooling,
  PeersStopPooling,
} from '@app/dashboard/pages/peers/state/peers/peers.actions';
import { Router } from '@angular/router';
import { Peers } from '@app/dashboard/pages/peers/interfaces/peer.types';
import { PeerUtils } from '@app/dashboard/pages/peers/utils/peer-utils';
import { NodesState } from '@core/store/nodes/nodes.state';
import { NetworkUtils } from '@core/utils/network-utils';
import { AddMyNode, RemoveMyNodeByUrl } from '@core/store/nodes/nodes.actions';
import { DEFAULT_CORE_MANAGER_PORT } from '@core/constants/node.constants';
import { NodeClientService } from '@core/services/node-client.service';
import { NodeManagerSettingsModalComponent } from '@app/dashboard/pages/nodes/components/node-manager-settings-modal/node-manager-settings-modal.component';
import { NodeManagerService } from '@core/services/node-manager.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-peers',
  templateUrl: './peers.component.html',
  styleUrls: ['./peers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeersComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Select(PeersState.getPeersIds) peerIds$: Observable<string[]>;

  @ViewChild('myNodeTpl', { static: true }) myNodeTpl!: TemplateRef<{
    row: Peers;
  }>;
  @ViewChild('heightTpl', { static: true }) heightTpl!: TemplateRef<{
    row: Peers;
  }>;
  @ViewChild('latencyTpl', { static: true }) latencyTpl!: TemplateRef<{
    row: Peers;
  }>;
  @ViewChild('pluginsTpl', { static: true }) pluginsTpl!: TemplateRef<{
    row: Peers;
  }>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
    row: Peers;
  }>;
  @ViewChild('nodeManagerSettingsModalTitleTpl', { static: true })
  nodeManagerSettingsModalTitleTpl!: TemplateRef<{}>;

  isLoading$ = new BehaviorSubject(false);
  isAddingToMyNodesLoading$ = new BehaviorSubject(false);
  isLoadingNodeManager$ = new BehaviorSubject(false);

  rows$: Observable<Peers[]> = of([]);
  tableColumns: TableColumnConfig<Peers>[];

  constructor(
    private store: Store,
    private router: Router,
    private nzMessageService: NzMessageService,
    private nodeClientService: NodeClientService,
    private nodeManagerService: NodeManagerService,
    private nzModalService: NzModalService
  ) {}

  ngOnInit() {
    this.tableColumns = [
      {
        width: '30px',
        columnTransformTpl: this.myNodeTpl,
      },
      {
        propertyName: 'ip',
        headerName: 'Ip',
        width: '150px',
      },
      {
        propertyName: 'port',
        headerName: 'Port',
        width: '100px',
        sortBy: true,
      },
      {
        propertyName: 'version',
        headerName: 'Version',
        width: '200px',
        sortBy: true,
        searchBy: true,
      },
      {
        propertyName: 'height',
        headerName: 'Height',
        width: '120px',
        columnTransformTpl: this.heightTpl,
        sortBy: true,
      },
      {
        propertyName: 'latency',
        headerName: 'Latency',
        columnTransformTpl: this.latencyTpl,
        width: '150px',
        sortBy: true,
        searchBy: true,
      },
      {
        propertyName: 'plugins',
        headerName: 'Plugins',
        columnTransformTpl: this.pluginsTpl,
        width: 'auto',
        searchBy: true,
      },
      {
        headerName: 'Actions',
        columnTransformTpl: this.actionsTpl,
        width: '150px',
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
        tap(() => this.store.dispatch(new PeersStartPooling()))
      )
      .subscribe();
  }

  paginationChange(params: NzTableQueryParams) {
    this.store.dispatch(new PeersStartPooling(params));
  }

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

  isFavNode$(peer: Peers) {
    return this.store.select(
      NodesState.isFavNode(PeerUtils.getApiUrlFromPeer(peer))
    );
  }

  ngOnDestroy() {
    this.store.dispatch(new PeersStopPooling());
  }

  addToMyNodes(event: MouseEvent, peer: Peers) {
    event.preventDefault();

    if (this.isAddingToMyNodesLoading$.getValue()) {
      return;
    }

    this.isAddingToMyNodesLoading$.next(true);

    const nodeBaseUrl = PeerUtils.getApiUrlFromPeer(peer);

    this.nodeClientService
      .getNodeCryptoConfiguration(nodeBaseUrl)
      .pipe(
        switchMap((cryptoConfig) => {
          if (!NetworkUtils.isNodeCryptoConfiguration(cryptoConfig)) {
            return throwError(
              'Invalid node crypto configuration, check if node is online!'
            );
          }

          this.store.dispatch(
            new AddMyNode({
              nodeUrl: nodeBaseUrl,
              coreManagerPort: DEFAULT_CORE_MANAGER_PORT,
            })
          );
          return of(cryptoConfig);
        }),
        catchError((err) => {
          this.log.error(err);
          this.nzMessageService.error(err);
          return of(null);
        }),
        finalize(() => this.isAddingToMyNodesLoading$.next(false)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  removeMyNode(event: MouseEvent, peer: Peers) {
    event.preventDefault();

    if (this.isAddingToMyNodesLoading$.getValue()) {
      return;
    }

    this.store
      .dispatch(new RemoveMyNodeByUrl(PeerUtils.getApiUrlFromPeer(peer)))
      .pipe(finalize(() => this.isAddingToMyNodesLoading$.next(false)))
      .subscribe();
  }

  private getPeerManagerUrl(nodeUrl: string): string {
    return (
      this.store.selectSnapshot(NodesState.getNodeManagerUrl(nodeUrl)) ||
      NetworkUtils.buildNodeManagerUrl(nodeUrl)
    );
  }

  managePeer(event: MouseEvent, peer: Peers) {
    event.preventDefault();

    if (this.isLoadingNodeManager$.getValue()) {
      return;
    }

    const nodeUrl = PeerUtils.getApiUrlFromPeer(peer);
    const managerUrl = this.getPeerManagerUrl(nodeUrl);

    this.isLoadingNodeManager$.next(true);
    this.nodeManagerService
      .infoCoreVersion(managerUrl)
      .pipe(
        untilDestroyed(this),
        tap(
          () => {
            this.router.navigate(['/dashboard/nodes/manager', managerUrl]);
          },
          () => {
            this.nzMessageService.error('Core manager not available!');

            this.nzModalService.create({
              nzTitle: this.nodeManagerSettingsModalTitleTpl,
              nzContent: NodeManagerSettingsModalComponent,
              nzComponentParams: {
                managerUrl,
                nodeUrl,
              },
              nzFooter: null,
              nzWidth: '35vw',
            });
          }
        ),
        finalize(() => this.isLoadingNodeManager$.next(false))
      )
      .subscribe();
  }
}
