import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { ElectronUtils } from '@core/utils/electron-utils';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import * as bip39Type from 'bip39';
import * as arkCryptoType from '@arkecosystem/crypto';

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
}
