import { TestBed } from '@angular/core/testing';
import { Store, NgxsModule } from '@ngxs/store';
import { v4 as uuid } from 'uuid';
import { Profile, ProfilesState } from '@core/store/profiles/profiles.state';
import {
  AddProfileAction,
  RemoveProfileAction,
} from '@core/store/profiles/profiles.actions';
import { Bip38Service } from '@core/services/bip38.service';
import { of } from 'rxjs';
import { first } from 'rxjs/operators';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';

describe('Profiles', () => {
  let store: Store;
  let bip38Service: Bip38Service;
  const profileIdFixture = uuid();
  const passphraseFixture =
    'private chase figure ribbon verify ginger fitness fee keep budget test hero';
  const pinFixture = '1234';
  const profileFixture: Profile = {
    profileName: 'Profile 1',
    encodedPassphrase:
      '1wSiHh5Ku6wy9ft949uf3Co1wGn2ip2CK23DXSVBXw26PYWfAL6GnTfhpT',
  };
  const nodeCryptoConfigurationNetworkFixture: NodeCryptoConfiguration['network'] = {
    aip20: 0,
    bip32: { public: 70617039, private: 70615956 },
    client: {
      token: 'TARK',
      symbol: 'TѦ',
      explorer: 'http://texplorer.ark.io',
    },
    messagePrefix: 'TEST message:↵',
    name: 'testnet',
    nethash: 'd9acd04bde4234a81addb8482333b4ac906bed7be5a9970ce8ada428bd083192',
    pubKeyHash: 23,
    slip44: 1,
    wif: 186,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ProfilesState])],
      providers: [Bip38Service],
    });

    store = TestBed.inject(Store);
    bip38Service = TestBed.inject(Bip38Service);
  });

  it('should add profile', async () => {
    spyOn(bip38Service, 'encrypt').and.returnValue(
      of(profileFixture.encodedPassphrase)
    );

    await store
      .dispatch(
        new AddProfileAction(
          {
            profileName: profileFixture.profileName,
            passphrase: passphraseFixture,
          },
          pinFixture,
          nodeCryptoConfigurationNetworkFixture,
          true,
          profileIdFixture
        )
      )
      .toPromise();

    const selectedProfileId = await store
      .select((state) => state.profiles.selectedProfileId)
      .pipe(first((profileId) => !!profileId))
      .toPromise();
    expect(selectedProfileId).toBe(profileIdFixture);

    const profiles = store.selectSnapshot((state) => state.profiles.profiles);
    expect(profiles).toEqual({ [profileIdFixture]: profileFixture });
  });

  it('should remove profile', async () => {
    store.reset({
      profiles: {
        profiles: { [profileIdFixture]: profileFixture },
      },
    });

    await store.dispatch(new RemoveProfileAction(profileIdFixture));

    const profiles = store.selectSnapshot((state) => state.profiles.profiles);
    expect(profiles).toEqual({});
  });

  it('should select all profiles', () => {
    store.reset({
      profiles: {
        profiles: { [profileIdFixture]: profileFixture },
      },
    });

    const profiles = store.selectSnapshot(ProfilesState.getProfiles);
    expect(profiles).toEqual([
      {
        id: profileIdFixture,
        ...profileFixture,
      },
    ]);
  });

  it('should select profile by id', () => {
    store.reset({
      profiles: {
        profiles: { [profileIdFixture]: profileFixture },
      },
    });

    const profile = store.selectSnapshot(
      ProfilesState.getProfileById(profileIdFixture)
    );
    expect(profile).toEqual({
      ...profileFixture,
    });
  });

  it('should get selected profile', () => {
    store.reset({
      profiles: {
        profiles: { [profileIdFixture]: profileFixture },
        selectedProfileId: profileIdFixture,
      },
    });

    const selectedProfile = store.selectSnapshot(
      ProfilesState.getSelectedProfile
    );
    expect(selectedProfile).toEqual({
      id: profileIdFixture,
      ...profileFixture,
    });
  });
});
