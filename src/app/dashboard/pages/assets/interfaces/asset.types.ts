import { BaseResourcesTypes } from '@protokol/nft-client';

export interface AssetWithCollection extends BaseResourcesTypes.Assets {
	collection?: BaseResourcesTypes.Collections;
}
