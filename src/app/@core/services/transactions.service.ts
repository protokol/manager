import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { Logger } from '@core/services/logger.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { map, switchMap } from 'rxjs/operators';
import {
  Transaction
} from '@arkecosystem/client';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class TransactionsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {}

  getTransaction(
    transactionId: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Transaction> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.api('transactions')
          .get(transactionId))
        ),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }
}
