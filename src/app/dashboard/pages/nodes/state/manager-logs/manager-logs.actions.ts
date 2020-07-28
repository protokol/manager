export const MANAGER_LOGS_TYPE_NAME = 'manager_logs';

export class ManagerLogsStartPooling {
  static type = `[${MANAGER_LOGS_TYPE_NAME}] ManagerLogsStartPooling`;

  constructor(public logName: string) {}
}

export class ManagerLogsStopPooling {
  static type = `[${MANAGER_LOGS_TYPE_NAME}] ManagerLogsStopPooling`;

  constructor(public logName: string) {}
}
