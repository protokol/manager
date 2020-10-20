import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { ExchangeResourcesTypes } from '@protokol/client';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class TradesService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {}

  getTrade(
    tradeId: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<ExchangeResourcesTypes.TradeById> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('trades').get(tradeId))),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getTrades(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Trades>> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('trades')
          .all({
            ...query,
          }))),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  searchTrades(
    query: TableApiQuery = { filters: {} },
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<ExchangeResourcesTypes.Trades>> {
    const { filters, ...restQuery } = query;

    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTExchangeApi('trades')
          .search(
            {
              ...filters,
            },
            {
              ...(restQuery as ExchangeResourcesTypes.SearchBidsApiQuery),
            }
          ))),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }
}
