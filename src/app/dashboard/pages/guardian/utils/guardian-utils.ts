import { TRANSACTION_TYPES } from '@app/dashboard/pages/guardian/constants/guardian.constants';
import { PermissionFormItem, PermissionKind } from '@app/dashboard/pages/guardian/interfaces/guardian.types';
import { GuardianResourcesTypes } from '@protokol/client';
import { Permission } from '@protokol/client/dist/resources-types/guardian/groups';

export abstract class GuardianUtils {
  static transactionTypeIndexToGroupName(transactionIndex: string | number) {
    if (!transactionIndex) {
      return 'Transaction index should be defined!';
    }
    const tIndex =
      typeof transactionIndex === 'string'
        ? transactionIndex
        : transactionIndex.toString(10);
    if (TRANSACTION_TYPES.has(tIndex)) {
      return TRANSACTION_TYPES.get(tIndex);
    }
    return `${tIndex} - unknown group`;
  }

  static toPermissionFormItems({ allow, deny }: Partial<GuardianResourcesTypes.Group> | Partial<GuardianResourcesTypes.User> = {
    allow: [],
    deny: []
  }): PermissionFormItem[] {
    const allowed: PermissionFormItem[] = allow.length ? allow.map(({transactionTypeGroup, transactionType}) => ({
      transactionTypeGroup,
      transactionType,
      kind: PermissionKind.Allow
    })) : [];

    const denied: PermissionFormItem[] = deny.length ? deny.map(({transactionTypeGroup, transactionType}) => ({
      transactionTypeGroup,
      transactionType,
      kind: PermissionKind.Deny
    })) : [];

    return [
      ...allowed,
      ...denied
    ];
  }

  static toPermissions(permissions: PermissionFormItem[]): {
    allow?: Permission[];
    deny?: Permission[];
  } {
    const allow: Permission[] = permissions.length
      ? permissions
        .filter(({ kind }) => kind === PermissionKind.Allow)
        .map(({
          transactionType,
          transactionTypeGroup
        }) => ({
          transactionType,
          transactionTypeGroup
        }))
      : [];

    const deny: Permission[] = permissions.length
      ? permissions
        .filter(({ kind }) => kind === PermissionKind.Deny)
        .map(({
          transactionType,
          transactionTypeGroup
        }) => ({
          transactionType,
          transactionTypeGroup
        }))
      : [];

    return {
      ...(allow ? { allow } : {}),
      ...(deny ? { deny } : {}),
    };
  }
}
