import { BaseResourcesTypes } from '@protokol/client';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

export const COLLECTIONS_TYPE_NAME = 'collections';

export class LoadCollection {
  static type = `[${COLLECTIONS_TYPE_NAME}] LoadCollection`;

  constructor(public collectionId: string) {}
}

export class LoadCollections {
  static type = `[${COLLECTIONS_TYPE_NAME}] LoadCollections`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetCollectionsByIds {
  static type = `[${COLLECTIONS_TYPE_NAME}] SetCollectionsByIds`;

  constructor(
    public collections:
      | BaseResourcesTypes.Collections[]
      | BaseResourcesTypes.Collections
  ) {}
}
