import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/client';
import { Pagination, TableApiQuery } from '@app/@shared/interfaces/table.types';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class TransfersService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {}

  getTransfer(
    transferId: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Transfers> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('transfers')
          .get(transferId)
        )),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getTransfers(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Transfers>> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.NFTBaseApi('transfers')
          .all({
            ...query,
          })
        )),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }
}
