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
import { SearchAuctionsApiQuery } from '@protokol/nft-client/dist/resourcesTypes/exchange';

@Injectable()
export class AuctionsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getAuction(
    auctionId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<ExchangeResourcesTypes.Auctions> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('auctions')
        .getAuctionById(auctionId)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getAuctions(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Auctions>> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('auctions')
        .getAllAuctions({
          ...query,
        })
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  searchAuctions(
    query: TableApiQuery = { filters: {} },
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Auctions>> {
    const { filters, ...restQuery } = query;

    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTExchangeApi('auctions')
        .searchByAsset(
          {
            ...filters,
          },
          {
            ...(restQuery as SearchAuctionsApiQuery),
          }
        )
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }
}
