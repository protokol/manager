import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { Pagination } from '@shared/interfaces/table.types';
import { GuardianResourcesTypes } from '@protokol/client';
import { BaseService } from '@core/services/base.service';

@Injectable()
export class GuardianUsersService {
  readonly log = new Logger(this.constructor.name);

  constructor(private baseService: BaseService) {}

  getUsers(
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<GuardianResourcesTypes.User>> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.guardianApi('users').index())),
        map((response) => response?.body),
        BaseService.genericListErrorHandler(this.log)
      );
  }

  getUser(
    publicKey: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.User> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.guardianApi('users').get(publicKey))),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getUserPermissions(
    publicKey: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.Group[]> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.guardianApi('users').userGroups(publicKey))),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }

  getGroupUsers(
    groupName: string,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.User[]> {
    return this.baseService.getProtokolConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.guardianApi('groups').users(groupName))),
        map((response) => response?.body?.data),
        BaseService.genericErrorHandler(this.log)
      );
  }
}
