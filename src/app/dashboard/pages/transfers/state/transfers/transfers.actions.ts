import { BaseResourcesTypes } from '@protokol/client';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

export const TRANSFERS_TYPE_NAME = 'transfers';

export class LoadTransfers {
  static type = `[${TRANSFERS_TYPE_NAME}] LoadTransfers`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetTransfersByIds {
  static type = `[${TRANSFERS_TYPE_NAME}] SetTransfersByIds`;

  constructor(
    public transfers:
      | BaseResourcesTypes.Transfers[]
      | BaseResourcesTypes.Transfers
  ) {}
}
