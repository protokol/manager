import { Injectable } from '@angular/core';
import { from, Observable, of, OperatorFunction, throwError } from 'rxjs';
import { Logger } from '@core/services/logger.service';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { switchMap } from 'rxjs/operators';
import { ApiResponse } from '@arkecosystem/client/dist/interfaces';
import { CreateTransactionApiResponse } from '@arkecosystem/client/dist/resourcesTypes/transactions';

@Injectable()
export class TransactionsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

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
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<CreateTransactionApiResponse> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .api('transactions')
        .create(payload)
    ).pipe(this.transactionErrorHandler<CreateTransactionApiResponse>());
  }
}
