import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { Wallet } from '@arkecosystem/client';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class WalletsService {
  readonly log = new Logger(this.constructor.name);

  constructor(
    private baseService: BaseService
  ) {
  }

  getWallet(
    addressOrPublicKey: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Wallet> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.api('wallets')
          .get(addressOrPublicKey)
        )),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getWallets(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<Wallet>> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.api('wallets')
          .all({
            ...query
          })
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  searchWallets(
    query: TableApiQuery = { filters: {} },
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<Wallet>> {
    const { filters, ...restQuery } = query;

    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.api('wallets')
          .search(
            {
              ...filters
            },
            {
              ...restQuery
            }
          )
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }
}
