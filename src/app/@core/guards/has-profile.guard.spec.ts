import { TestBed } from '@angular/core/testing';
import { HasProfileGuard } from './has-profile.guard';
import { NgxsModule, Store } from '@ngxs/store';
import { PinsState } from '@core/store/pins/pins.state';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { WalletService } from '@core/services/wallet.service';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { finalize, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';
import { Bip38Service } from '@core/services/bip38.service';
import { ArkCryptoService } from '@core/services/ark-crypto.service';

describe('HasProfileGuard', () => {
  let guard: HasProfileGuard;
  let store: Store;
  const profileIdFixture = uuid();
  const pinFixture = '0000';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        HttpClientTestingModule,
        NgxsModule.forRoot([ProfilesState, PinsState]),
      ],
      providers: [
        Bip38Service,
        ArkCryptoService,
        WalletService,
        HasProfileGuard,
      ],
    });
    guard = TestBed.inject(HasProfileGuard);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should load', (done) => {
    store.reset({
      pins: {
        pins: { [profileIdFixture]: pinFixture },
      },
      profiles: {
        profiles: { [profileIdFixture]: {} },
        selectedProfileId: profileIdFixture,
      },
    });

    guard
      .canLoad()
      .pipe(
        tap((res) => expect(res).toBeTrue()),
        finalize(done)
      )
      .subscribe();
  });
});
