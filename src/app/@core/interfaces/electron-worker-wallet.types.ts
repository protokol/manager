import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';

type Encode = 'encode';
type Decode = 'decode';
type Exit = 'exit';

type EncodeResponse = 'encode_response';
type DecodeResponse = 'decode_response';

type ErrorResponse = 'error';

export interface EncodePost {
	type: Encode;
	payload: {
		passphrase: string;
		pin: string;
		network: NodeCryptoConfiguration['network'];
	};
}

export interface DecodePost {
	type: Decode;
	payload: {
		encodedPassphrase: string;
		pin: string;
		network: NodeCryptoConfiguration['network'];
	};
}

export interface ExitPost {
	type: Exit;
}

export interface EncodeReceive {
	type: EncodeResponse;
	payload: {
		encoded: string;
	};
}

export interface DecodeReceive {
	type: DecodeResponse;
	payload: {
		decoded: string;
	};
}

export interface ErrorReceive {
	type: ErrorResponse;
	payload: {
		error: string;
	};
}

export type WebWorkerWalletPost = EncodePost | DecodePost | ExitPost;
export type WebWorkerWalletReceive = EncodeReceive | DecodeReceive | ErrorReceive;
