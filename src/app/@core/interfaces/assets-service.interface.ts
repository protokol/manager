import { ConnectionOptions } from '@core/interfaces/node.types';
import { Observable } from 'rxjs';
import { BaseResourcesTypes } from '@protokol/client';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';

export interface AssetsServiceInterface {
  getAsset(
    assetId: string,
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Assets>;

  getAssets(
    query: TableApiQuery | {},
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Assets>>;

  searchAssets(
    query: TableApiQuery,
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Assets>>;
}
