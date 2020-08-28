import { NzTableQueryParams } from 'ng-zorro-antd';
import { Wallet } from '@arkecosystem/client';

export interface WalletLoadOptions {
  collectionId?: string;
  assetId?: string;
}

export const WALLETS_TYPE_NAME = 'wallets';

export class LoadWallet {
  static type = `[${WALLETS_TYPE_NAME}] LoadWallet`;

  constructor(
    public walletId: string,
    public options: WalletLoadOptions = {
      collectionId: null,
      assetId: null,
    }
  ) {}
}

export class LoadWallets {
  static type = `[${WALLETS_TYPE_NAME}] LoadWallets`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetWalletsByIds {
  static type = `[${WALLETS_TYPE_NAME}] SetWalletsByIds`;

  constructor(public wallets: Wallet[] | Wallet) {}
}
