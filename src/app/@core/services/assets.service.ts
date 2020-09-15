import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { AssetsServiceInterface } from '@core/interfaces/assets-service.interface';
import { WalletsService } from '@core/services/wallets.service';

@Injectable()
export class AssetsService implements AssetsServiceInterface {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store, private walletsService: WalletsService) {}

  getAsset(
    assetId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Assets> {
    return defer(() =>
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('assets')
        .get(assetId)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getAssets(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Assets>> {
    return defer(() =>
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('assets')
        .all({
          ...query,
        })
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  searchAssets(
    query: TableApiQuery = { filters: {} },
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Assets>> {
    const { filters, ...restQuery } = query;

    return defer(() =>
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
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  getAssetOwner(
    assetId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.AssetsWallet> {
    return defer(() =>
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('assets')
        .wallet(assetId)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  getAssetsByWalletId(
    addressOrPublicKey: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<Partial<BaseResourcesTypes.Assets>>> {
    return this.walletsService
      .getWallet(addressOrPublicKey, baseUrl, connectionOptions)
      .pipe(
        map((wallet) => {
          const {
            attributes: {
              nft: {
                base: { tokenIds },
              },
            },
          } = wallet;
          const data = Object.keys(tokenIds || {}).map((id) => ({
            id,
          })) as Partial<BaseResourcesTypes.Assets>[];

          return {
            data,
            meta: {
              pageCount: data.length,
              totalCount: data.length,
              count: data.length,
              first: '',
              last: '',
              next: undefined,
              previous: undefined,
              self: '',
              totalCountIsEstimate: false,
            },
          };
        })
      );
  }
}
