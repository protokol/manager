import { NzTableQueryParams } from 'ng-zorro-antd';
import { Wallet } from '@arkecosystem/client/dist/resourcesTypes/wallets';

export const WALLETS_TYPE_NAME = 'wallets';

export class LoadWallets {
  static type = `[${WALLETS_TYPE_NAME}] LoadWallets`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetWalletsByIds {
  static type = `[${WALLETS_TYPE_NAME}] SetWalletsByIds`;

  constructor(public wallets: Wallet[] | Wallet) {}
}
