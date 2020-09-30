import { ExchangeResourcesTypes } from '@protokol/client';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

export const BIDS_TYPE_NAME = 'bids';

export class LoadBids {
  static type = `[${BIDS_TYPE_NAME}] LoadBids`;

  constructor(
    public options: {
      tableQueryParams?: NzTableQueryParams;
      canceled?: boolean;
    } = { canceled: false }
  ) {}
}

export class SetBidsByIds {
  static type = `[${BIDS_TYPE_NAME}] SetBidsByIds`;

  constructor(
    public bids: ExchangeResourcesTypes.Bids[] | ExchangeResourcesTypes.Bids
  ) {}
}
