import { ExchangeResourcesTypes } from '@protokol/client';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

export const TRADES_TYPE_NAME = 'trades';

export class LoadTrade {
  static type = `[${TRADES_TYPE_NAME}] LoadTrade`;

  constructor(public tradeId: string) {}
}

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
