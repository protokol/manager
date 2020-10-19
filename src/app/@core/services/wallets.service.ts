import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { Wallet } from '@arkecosystem/client';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';

@Injectable()
export class WalletsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getWallet(
    addressOrPublicKey: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Wallet> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .api('wallets')
        .get(addressOrPublicKey)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getWallets(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<Wallet>> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .api('wallets')
        .all({
          ...query,
        })
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  searchWallets(
    query: TableApiQuery = { filters: {} },
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<Wallet>> {
    const { filters, ...restQuery } = query;

    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .api('wallets')
        .search(
          {
            ...filters,
          },
          {
            ...restQuery,
          }
        )
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }
}
