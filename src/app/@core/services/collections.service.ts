import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/client';
import { Pagination, TableApiQuery } from '@app/@shared/interfaces/table.types';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NodeClientService } from '@core/services/node-client.service';
import { Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import { CollectionsServiceInterface } from '@core/interfaces/collections-service.interface';

@Injectable()
export class CollectionsService implements CollectionsServiceInterface {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getCollection(
    collectionId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Collections> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .NFTBaseApi('collections')
        .get(collectionId)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getCollections(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Collections>> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .NFTBaseApi('collections')
        .all({
          ...query,
        })
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  searchCollections(
    query: TableApiQuery = { filters: {} },
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Collections>> {
    const { filters, ...restQuery } = query;

    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .NFTBaseApi('collections')
        .searchByCollections(
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

  getCollectionOwner(
    collectionId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.CollectionsWallet> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .NFTBaseApi('collections')
        .wallet(collectionId)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }
}
