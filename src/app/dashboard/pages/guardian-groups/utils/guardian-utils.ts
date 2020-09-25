import { TRANSACTION_TYPES } from '@app/dashboard/pages/guardian-groups/constants/guardian.constants';

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
}
