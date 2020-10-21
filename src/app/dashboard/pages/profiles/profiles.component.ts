import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Logger } from '@app/@core/services/logger.service';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { Profile, ProfileWithId } from '@core/interfaces/profiles.types';
import { catchError, finalize, map, switchMap, take, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { NodeClientService } from '@core/services/node-client.service';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { SetNetwork } from '@core/store/network/networks.actions';
import { SetPinAction } from '@core/store/pins/pins.actions';
import { Router } from '@angular/router';
import { SetProfileUseRandomizedPeer, SetSelectedProfile } from '@core/store/profiles/profiles.actions';
import { NetworkUtils } from '@core/utils/network-utils';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilesComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  currSelectedProfileId$ = new BehaviorSubject<string | null>(null);
  pin$ = new BehaviorSubject<string>('');
  pinInvalid$ = new BehaviorSubject(false);
  isLoading$ = new BehaviorSubject(false);

  @Select(ProfilesState.getSelectedProfile) selectedProfile$: Observable<
    ProfileWithId
  >;
  @Select(ProfilesState.getProfiles) profiles$: Observable<ProfileWithId[]>;

  constructor(
    private store: Store,
    private nodeClientService: NodeClientService,
    private storeUtilsService: StoreUtilsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.selectedProfile$
      .pipe(
        untilDestroyed(this),
        take(1),
        tap((selectedProfile) =>
          this.currSelectedProfileId$.next(selectedProfile.id)
        )
      )
      .subscribe();
  }

  onProfileSelect(event: MouseEvent, profileId: string) {
    event.preventDefault();
    this.currSelectedProfileId$.next(profileId);
  }

  getProfileById(profileId: string): Observable<Profile> {
    return this.store.select(ProfilesState.getProfileById(profileId));
  }

  unlockProfile(event: MouseEvent, nodeBaseUrl: string, profileId: string) {
    event.preventDefault();

    if (this.isLoading$.getValue()) {
      return;
    }

    const pin = this.pin$.getValue();
    this.isLoading$.next(true);
    this.pinInvalid$.next(false);

    this.nodeClientService
      .getNodeCryptoConfiguration(nodeBaseUrl)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.isLoading$.next(false);
        }),
        switchMap((cryptoConfig) => {
          if (!NetworkUtils.isNodeCryptoConfiguration(cryptoConfig)) {
            return throwError('Invalid node crypto configuration');
          }

          return this.storeUtilsService
            .isPinForProfileValid(profileId, pin, cryptoConfig.network)
            .pipe(
              tap((isValidPin) => {
                if (isValidPin) {
                  this.store.dispatch([
                    new SetNetwork(nodeBaseUrl),
                    new SetPinAction(profileId, pin),
                    new SetSelectedProfile(profileId),
                  ]);
                  this.router.navigate(['/dashboard']);
                } else {
                  this.pinInvalid$.next(true);
                }
              })
            );
        }),
        catchError((err) => {
          this.log.error(err);
          this.pinInvalid$.next(true);
          return of(null);
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {}

  isRandomizedPeer(profileId: string): Observable<boolean> {
    return this.store.select(ProfilesState.getProfileById(profileId))
      .pipe(
        map(({ useRandomizedPeer }) => !!useRandomizedPeer)
      );
  }

  setRandomizedPeer(randomize: boolean, profileId: string) {
    debugger;
    this.store.dispatch(new SetProfileUseRandomizedPeer(profileId, randomize));
  }
}
