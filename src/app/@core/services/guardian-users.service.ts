import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { Pagination } from '@shared/interfaces/table.types';
import { GuardianResourcesTypes } from '@protokol/client';

@Injectable()
export class GuardianUsersService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getUsers(
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<GuardianResourcesTypes.User>> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .guardianApi('users')
        .index()
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  getUser(
    publicKey: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.User> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .guardianApi('users')
        .get(publicKey)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getUserPermissions(
    publicKey: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.Group[]> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .guardianApi('users')
        .userGroups(publicKey)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getGroupUsers(
    groupName: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.User[]> {
    return defer(() =>
      NodeClientService.getProtokolConnection(baseUrl, connectionOptions)
        .guardianApi('groups')
        .users(groupName)
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }
}
