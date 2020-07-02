import { Logger } from '@core/services/logger.service';
import {
  AddProfileAction,
  PROFILES_TYPE_NAME,
  RemoveProfileAction,
} from './profiles.actions';
import {
  State,
  Selector,
  Action,
  StateContext,
  createSelector,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { AddPinAction } from '@core/store/pins/pins.actions';
import { Bip38Service } from '@core/services/bip38.service';
import { tap } from 'rxjs/operators';

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

  constructor(private bip38Service: Bip38Service) {}

  @Selector()
  static getProfiles({ profiles }: ProfilesStateModel): ProfileWithId[] {
    return Object.keys(profiles).reduce(
      (acc, curr) => [...acc, { ...profiles[curr], id: curr }],
      []
    );
  }

  static getProfileById(profileId: string) {
    return createSelector(
      [ProfilesState],
      ({ profiles }: ProfilesStateModel) => {
        return profiles[profileId];
      }
    );
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
      cryptoConfig,
      profileId,
      markAsDefault,
    }: AddProfileAction
  ) {
    return this.bip38Service.encrypt(passphrase, pin, cryptoConfig).pipe(
      tap((encodedPassphrase) => {
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
