import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { Pagination, TableApiQuery } from '@app/@shared/interfaces/table.types';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { NodeClientService } from '@core/services/node-client.service';
import { Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';

@Injectable()
export class TransfersService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  getTransfer(
    transferId: string,
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<BaseResourcesTypes.Transfers> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('transfers')
        .get(transferId)
    ).pipe(
      NodeClientService.genericErrorHandler(this.log),
      map((response) => response.body.data)
    );
  }

  getTransfers(
    query: TableApiQuery | {} = {},
    baseUrl: string = this.store.selectSnapshot(NetworksState.getBaseUrl),
    connectionOptions?: ConnectionOptions
  ): Observable<Pagination<BaseResourcesTypes.Transfers>> {
    return from(
      NodeClientService.getConnection(baseUrl, connectionOptions)
        .NFTBaseApi('transfers')
        .all({
          ...query,
        })
    ).pipe(
      NodeClientService.genericListErrorHandler(this.log),
      map((response) => response.body)
    );
  }
}
