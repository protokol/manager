import { Injectable } from '@angular/core';
import { Connection } from '@arkecosystem/client';
import { from, Observable, of } from 'rxjs';
import {
	NodeCryptoConfiguration,
} from '@arkecosystem/client/dist/resourcesTypes/node';
import { catchError, map, tap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';

interface ConnectionOptions {
	timeout?: number;
}

@Injectable()
export class NodeClientService {
	readonly log = new Logger(this.constructor.name);

	static getConnection(
		baseUrl: string,
		{ timeout = 5000 }: ConnectionOptions = {}
	) {
		return new Connection(`${baseUrl}/api`).withOptions({
			timeout: timeout || 5000,
		});
	}

	constructor() {}

	getNodeCryptoConfiguration(
		baseUrl: string,
		connectionOptions?: ConnectionOptions
	): Observable<NodeCryptoConfiguration> {
		return from(
			NodeClientService.getConnection(baseUrl, connectionOptions)
				.api('node')
				.crypto()
		).pipe(
			tap((response) => {
				if (response.body.errors) {
					this.log.error('Response contains errors:', response.body.errors);
				}
			}),
			map((response) => response.body.data),
			catchError((err) => {
				this.log.error(err);
				return of(null);
			})
		);
	}
}
