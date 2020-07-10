import { v4 as uuid } from 'uuid';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { Profile } from '@app/@core/interfaces/profiles.types';

export const PROFILES_TYPE_NAME = 'profiles';

export class AddProfileAction {
  static type = `[${PROFILES_TYPE_NAME}] AddProfile`;

  constructor(
    public profile: Omit<Profile, 'encodedWif'> & { passphrase: string },
    public pin: string,
    public cryptoConfig: NodeCryptoConfiguration['network'],
    public markAsDefault: boolean = false,
    public profileId: string = uuid()
  ) {}
}

export class SetSelectedProfile {
  static type = `[${PROFILES_TYPE_NAME}] SetSelectedProfile`;

  constructor(public profileId: string) {}
}

export class RemoveProfileAction {
  static type = `[${PROFILES_TYPE_NAME}] RemoveProfile`;

  constructor(public profileId: string) {}
}
