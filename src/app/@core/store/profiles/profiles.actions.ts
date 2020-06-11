import { Profile, ProfilesStateModel } from './profiles.state';
import { v4 as uuid } from 'uuid';

export const PROFILES_TYPE_NAME = 'profiles';

export class AddProfileAction {
	static type = `[${PROFILES_TYPE_NAME}] AddProfile`;

	constructor(
		public profile: Profile,
		public markAsDefault: boolean = false,
		public profileId: string = uuid()
	) {}
}

export class RemoveProfileAction {
	static type = `[${PROFILES_TYPE_NAME}] RemoveProfile`;

	constructor(public profileId: string) {}
}
