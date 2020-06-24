import { NzTableQueryParams } from 'ng-zorro-antd';
import { Assets } from '@protokol/nft-client/dist/resourcesTypes/base';

export const ASSETS_TYPE_NAME = 'assets';

export class LoadAssets {
	static type = `[${ASSETS_TYPE_NAME}] LoadAssets`;

	constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetAssetsByIds {
	static type = `[${ASSETS_TYPE_NAME}] SetAssetsByIds`;

	constructor(public assets: Assets[] | Assets) {}
}
