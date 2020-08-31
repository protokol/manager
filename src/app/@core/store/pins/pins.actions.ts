export const PINS_TYPE_NAME = 'pins';

export class SetPinAction {
  static type = `[${PINS_TYPE_NAME}] AddPin`;

  constructor(public profileId: string, public pin: string) {}
}

export class ClearPinsAction {
  static type = `[${PINS_TYPE_NAME}] ClearPinsAction`;

  constructor() {}
}
