import {
  SnapshotsCreatePayload,
  SnapshotsListItem,
  SnapshotsRestorePayload,
} from '@core/interfaces/core-manager.types';

export const MANAGER_SNAPSHOTS_TYPE_NAME = 'manager_snapshots';

export class LoadManagerSnapshots {
  static type = `[${MANAGER_SNAPSHOTS_TYPE_NAME}] LoadManagerSnapshots`;

  constructor(public managerUrl?: string) {}
}

export class SetManagerSnapshotsByIds {
  static type = `[${MANAGER_SNAPSHOTS_TYPE_NAME}] SetManagerSnapshotsByIds`;

  constructor(public snapshots: SnapshotsListItem[] | SnapshotsListItem) {}
}

export class ManagerCreateSnapshot {
  static type = `[${MANAGER_SNAPSHOTS_TYPE_NAME}] ManagerCreateSnapshot`;

  constructor(
    public payload: SnapshotsCreatePayload,
    public managerUrl?: string
  ) {}
}

export class ManagerRestoreSnapshot {
  static type = `[${MANAGER_SNAPSHOTS_TYPE_NAME}] ManagerRestoreSnapshot`;

  constructor(
    public payload: SnapshotsRestorePayload,
    public managerUrl?: string
  ) {}
}

export class ManagerDeleteSnapshot {
  static type = `[${MANAGER_SNAPSHOTS_TYPE_NAME}] ManagerDeleteSnapshot`;

  constructor(public snapshotName: string, public managerUrl?: string) {}
}
