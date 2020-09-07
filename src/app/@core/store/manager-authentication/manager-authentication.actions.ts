import { NodeManagerAuthentication } from '@core/interfaces/node.types';
import { DEFAULT_CORE_MANAGER_PORT } from '@core/constants/node.constants';

export const MANAGER_AUTHENTICATION_TYPE_NAME = 'manager_authentication';

export class ManagerCurrSet {
  static type = `[${MANAGER_AUTHENTICATION_TYPE_NAME}] ManagerCurrSet`;

  constructor(
    public authentication: NodeManagerAuthentication,
    public port: number = DEFAULT_CORE_MANAGER_PORT
  ) {}
}

export class ManagerCurrUnset {
  static type = `[${MANAGER_AUTHENTICATION_TYPE_NAME}] ManagerCurrUnset`;

  constructor() {}
}
