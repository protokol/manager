import { NzTableQueryParams } from 'ng-zorro-antd';
import { ExchangeResourcesTypes } from '@protokol/nft-client';

export const TRADES_TYPE_NAME = 'trades';

export class LoadTrades {
  static type = `[${TRADES_TYPE_NAME}] LoadTrades`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetTradesByIds {
  static type = `[${TRADES_TYPE_NAME}] SetTradesByIds`;

  constructor(
    public trades:
      | ExchangeResourcesTypes.Trades[]
      | ExchangeResourcesTypes.Trades
  ) {}
}
