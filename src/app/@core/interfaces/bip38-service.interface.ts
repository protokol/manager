import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { Observable } from 'rxjs';

export interface Bip38ServiceInterface {
	encrypt(
		passphrase: string,
		pin: string,
		network: NodeCryptoConfiguration['network']
	): Observable<string>;
	decrypt(
		encodedPassphrase: string,
		pin: string,
		network: NodeCryptoConfiguration['network']
	): Observable<string>;
}
