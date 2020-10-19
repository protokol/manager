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
export class BidsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getBid(
    bidId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<ExchangeResourcesTypes.Bids> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('bids')
        .getBidById(bidId)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getBids(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Bids>> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('bids')
        .getAllBids({
          ...query,
        })
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  searchBids(
    query: TableApiQuery = { filters: {} },
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Bids>> {
    const { filters, ...restQuery } = query;

    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('bids')
        .searchByBid(
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

  canceledBids(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Bids>> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('bids')
        .getAllCanceledBids({
          ...query,
        })
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }
}
