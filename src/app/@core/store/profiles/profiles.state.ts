import { Logger } from '@core/services/logger.service';
import {
	AddProfileAction,
	PROFILES_TYPE_NAME,
	RemoveProfileAction,
} from './profiles.actions';
import { State, Selector, Action, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';

export interface Profile {
	profileName: string;
	passphrase: string;
}

export interface ProfilesStateModel {
	profiles: { [profileId: string]: Profile };
	selectedProfileId: string | null;
}

const PROFILES_DEFAULT_STATE: ProfilesStateModel = {
	profiles: {},
	selectedProfileId: null,
};

@State<ProfilesStateModel>({
	name: PROFILES_TYPE_NAME,
	defaults: { ...PROFILES_DEFAULT_STATE },
})
@Injectable()
export class ProfilesState {
	readonly log = new Logger(this.constructor.name);

	constructor() {}

	@Selector()
	static getProfileState(state: ProfilesStateModel) {
		return { ...state };
	}

	@Selector()
	static getProfiles({ profiles }: ProfilesStateModel) {
		return Object.keys(profiles).reduce(
			(acc, curr) => [...acc, profiles[curr]],
			[]
		);
	}

	@Selector()
	static getProfileById({ profiles }: ProfilesStateModel) {
		return (profileId: string) => {
			return Object.keys(profiles).find((pId) => pId === profileId);
		};
	}

	@Selector()
	static getSelectedProfile({
		profiles,
		selectedProfileId,
	}: ProfilesStateModel) {
		return Object.keys(profiles).find((pId) => pId === selectedProfileId);
	}

	@Action(AddProfileAction)
	addProfile(
		{ getState, patchState }: StateContext<ProfilesStateModel>,
		{
			profile: { profileName, passphrase },
			profileId,
			markAsDefault,
		}: AddProfileAction,
		{}
	) {
		patchState(
			Object.assign(
				{
					profiles: {
						...getState().profiles,
						[profileId]: {
							profileName,
							passphrase,
						},
					},
				},
				markAsDefault ? { selectedProfileId: profileId } : {}
			)
		);
	}

	@Action(RemoveProfileAction)
	removeProfile(
		{ getState, patchState }: StateContext<ProfilesStateModel>,
		{ profileId }: RemoveProfileAction
	) {
		const { profiles } = getState();

		if (profiles.hasOwnProperty(profileId)) {
			delete profiles[profileId];

			patchState({
				profiles,
			});
		} else {
			this.log.error(`Profile with id: ${profileId} not found!`);
		}
	}
}
