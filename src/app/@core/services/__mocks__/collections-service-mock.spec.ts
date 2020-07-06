import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { Pagination } from '@app/@shared/interfaces/table.types';
import { CollectionsServiceInterface } from '@core/interfaces/collections-service.interface';
import {
  collectionsFixture,
  getCollectionFixture,
  getMetaFixture,
} from '@core/services/__fixtures__/collections-fixture.spec';

@Injectable()
export class CollectionsServiceMock implements CollectionsServiceInterface {
  constructor() {}

  getCollection(
    collectionId: string
  ): Observable<BaseResourcesTypes.Collections> {
    return of(getCollectionFixture(collectionId));
  }

  getCollections(): Observable<Pagination<BaseResourcesTypes.Collections>> {
    const collections = [...collectionsFixture];
    return of({
      data: collections,
      meta: getMetaFixture(collections.length),
    });
  }

  searchCollections(): Observable<Pagination<BaseResourcesTypes.Collections>> {
    const collections = [...collectionsFixture];
    return of({
      data: collections,
      meta: getMetaFixture(collections.length),
    });
  }
}
