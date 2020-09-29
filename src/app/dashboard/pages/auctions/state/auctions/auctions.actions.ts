import { ExchangeResourcesTypes } from '@protokol/client';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

export const AUCTIONS_TYPE_NAME = 'auctions';

export class LoadAuction {
  static type = `[${AUCTIONS_TYPE_NAME}] LoadAuction`;

  constructor(public auctionId: string) {}
}

export class LoadAuctions {
  static type = `[${AUCTIONS_TYPE_NAME}] LoadAuctions`;

  constructor(
    public options: {
      tableQueryParams?: NzTableQueryParams;
      canceled?: boolean;
    } = { canceled: false }
  ) {}
}

export class SetAuctionsByIds {
  static type = `[${AUCTIONS_TYPE_NAME}] SetAuctionsByIds`;

  constructor(
    public auctions:
      | ExchangeResourcesTypes.Auctions[]
      | ExchangeResourcesTypes.Auctions
  ) {}
}
