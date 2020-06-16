import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { WalletService } from '@core/services/wallet.service';
import { Store } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { Observable } from 'rxjs';

@Injectable()
export class StoreUtilsService {
	readonly log = new Logger(this.constructor.name);

	constructor(private walletService: WalletService, private store: Store) {}

	isPinForProfileValid(
		profileId: string,
		pin: string,
		network: NodeCryptoConfiguration['network']
	): Observable<boolean> {
		return new Observable<boolean>((subscriber) => {
			const profile = this.store.selectSnapshot(ProfilesState.getProfileById)(
				profileId
			);
			let canDecrypt = true;
			try {
				this.walletService.dencrypt(profile.encodedPassphrase, pin, network);
			} catch (ex) {
				canDecrypt = false;
			}

			subscriber.next(canDecrypt);
			subscriber.complete();
		});
	}
}
