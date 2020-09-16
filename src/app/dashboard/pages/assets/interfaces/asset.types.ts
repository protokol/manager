import { BaseResourcesTypes } from '@protokol/client';

export interface AssetWithCollection extends BaseResourcesTypes.Assets {
  collection?: BaseResourcesTypes.Collections;
}
