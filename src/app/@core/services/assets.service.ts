import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { Pagination } from '@app/@shared/interfaces/table.types';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';

@Injectable()
export class AssetsService {
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
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler()
    );
  }

  getAssets(
    query: BaseResourcesTypes.AllCollectionsQuery | {} = {},
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
      map((response) => response.body),
      NodeClientService.genericErrorHandler()
    );
  }
}
