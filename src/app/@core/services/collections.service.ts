import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { Pagination, TableApiQuery } from '@app/@shared/interfaces/table.types';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NodeClientService } from '@core/services/node-client.service';
import { Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import { CollectionsServiceInterface } from '@core/interfaces/collections-service.interface';
import { CollectionsWallet } from '@protokol/nft-client/dist/resourcesTypes/base/collections';

@Injectable()
export class CollectionsService implements CollectionsServiceInterface {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getCollection(
    collectionId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Collections> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('collections')
        .get(collectionId)
    ).pipe(
      NodeClientService.genericErrorHandler(this.log),
      map((response) => response.body.data)
    );
  }

  getCollections(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Collections>> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('collections')
        .all({
          ...query,
        })
    ).pipe(
      NodeClientService.genericListErrorHandler(this.log),
      map((response) => response.body)
    );
  }

  searchCollections(
    query: TableApiQuery = { filters: {} },
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Collections>> {
    const { filters, ...restQuery } = query;

    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
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
      NodeClientService.genericListErrorHandler(this.log),
      map((response) => response.body)
    );
  }

  getCollectionOwner(
    collectionId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<CollectionsWallet> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('collections')
        .wallet(collectionId)
    ).pipe(
      NodeClientService.genericListErrorHandler(this.log),
      map((response) => response.body.data)
    );
  }
}
