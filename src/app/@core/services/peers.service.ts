import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { Peers } from '@app/dashboard/pages/peers/interfaces/peer.types';
import { PeerDiscovery } from '@protokol/client';
import { IPeerResponse } from '@protokol/client/dist/peer-discovery/interfaces';
import { TableUtils } from '@shared/utils/table-utils';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Injectable()
export class PeersService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getPeer(
    ip: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Peers> {
    return defer(() =>
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .api('peers')
        .get(ip)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getPeers(
    query: NzTableQueryParams | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<IPeerResponse[]> {
    const { sort, filter } = query as NzTableQueryParams;

    return defer(() =>
      PeerDiscovery.new(
        NodeClientService.getConnection(baseUrl, connectionOptions)
      )
    ).pipe(
      switchMap((peerDiscovery) =>
        defer(() => {
          let applyPeerDiscovery = peerDiscovery;

          const versionFilter = TableUtils.getFilterValue(filter, 'version');
          if (versionFilter) {
            applyPeerDiscovery = applyPeerDiscovery.withVersion(versionFilter);
          }

          const latencyFilter = TableUtils.getFilterValue(filter, 'latency');
          if (latencyFilter) {
            try {
              applyPeerDiscovery = applyPeerDiscovery.withLatency(
                parseInt(latencyFilter, 10)
              );
            } catch (ex) {
              this.log.error(ex);
            }
          }

          const { key, direction } = TableUtils.getSort(sort);
          if (key && direction) {
            applyPeerDiscovery = applyPeerDiscovery.sortBy(key, direction);
          }

          const pluginsFilter = TableUtils.getFilterValue(filter, 'plugins');
          if (pluginsFilter) {
            return applyPeerDiscovery.findPeersWithPlugin(pluginsFilter, {
              additional: ['version', 'height', 'latency', 'plugins'],
            });
          } else {
            return applyPeerDiscovery.findPeers();
          }
        })
      ),
      NodeClientService.genericErrorHandler(this.log)
    );
  }
}
