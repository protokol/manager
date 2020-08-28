import { NodeManagerAuthentication } from '@core/interfaces/node.types';

export const MANAGER_AUTHENTICATION_TYPE_NAME = 'manager_authentication';

export class ManagerAuthenticationSet {
  static type = `[${MANAGER_AUTHENTICATION_TYPE_NAME}] ManagerAuthenticationSet`;

  constructor(public authentication: NodeManagerAuthentication) {}
}

export class ManagerAuthenticationUnset {
  static type = `[${MANAGER_AUTHENTICATION_TYPE_NAME}] ManagerAuthenticationUnset`;

  constructor() {}
}
