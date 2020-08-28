import { NzTableQueryParams } from 'ng-zorro-antd';
import { BaseResourcesTypes } from '@protokol/nft-client';

export interface AssetLoadOptions {
  withCollection: boolean;
}

export const ASSETS_TYPE_NAME = 'assets';

export class LoadAsset {
  static type = `[${ASSETS_TYPE_NAME}] LoadAsset`;

  constructor(
    public assetId: string,
    public options: AssetLoadOptions = { withCollection: false }
  ) {}
}

export class LoadAssets {
  static type = `[${ASSETS_TYPE_NAME}] LoadAssets`;

  constructor(
    public tableQueryParams?: NzTableQueryParams,
    public options: AssetLoadOptions = { withCollection: false }
  ) {}
}

export class SetAssetsByIds {
  static type = `[${ASSETS_TYPE_NAME}] SetAssetsByIds`;

  constructor(
    public assets: BaseResourcesTypes.Assets[] | BaseResourcesTypes.Assets
  ) {}
}
