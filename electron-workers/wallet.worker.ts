import { WebWorkerWalletPost, WebWorkerWalletReceive } from '@app/@core/interfaces/electron-worker-wallet.types';

const bip38 = require('bip38');
const wif = require('wif');
const { Identities } = require('@arkecosystem/crypto');

process.on('message', (message: WebWorkerWalletPost) => {
	console.log('worker message', message);
	switch (message.type) {
		case 'encode': {
			try {
				const { passphrase, pin, network } = message.payload;

				const key = Identities.WIF.fromPassphrase(passphrase, { wif: network.wif });
				const decoded = wif.decode(key);

				process.send({
					type: 'encode_response',
					payload: {
						encoded: bip38.encrypt(decoded.privateKey, decoded.compressed, pin)
					}
				} as WebWorkerWalletReceive);
				console.log('encode_response');
			} catch (e) {
				process.send({
					type: 'error',
					payload: {
						error: e.message
					}
				} as WebWorkerWalletReceive);
				console.log('error');
			}
			break;
		}
		case 'decode': {
			try {
				const { encodedPassphrase, pin, network } = message.payload;

				const decryptedKey = bip38.decrypt(encodedPassphrase, pin);

				process.send({
					type: 'decode_response',
					payload: {
						decoded: wif.encode(
							network.wif,
							decryptedKey.privateKey,
							decryptedKey.compressed
						)
					}
				} as WebWorkerWalletReceive);
			} catch (e) {
				process.send({
					type: 'error',
					payload: {
						error: e.message
					}
				} as WebWorkerWalletReceive);
			}
			break;
		}
		case 'exit': {
			process.exit(0);
		}
	}
});

process.send({
	type: 'started'
});
