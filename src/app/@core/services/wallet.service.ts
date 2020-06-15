import { Injectable } from '@angular/core';
import {NodeCryptoConfiguration} from '@arkecosystem/client/dist/resourcesTypes/node';
import {Logger} from '@core/services/logger.service';
// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import * as bip38Type from 'bip38';
import * as bip39Type from 'bip39';
import * as wifType from 'wif';
import * as arkCryptoType from '@arkecosystem/crypto';

export enum MnemonicGenerateLanguage {
	ENGLISH = 'english',
}

@Injectable()
export class WalletService {
	readonly log = new Logger(this.constructor.name);

	private readonly bip38: typeof bip38Type;
	private readonly bip39: typeof bip39Type;
	private readonly arkCrypto: typeof arkCryptoType;
	private readonly wif: typeof wifType;

	static get isElectron(): boolean {
		return !!(window && window.process && window.process.type);
	}

	constructor() {
		if (WalletService.isElectron) {
			this.bip38 = window.require('bip38');
			this.bip39 = window.require('bip39');
			this.arkCrypto = window.require('@arkecosystem/crypto');
			this.wif = window.require('wif');
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

	encrypt(passphrase: string, pin: string, network: NodeCryptoConfiguration['network']) {
		const key = this.arkCrypto.Identities.WIF.fromPassphrase(passphrase, network);
		const decoded = this.wif.decode(key);

		return this.bip38.encrypt(
			decoded.privateKey,
			decoded.compressed,
			pin
		);
	}

	dencrypt(encodedPassphrase: string, pin: string, network: NodeCryptoConfiguration['network']) {
		const decryptedKey = this.bip38.decrypt(encodedPassphrase, pin);
		return this.wif.encode(network.wif, decryptedKey.privateKey, decryptedKey.compressed);
	}
}
