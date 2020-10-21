import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/client';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { AssetsServiceInterface } from '@core/interfaces/assets-service.interface';
import { WalletsService } from '@core/services/wallets.service';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class AssetsService implements AssetsServiceInterface {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService, private walletsService: WalletsService) {}

  getAsset(
    assetId: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Assets> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('assets')
            .get(assetId)
          )),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getAssets(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Assets>> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('assets')
          .all({
            ...query,
          })
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  searchAssets(
    query: TableApiQuery = { filters: {} },
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Assets>> {
    const { filters, ...restQuery } = query;

    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('assets')
          .searchByAsset(
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

  getAssetOwner(
    assetId: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.AssetsWallet> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('assets')
          .wallet(assetId)
        )),
        map((response) => response?.body?.data),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  getAssetsByWalletId(
    addressOrPublicKey: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<Partial<BaseResourcesTypes.Assets>>> {
    return this.walletsService
      .getWallet(addressOrPublicKey, baseUrl, connectionOptions)
      .pipe(
        map((wallet) => {
          const tokenIds = wallet?.attributes?.nft?.base?.tokenIds;
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
