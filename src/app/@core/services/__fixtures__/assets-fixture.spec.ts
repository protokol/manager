import { BaseResourcesTypes } from '@protokol/nft-client';
import { v4 as uuid } from 'uuid';

const assetFixture: BaseResourcesTypes.Assets = {
  id: uuid(),
  ownerPublicKey:
    '02ad799c6bd670746892bd4331e1aebada26a2cc3ccaf0fde1e94942b20066b05a',
  senderPublicKey:
    '02ad799c6bd670746892bd4331e1aebada26a2cc3ccaf0fde1e94942b20066b05a',
  collectionId: uuid(),
  attributes: {
    name: 'Player 1',
    pac: 78,
    sho: 65,
    pas: 23,
    dri: 32,
    def: 21,
    phy: 12,
  },
};

const getAssetFixture = (id: string = uuid()): BaseResourcesTypes.Assets => ({
  ...assetFixture,
  id,
});

const getAssetsFixture = (
  length: number = 100
): BaseResourcesTypes.Assets[] => {
  return Array.from({ length }, () => getAssetFixture());
};

const assetsFixture = getAssetsFixture();

export { assetFixture, assetsFixture, getAssetFixture, getAssetsFixture };
