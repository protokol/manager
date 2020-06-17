import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { map } from 'rxjs/operators';
import { ElectronWorkerWallet } from '@core/web-workers/electron-worker-wallet';
import { throwError } from 'rxjs';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import * as bip39Type from 'bip39';
import * as arkCryptoType from '@arkecosystem/crypto';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { ElectronUtils } from '@core/utils/electron-utils';

export enum MnemonicGenerateLanguage {
	ENGLISH = 'english',
}

@Injectable()
export class WalletService {
	readonly log = new Logger(this.constructor.name);

	private readonly bip39: typeof bip39Type;
	private readonly arkCrypto: typeof arkCryptoType;

	constructor() {
		if (ElectronUtils.isElectron()) {
			this.bip39 = window.require('bip39');
			this.arkCrypto = window.require('@arkecosystem/crypto');
		}
	}

	generate(pubKeyHash, language: MnemonicGenerateLanguage) {
		const passphrase = this.bip39.generateMnemonic(
			null,
			null,
			this.bip39.wordlists[language]
		);
		const publicKey = this.arkCrypto.Identities.Keys.fromPassphrase(passphrase)
			.publicKey;
		return {
			address: this.arkCrypto.Identities.Address.fromPublicKey(
				publicKey,
				pubKeyHash
			),
			passphrase,
		};
	}

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
							return throwError(response.payload.error);
						default:
							return throwError('Invalid response!');
					}
				})
			);
	}

	dencrypt(
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
							return throwError(response.payload.error);
						default:
							return throwError('Invalid response!');
					}
				}),
			);
	}
}
