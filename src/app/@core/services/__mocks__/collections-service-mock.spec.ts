import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseResourcesTypes } from '@protokol/client';
import { Pagination } from '@app/@shared/interfaces/table.types';
import { CollectionsServiceInterface } from '@core/interfaces/collections-service.interface';
import {
  collectionsFixture,
  getCollectionFixture,
} from '@core/services/__fixtures__/collections-fixture.spec';
import { getMetaFixture } from '@core/services/__fixtures__/base-fixture.spec';

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
