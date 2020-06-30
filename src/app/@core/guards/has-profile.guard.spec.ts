import { TestBed } from '@angular/core/testing';
import { HasProfileGuard } from './has-profile.guard';
import { NgxsModule, Store } from '@ngxs/store';
import { PinsState } from '@core/store/pins/pins.state';
import { Profile, ProfilesState } from '@core/store/profiles/profiles.state';
import { WalletService } from '@core/services/wallet.service';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

describe('HasProfileGuard', () => {
  let guard: HasProfileGuard;
  let router: Router;
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
      providers: [WalletService, HasProfileGuard],
    });
    guard = TestBed.inject(HasProfileGuard);
    router = TestBed.inject(Router);
    store = TestBed.inject(Store);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should prevent load', (done) => {
    guard
      .canLoad()
      .pipe(finalize(done))
      .subscribe((res) => expect(res).toBeFalsy());
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
      .pipe(finalize(done))
      .subscribe((res) => expect(res).toBeTrue());
  });
});
