export const NETWORKS_TYPE_NAME = 'networks';

export class SetNetwork {
  static type = `[${NETWORKS_TYPE_NAME}] SetNetwork`;

  constructor(public baseUrl: string) {}
}
