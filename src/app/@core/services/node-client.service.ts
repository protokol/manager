import { Injectable } from '@angular/core';
import { from, Observable, of, OperatorFunction } from 'rxjs';
import {
  NodeCryptoConfiguration,
  NodeConfiguration,
} from '@arkecosystem/client/dist/resourcesTypes/node';
import { catchError, map, tap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes, NFTConnection } from '@protokol/nft-client';
import { ApiResponse, ApiResponseWithPagination } from '@arkecosystem/client';
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
        return of(undefined);
      })
    );
  }

  static genericListErrorHandler(logger?: Logger): OperatorFunction<any, any> {
    const log = logger || new Logger('NodeClientService');

    return (
      tap((response: ApiResponseWithPagination<any>) => {
        if (response.body.errors) {
          log.error('Response contains errors:', response.body.errors);
        }
      }),
      catchError((err) => {
        log.error(err);
        return of({
          data: [],
          meta: {
            pageCount: 0,
            totalCount: 0,
            count: 0,
            first: '',
            last: '',
            next: undefined,
            previous: undefined,
            self: '',
            totalCountIsEstimate: false,
          },
        });
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

  getNodeConfiguration(
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<NodeConfiguration> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .api('node')
        .configuration()
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getNftBaseConfigurations(
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.BaseConfigurations> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('configurations')
        .index()
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getPeer(
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<NodeConfiguration> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .api('peers')
        .get('116.203.193.15')
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }
}
