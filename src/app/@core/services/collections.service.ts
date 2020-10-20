import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/client';
import { Pagination, TableApiQuery } from '@app/@shared/interfaces/table.types';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { CollectionsServiceInterface } from '@core/interfaces/collections-service.interface';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class CollectionsService implements CollectionsServiceInterface {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {}

  getCollection(
    collectionId: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Collections> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('collections')
          .get(collectionId)
        )),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getCollections(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Collections>> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('collections')
          .all({
            ...query,
          })
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  searchCollections(
    query: TableApiQuery = { filters: {} },
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Collections>> {
    const { filters, ...restQuery } = query;

    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('collections')
          .searchByCollections(
            {
              ...filters,
            },
            {
              ...restQuery,
            }
          )
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  getCollectionOwner(
    collectionId: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.CollectionsWallet> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('collections')
          .wallet(collectionId)
        )),
        map((response) => response?.body?.data),
        BaseService.genericListErrorHandler(this.log)
      );
  }
}
