import { NzTableQueryParams } from 'ng-zorro-antd';
import { ExchangeResourcesTypes } from '@protokol/nft-client';

export const AUCTIONS_TYPE_NAME = 'auctions';

export class LoadAuctions {
  static type = `[${AUCTIONS_TYPE_NAME}] LoadAuctions`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetAuctionsByIds {
  static type = `[${AUCTIONS_TYPE_NAME}] SetAuctionsByIds`;

  constructor(
    public auctions:
      | ExchangeResourcesTypes.Auctions[]
      | ExchangeResourcesTypes.Auctions
  ) {}
}
