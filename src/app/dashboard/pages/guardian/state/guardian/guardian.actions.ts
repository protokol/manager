import { GuardianResourcesTypes } from '@protokol/client';

export interface GuardianUserLoadOptions {
  withGroups: boolean;
}

export const GUARDIAN_TYPE_NAME = 'guardian';

export class LoadTransactionTypes {
  static type = `[${GUARDIAN_TYPE_NAME}] LoadTransactionTypes`;

  constructor() {}
}

export class LoadGuardianConfigurations {
  static type = `[${GUARDIAN_TYPE_NAME}] LoadGuardianConfigurations`;

  constructor() {}
}

export class LoadGuardianGroups {
  static type = `[${GUARDIAN_TYPE_NAME}] LoadGuardianGroups`;

  constructor() {}
}

export class LoadGuardianGroup {
  static type = `[${GUARDIAN_TYPE_NAME}] LoadGuardianGroup`;

  constructor(public groupName: string) {}
}

export class SetGuardianGroupsByIds {
  static type = `[${GUARDIAN_TYPE_NAME}] SetGuardianGroupsByIds`;

  constructor(
    public groups:
      | GuardianResourcesTypes.Group[]
      | GuardianResourcesTypes.Group
  ) {}
}

export class LoadGuardianUsers {
  static type = `[${GUARDIAN_TYPE_NAME}] LoadGuardianUsers`;

  constructor(public options: GuardianUserLoadOptions = { withGroups: false }) {}
}

export class LoadGuardianUser {
  static type = `[${GUARDIAN_TYPE_NAME}] LoadGuardianUser`;

  constructor(public publicKey: string, public options: GuardianUserLoadOptions = { withGroups: false }) {}
}

export class SetGuardianUsersByIds {
  static type = `[${GUARDIAN_TYPE_NAME}] SetGuardianUsersByIds`;

  constructor(
    public users:
      | GuardianResourcesTypes.User[]
      | GuardianResourcesTypes.User
  ) {}
}

export class LoadGuardianUserGroups {
  static type = `[${GUARDIAN_TYPE_NAME}] LoadGuardianUserGroups`;

  constructor(public publicKey: string) {
  }
}

export class ClearGuardianGroupUsers {
  static type = `[${GUARDIAN_TYPE_NAME}] ClearGuardianGroupUsers`;

  constructor(public groupName: string) {
  }
}

export class LoadGuardianGroupUsers {
  static type = `[${GUARDIAN_TYPE_NAME}] LoadGuardianGroupUsers`;

  constructor(public groupName: string) {
  }
}
