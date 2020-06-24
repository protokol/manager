import { NzTableQueryParams } from 'ng-zorro-antd';
import { Collections } from '@protokol/nft-client/dist/resourcesTypes/base';

export const COLLECTIONS_TYPE_NAME = 'collections';

export class LoadCollections {
	static type = `[${COLLECTIONS_TYPE_NAME}] LoadCollections`;

	constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetCollectionsByIds {
	static type = `[${COLLECTIONS_TYPE_NAME}] SetCollectionsByIds`;

	constructor(public collections: Collections[] | Collections) {}
}
