import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NodeClientService } from '@core/services/node-client.service';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { Pagination } from '@shared/interfaces/table.types';
import { TransactionTypes } from '@arkecosystem/client';
import { GuardianResourcesTypes } from '@protokol/client';

@Injectable()
export class GuardianGroupsService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getTransactionTypes(
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<TransactionTypes> {
    return defer(() =>
      NodeClientService.getNFTConnection(baseUrl, connectionOptions)
        .api('transactions')
        .types()
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getConfiguration(
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.GuardianConfigurations> {
    return defer(() =>
      NodeClientService.getGuardianConnection(baseUrl, connectionOptions)
        .guardianApi('configurations')
        .index()
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }

  getGroups(
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<GuardianResourcesTypes.Group>> {
    return defer(() =>
      NodeClientService.getGuardianConnection(baseUrl, connectionOptions)
        .guardianApi('groups')
        .index()
    ).pipe(
      map((response) => response.body),
      NodeClientService.genericListErrorHandler(this.log)
    );
  }

  getGroup(
    groupName: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<GuardianResourcesTypes.Group> {
    return defer(() =>
      NodeClientService.getGuardianConnection(baseUrl, connectionOptions)
        .guardianApi('groups')
        .get(encodeURIComponent(groupName))
    ).pipe(
      map((response) => response.body.data),
      NodeClientService.genericErrorHandler(this.log)
    );
  }
}
