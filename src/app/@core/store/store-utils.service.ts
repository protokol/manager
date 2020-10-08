import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { Store } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { Observable, of } from 'rxjs';
import { Bip38Service } from '@core/services/bip38.service';
import { catchError, first, map, share, switchMap, tap } from 'rxjs/operators';
import { NetworksState } from '@core/store/network/networks.state';
import { Router } from '@angular/router';
import { PinsState } from '@core/store/pins/pins.state';
import { WalletsService } from '@core/services/wallets.service';
import { ArkCryptoService } from '@core/services/ark-crypto.service';

@Injectable()
export class StoreUtilsService {
  readonly log = new Logger(this.constructor.name);

  constructor(
    private bip38Service: Bip38Service,
    private store: Store,
    private router: Router,
    private walletsService: WalletsService,
    private arkCryptoService: ArkCryptoService
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

  getSelectedProfileWifAndNextNonce(): Observable<{ wif: string; nonce: string }> {
    return this.getSelectedProfileWif().pipe(
      switchMap(({ wif }) => {
        const address = this.arkCryptoService.arkCrypto.Identities.Address.fromWIF(
          wif
        );

        return this.walletsService.getWallet(address).pipe(
          map((senderWallet) => {
            const nonce = senderWallet
              ? this.arkCryptoService.arkCrypto.Utils.BigNumber.make(
                senderWallet.nonce
              )
                .plus(1)
                .toFixed()
              : '1';

            return {
              wif,
              nonce
            };
          })
        );
      })
    );
  }

  nftConfigurationGuard(): Observable<void> {
    return this.store.select(NetworksState.hasNftPluginsLoaded).pipe(
      first((conf) => !conf),
      tap(() => this.router.navigate(['/dashboard'])),
      share()
    ) as Observable<void>;
  }
}
