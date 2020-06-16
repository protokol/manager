import { Logger } from '@core/services/logger.service';
import {
	AddProfileAction,
	PROFILES_TYPE_NAME,
	RemoveProfileAction,
} from './profiles.actions';
import { State, Selector, Action, StateContext, Store } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { WalletService } from '@core/services/wallet.service';
import { NetworksState } from '@core/store/network/networks.state';
import { tap } from 'rxjs/operators';
import { AddPinAction } from '@core/store/pins/pins.actions';

export interface Profile {
	profileName: string;
	encodedPassphrase: string;
}

export interface ProfileWithId extends Profile {
	id: string;
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

	constructor(private walletService: WalletService, private store: Store) {}

	@Selector()
	static getProfileState(state: ProfilesStateModel) {
		return { ...state };
	}

	@Selector()
	static getProfiles({ profiles }: ProfilesStateModel): ProfileWithId[] {
		return Object.keys(profiles).reduce(
			(acc, curr) => [...acc, { ...profiles[curr], id: curr }],
			[]
		);
	}

	@Selector()
	static getProfileById({ profiles }: ProfilesStateModel) {
		return (profileId: string) => {
			return profiles[profileId];
		};
	}

	@Selector()
	static getSelectedProfile({
		profiles,
		selectedProfileId,
	}: ProfilesStateModel) {
		return { ...profiles[selectedProfileId], id: selectedProfileId };
	}

	@Action(AddProfileAction)
	addProfile(
		{ getState, patchState, dispatch }: StateContext<ProfilesStateModel>,
		{
			profile: { profileName, passphrase },
			pin,
			profileId,
			markAsDefault,
		}: AddProfileAction
	) {
		this.store
			.selectOnce(NetworksState.getNodeCryptoConfig)
			.pipe(
				tap((nodeCryptoConfig) => {
					const encodedPassphrase = this.walletService.encrypt(
						passphrase,
						pin,
						nodeCryptoConfig.network
					);
					// const decodedPassphrase = this.walletService.dencrypt(encodedPassphrase, pin, nodeCryptoConfig.network);
					patchState(
						Object.assign(
							{
								profiles: {
									...getState().profiles,
									[profileId]: {
										profileName,
										encodedPassphrase,
									},
								},
							},
							markAsDefault ? { selectedProfileId: profileId } : {}
						)
					);
				}),
				tap(() => dispatch(new AddPinAction(profileId, pin)))
			)
			.subscribe();
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
