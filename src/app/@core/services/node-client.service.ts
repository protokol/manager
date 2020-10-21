import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import {
  NodeCryptoConfiguration,
  NodeConfiguration
} from '@arkecosystem/client/dist/resourcesTypes/node';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/client';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class NodeClientService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {
  }

  getNodeCryptoConfiguration(
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<NodeCryptoConfiguration> {
    return this.baseService.getConnection(baseUrl, connectionOptions, false)
      .pipe(
        switchMap((c) => defer(() => c.api('node').crypto())),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getNodeConfiguration(
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<NodeConfiguration> {
    return this.baseService.getConnection(baseUrl, connectionOptions, false)
      .pipe(
        switchMap((c) => defer(() => c.api('node').configuration())),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getNftBaseConfigurations(
    baseUrl: string,
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.BaseConfigurations> {
    return this.baseService.getConnection(baseUrl, connectionOptions, false)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('configurations').index())),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }
}
