import { GuardianResourcesTypes } from '@protokol/client';

export const GUARDIAN_GROUPS_TYPE_NAME = 'guardian_groups';

export class LoadTransactionTypes {
  static type = `[${GUARDIAN_GROUPS_TYPE_NAME}] LoadTransactionTypes`;

  constructor() {}
}

export class LoadGuardianConfigurations {
  static type = `[${GUARDIAN_GROUPS_TYPE_NAME}] LoadGuardianConfigurations`;

  constructor() {}
}

export class LoadGuardianGroups {
  static type = `[${GUARDIAN_GROUPS_TYPE_NAME}] LoadGuardianGroups`;

  constructor() {}
}

export class LoadGuardianGroup {
  static type = `[${GUARDIAN_GROUPS_TYPE_NAME}] LoadGuardianGroup`;

  constructor(public groupName: string) {}
}

export class SetGuardianGroupsByIds {
  static type = `[${GUARDIAN_GROUPS_TYPE_NAME}] SetGuardianGroupsByIds`;

  constructor(
    public groups:
      | GuardianResourcesTypes.Group[]
      | GuardianResourcesTypes.Group
  ) {}
}
