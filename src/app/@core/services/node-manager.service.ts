import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { HttpClient } from '@angular/common/http';
import { NetworkUtils } from '@core/utils/network-utils';
import { CoreManagerMethods } from '@core/interfaces/core-manager.methods';
import { CoreManagerVersionResponse } from '@core/interfaces/core-manager.types';

@Injectable()
export class NodeManagerService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store, private httpClient: HttpClient) {}

  infoCoreVersion(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerVersionResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.infoCoreVersion),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }
}
