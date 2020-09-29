import { GuardianResourcesTypes } from '@protokol/client';

export type TransactionType = [number, Record<string, number>];

export interface GuardianUserExtended extends GuardianResourcesTypes.User {
  _groups?: GuardianResourcesTypes.Group[];
}
