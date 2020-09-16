import { NzTableQueryParams } from 'ng-zorro-antd';
import { BaseResourcesTypes } from '@protokol/client';

export const BURNS_TYPE_NAME = 'burns';

export class LoadBurns {
  static type = `[${BURNS_TYPE_NAME}] LoadBurns`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetBurnsByIds {
  static type = `[${BURNS_TYPE_NAME}] SetBurnsByIds`;

  constructor(
    public burns: BaseResourcesTypes.Burns[] | BaseResourcesTypes.Burns
  ) {}
}
