import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { Pagination, TableApiQuery } from '@shared/interfaces/table.types';
import { TransactionTypes } from '@arkecosystem/client';
import { GuardianResourcesTypes } from '@protokol/client';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class GuardianGroupsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {}

  getTransactionTypes(
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<TransactionTypes> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.api('transactions').types())),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getConfiguration(
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.GuardianConfigurations> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.guardianApi('configurations').index())),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getGroups(
    query: TableApiQuery | {} = {},
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<GuardianResourcesTypes.Group>> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.guardianApi('groups').index(query))),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  getGroup(
    groupName: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.Group> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.guardianApi('groups').get(encodeURIComponent(groupName)))),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }
}
