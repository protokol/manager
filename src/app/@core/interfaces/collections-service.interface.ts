import { ConnectionOptions } from '@core/interfaces/node.types';
import { Observable } from 'rxjs';
import { BaseResourcesTypes } from '@protokol/client';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';

export interface CollectionsServiceInterface {
  getCollection(
    collectionId: string,
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Collections>;

  getCollections(
    query: TableApiQuery | {},
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Collections>>;

  searchCollections(
    query: TableApiQuery,
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Collections>>;
}
