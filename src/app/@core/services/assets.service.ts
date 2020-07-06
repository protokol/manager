import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { Pagination, TableApiQuery } from '@app/@shared/interfaces/table.types';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { AssetsServiceInterface } from '@core/interfaces/assets-service.interface';

@Injectable()
export class AssetsService implements AssetsServiceInterface {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getAsset(
    assetId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Assets> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('assets')
        .get(assetId)
    ).pipe(
      NodeClientService.genericErrorHandler(this.log),
      map((response) => response.body.data)
    );
  }

  getAssets(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Assets>> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('assets')
        .all({
          ...query,
        })
    ).pipe(
      NodeClientService.genericListErrorHandler(this.log),
      map((response) => response.body)
    );
  }

  searchAssets(
    query: TableApiQuery = { filters: {} },
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Assets>> {
    const { filters, ...restQuery } = query;

    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('assets')
        .searchByAsset(
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
}
