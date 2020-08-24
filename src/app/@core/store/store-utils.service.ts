import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { Store } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { Observable, of } from 'rxjs';
import { Bip38Service } from '@core/services/bip38.service';
import { catchError, filter, map, share, tap } from 'rxjs/operators';
import { NetworksState } from '@core/store/network/networks.state';
import { Router } from '@angular/router';
import { PinsState } from '@core/store/pins/pins.state';

@Injectable()
export class StoreUtilsService {
  readonly log = new Logger(this.constructor.name);

  constructor(
    private bip38Service: Bip38Service,
    private store: Store,
    private router: Router
  ) {}

  isPinForProfileValid(
    profileId: string,
    pin: string,
    network: NodeCryptoConfiguration['network']
  ): Observable<boolean> {
    const profile = this.store.selectSnapshot(
      ProfilesState.getProfileById(profileId)
    );
    return this.bip38Service.decrypt(profile.encodedWif, pin, network).pipe(
      map((decrypted) => !!decrypted),
      catchError(() => {
        return of(false);
      })
    );
  }

  getSelectedProfileWif(): Observable<{ wif: string }> {
    const profile = this.store.selectSnapshot(ProfilesState.getSelectedProfile);
    const pin = this.store.selectSnapshot(
      PinsState.getPinByProfileId(profile.id)
    );
    const networkConfig = this.store.selectSnapshot(
      NetworksState.getNodeCryptoConfig
    );

    return this.bip38Service
      .decrypt(profile.encodedWif, pin, networkConfig.network)
      .pipe(map((wif) => ({ wif })));
  }

  nftConfigurationGuard(): Observable<void> {
    return this.store.select(NetworksState.hasNftPluginsLoaded).pipe(
      filter((conf) => !conf),
      tap(() => this.router.navigate(['/dashboard'])),
      share()
    ) as Observable<void>;
  }
}
