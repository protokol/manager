import { NzTableQueryParams } from 'ng-zorro-antd';
import { BaseResourcesTypes } from '@protokol/nft-client';

export const ASSETS_TYPE_NAME = 'assets';

export class LoadAssets {
	static type = `[${ASSETS_TYPE_NAME}] LoadAssets`;

	constructor(public tableQueryParams?: NzTableQueryParams,
													public options: { withLoadCollection } = { withLoadCollection: false }) {
	}
}

export class SetAssetsByIds {
	static type = `[${ASSETS_TYPE_NAME}] SetAssetsByIds`;

	constructor(public assets: BaseResourcesTypes.Assets[] | BaseResourcesTypes.Assets) {}
}
