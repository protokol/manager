import { Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { catchError, map, tap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NFTConnection } from '@protokol/nft-client';
import { ApiResponse } from '@arkecosystem/client/dist/interfaces';
import { ConnectionOptions } from '@core/interfaces/node.types';

@Injectable()
export class NodeClientService {
  readonly log = new Logger(this.constructor.name);

  static getConnection(
    baseUrl: string,
    { timeout }: ConnectionOptions = { timeout: 5000 }
  ) {
    return new NFTConnection(`${baseUrl}/api`).withOptions({
      timeout: timeout || 5000,
    });
  }

  static genericErrorHandler(logger?: Logger) {
    const log = logger || new Logger('NodeClientService');

    return (
      tap((response: ApiResponse<any>) => {
        if (response.body.errors) {
          log.error('Response contains errors:', response.body.errors);
        }
      }),
      catchError((err) => {
        log.error(err);
        return of(null);
      })
    );
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
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }
}
