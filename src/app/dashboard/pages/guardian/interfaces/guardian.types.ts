import { GuardianResourcesTypes } from '@protokol/client';
import { Observable } from 'rxjs';
import { Pagination } from '@shared/interfaces/table.types';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

export type TransactionType = [number, Record<string, number>];

export interface GuardianUserExtended extends GuardianResourcesTypes.User {
  _groups?: GuardianResourcesTypes.Group[];
}

export type LoadGuardianGroupsSelectFunc = (
  queryParams: NzTableQueryParams | null
) => Observable<Pagination<Partial<GuardianResourcesTypes.Group>>>;

export interface UserGroupsFormItem {
  name: string;
}

export enum PermissionKind {
  Intermediate = -1,
  Deny = 0,
  Allow = 1,
}

export interface PermissionFormItem extends GuardianResourcesTypes.Permission {
  kind: PermissionKind.Intermediate | PermissionKind.Deny | PermissionKind.Allow;
}
