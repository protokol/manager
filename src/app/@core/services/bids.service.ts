import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { ExchangeResourcesTypes } from '@protokol/nft-client';
import { SearchBidsApiQuery } from '@protokol/nft-client/dist/resourcesTypes/exchange';

@Injectable()
export class BidsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getBid(
    bidId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<ExchangeResourcesTypes.Bids> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
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
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
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

    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('bids')
        .searchByBid(
          {
            ...filters,
          },
          {
            ...(restQuery as SearchBidsApiQuery),
          }
        )
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }
}
