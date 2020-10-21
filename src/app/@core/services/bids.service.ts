import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { ExchangeResourcesTypes } from '@protokol/client';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class BidsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {}

  getBid(
    bidId: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<ExchangeResourcesTypes.Bids> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('bids').getBidById(bidId))),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getBids(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Bids>> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('bids')
          .getAllBids({
            ...query,
          }))),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  searchBids(
    query: TableApiQuery = { filters: {} },
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Bids>> {
    const { filters, ...restQuery } = query;

    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('bids')
          .searchByBid(
            {
              ...filters,
            },
            {
              ...(restQuery as ExchangeResourcesTypes.SearchBidsApiQuery),
            }
          )
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  canceledBids(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Bids>> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('bids')
          .getAllCanceledBids({
            ...query,
          })
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }
}
