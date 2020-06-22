import { Collections } from '@protokol/nft-client';

export const COLLECTIONS_TYPE_NAME = 'collections';

export class LoadCollections {
	static type = `[${COLLECTIONS_TYPE_NAME}] LoadCollections`;

	constructor() {}
}

export class SetCollectionsByIds {
	static type = `[${COLLECTIONS_TYPE_NAME}] SetCollectionsByIds`;

	constructor(public collections: Collections[] | Collections) {}
}
