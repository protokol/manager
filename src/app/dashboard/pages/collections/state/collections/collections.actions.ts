import { NzTableQueryParams } from 'ng-zorro-antd';
import { BaseResourcesTypes } from '@protokol/nft-client';

export const COLLECTIONS_TYPE_NAME = 'collections';

export class LoadCollections {
	static type = `[${COLLECTIONS_TYPE_NAME}] LoadCollections`;

	constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetCollectionsByIds {
	static type = `[${COLLECTIONS_TYPE_NAME}] SetCollectionsByIds`;

	constructor(public collections: BaseResourcesTypes.Collections[] | BaseResourcesTypes.Collections) {}
}
