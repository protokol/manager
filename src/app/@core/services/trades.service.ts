import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { ExchangeResourcesTypes } from '@protokol/client';

@Injectable()
export class TradesService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getTrade(
    tradeId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<ExchangeResourcesTypes.TradeById> {
    return defer(() =>
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('trades')
        .get(tradeId)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getTrades(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Trades>> {
    return defer(() =>
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('trades')
        .all({
          ...query,
        })
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  searchTrades(
    query: TableApiQuery = { filters: {} },
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Trades>> {
    const { filters, ...restQuery } = query;

    return defer(() =>
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('trades')
        .search(
          {
            ...filters,
          },
          {
            ...(restQuery as ExchangeResourcesTypes.SearchBidsApiQuery),
          }
        )
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }
}
