import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { ExchangeResourcesTypes } from '@protokol/client';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class AuctionsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {}

  getAuction(
    auctionId: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<ExchangeResourcesTypes.Auctions> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('auctions')
          .getAuctionById(auctionId))
        ),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getAuctions(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Auctions>> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('auctions')
          .getAllAuctions({
            ...query,
          })
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  getAllCanceledAuctions(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Auctions>> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('auctions')
          .getAllCanceledAuctions({
            ...query,
          })
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  searchAuctions(
    query: TableApiQuery = { filters: {} },
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Auctions>> {
    const { filters, ...restQuery } = query;

    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('auctions')
          .searchByAsset(
            {
              ...filters,
            },
            {
              ...(restQuery as ExchangeResourcesTypes.SearchAuctionsApiQuery),
            }
          )
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }
}
