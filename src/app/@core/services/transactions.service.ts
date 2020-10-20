import { Injectable } from '@angular/core';
import { defer, Observable, of, OperatorFunction, throwError } from 'rxjs';
import { Logger } from '@core/services/logger.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { switchMap } from 'rxjs/operators';
import {
  ApiResponse,
  CreateTransactionApiResponse,
} from '@arkecosystem/client';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class TransactionsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {}

  transactionErrorHandler<T>(): OperatorFunction<ApiResponse<T>, T> {
    return switchMap((response: ApiResponse<any>) => {
      if (response.body && response.body.errors) {
        this.log.error('Response contains errors:', response.body.errors);
        const errorsValues = Object.values<{ message: string; type: string }>(
          response.body.errors
        );
        return throwError(errorsValues.map((e) => e.message).join(' '));
      }
      return of(response.body.data);
    });
  }

  createTransactions(
    payload: {
      transactions: object[];
    } & Record<string, any>,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<CreateTransactionApiResponse> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.api('transactions')
          .create(payload)
        )),
        this.transactionErrorHandler<CreateTransactionApiResponse>()
      );
  }
}
