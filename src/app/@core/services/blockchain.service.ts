import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { BaseService } from '@core/services/base.service';
import { Block } from '@arkecosystem/client';

@Injectable()
export class BlockchainService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {
  }

  getLastBlock(
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Block> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.api('blocks')
          .last()
        )),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }
}
