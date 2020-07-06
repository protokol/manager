import { BaseResourcesTypes } from '@protokol/nft-client';
import { v4 as uuid } from 'uuid';

const collectionFixture: BaseResourcesTypes.Collections = {
  id: uuid(),
  senderPublicKey:
    '022f2978d57f95c021b9d4bf082b482738ce392bcf6bc213710e7a21504cfeb5a0',
  name: 'FIFA-20-PLAYERS',
  description: 'FIFA 2020 Players',
  maximumSupply: 1,
  jsonSchema: {
    properties: {
      name: { type: 'string' },
      pac: { type: 'number' },
      sho: { type: 'number' },
      pas: { type: 'number' },
      dri: { type: 'number' },
      def: { type: 'number' },
      phy: { type: 'number' },
    },
  },
};

const getCollectionFixture = (
  id: string = uuid()
): BaseResourcesTypes.Collections => ({
  ...collectionFixture,
  id,
});

const getCollectionsFixture = (
  length: number = 100
): BaseResourcesTypes.Collections[] => {
  return Array.from({ length }, () => getCollectionFixture());
};

const collectionsFixture = getCollectionsFixture();

export {
  collectionFixture,
  collectionsFixture,
  getCollectionFixture,
  getCollectionsFixture,
};
