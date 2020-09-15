import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { Peers } from '@app/dashboard/pages/peers/interfaces/peer.types';

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
    query: TableApiQuery = { filters: {} },
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<Peers>> {
    const { filters, ...restQuery } = query;

    return defer(() =>
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .api('peers')
        .all({
          ...restQuery,
          ...filters,
        })
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }
}
