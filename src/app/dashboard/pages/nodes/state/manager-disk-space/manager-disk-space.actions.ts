export const MANAGER_DISK_SPACE_TYPE_NAME = 'manager_disk_space';

export class ManagerDiskSpaceStartPooling {
  static type = `[${MANAGER_DISK_SPACE_TYPE_NAME}] ManagerLogsStartPooling`;

  constructor() {}
}

export class ManagerDiskSpaceStopPooling {
  static type = `[${MANAGER_DISK_SPACE_TYPE_NAME}] ManagerLogsStopPooling`;

  constructor() {}
}
