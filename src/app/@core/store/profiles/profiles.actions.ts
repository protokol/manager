import { Profile } from './profiles.state';
import { v4 as uuid } from 'uuid';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';

export const PROFILES_TYPE_NAME = 'profiles';

export class AddProfileAction {
  static type = `[${PROFILES_TYPE_NAME}] AddProfile`;

  constructor(
    public profile: Omit<Profile, 'encodedPassphrase'> & { passphrase: string },
    public pin: string,
    public cryptoConfig: NodeCryptoConfiguration['network'],
    public markAsDefault: boolean = false,
    public profileId: string = uuid()
  ) {}
}

export class RemoveProfileAction {
  static type = `[${PROFILES_TYPE_NAME}] RemoveProfile`;

  constructor(public profileId: string) {}
}
