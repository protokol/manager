import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { map } from 'rxjs/operators';
import { ElectronWorkerWallet } from '@core/web-workers/electron-worker-wallet';
import { throwError } from 'rxjs';
import { Bip38ServiceInterface } from '../interfaces/bip38-service.interface';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';

@Injectable()
export class Bip38WorkerService implements Bip38ServiceInterface {
	readonly log = new Logger(this.constructor.name);

	constructor() {}

	encrypt(
		passphrase: string,
		pin: string,
		network: NodeCryptoConfiguration['network']
	) {
		const walletWorker = new ElectronWorkerWallet();
		walletWorker
			.send({
				type: 'encode',
				payload: {
					passphrase,
					pin,
					network
				}
			});

		return walletWorker.onMessage()
			.pipe(
				map(response => {
					switch (response.type) {
						case 'encode_response':
							return response.payload.encoded;
						case 'error':
							throwError(response.payload.error);
							break;
						default:
							throwError('Invalid response!');
							break;
					}
				})
			);
	}

	decrypt(
		encodedPassphrase: string,
		pin: string,
		network: NodeCryptoConfiguration['network']
	) {
		const walletWorker = new ElectronWorkerWallet();
		walletWorker
			.send({
				type: 'decode',
				payload: {
					encodedPassphrase,
					pin,
					network
				}
			});

		return walletWorker.onMessage()
			.pipe(
				map(response => {
					switch (response.type) {
						case 'decode_response':
							return response.payload.decoded;
						case 'error':
							throwError(response.payload.error);
							break;
						default:
							throwError('Invalid response!');
							break;
					}
				}),
			);
	}
}
