export const NETWORKS_TYPE_NAME = 'networks';

export class SetNetwork {
  static type = `[${NETWORKS_TYPE_NAME}] SetNetwork`;

  constructor(public baseUrl: string) {}
}

export class SetCoreManagerPort {
  static type = `[${NETWORKS_TYPE_NAME}] SetCoreManagerPort`;

  constructor(public coreManagerPort: number) {}
}

export class ClearNetwork {
  static type = `[${NETWORKS_TYPE_NAME}] ClearNetwork`;

  constructor() {}
}

export class LastBlockStartPooling {
  static type = `[${NETWORKS_TYPE_NAME}] LastBlockStartPooling`;

  constructor() {}
}

export class LastBlockStopPooling {
  static type = `[${NETWORKS_TYPE_NAME}] LastBlockStopPooling`;

  constructor() {}
}
