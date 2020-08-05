import { Injectable } from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { HttpClient } from '@angular/common/http';
import { NetworkUtils } from '@core/utils/network-utils';
import {
  CoreManagerBlockchainHeightResponse,
  CoreManagerConfigGetEnvResponse,
  CoreManagerConfigGetPluginsResponse,
  CoreManagerCoreStatusResponse,
  CoreManagerCurrentDelegateResponse,
  CoreManagerInfoDiskSpaceResponse,
  CoreManagerLastForgedBlockResponse,
  CoreManagerLogArchivedResponse,
  CoreManagerLogLogResponse,
  CoreManagerNextForgingSlotResponse,
  CoreManagerProcessListResponse,
  CoreManagerProcessResponse,
  CoreManagerResponse,
  CoreManagerSnapshotsListResponse,
  CoreManagerVersionResponse,
  LogLogPayload,
  SnapshotsCreatePayload,
  SnapshotsRestorePayload,
} from '@core/interfaces/core-manager.types';
import { CoreManagerMethods } from '../interfaces/core-manager-methods.enum';
import { of, throwError } from 'rxjs';
import { NodeManagerAuthentication } from '@core/interfaces/node.types';
import { ManagerAuthenticationState } from '@core/store/manager-authentication/manager-authentication.state';

@Injectable()
export class NodeManagerService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store, private httpClient: HttpClient) {}

  genericErrorHandler() {
    return switchMap((response: CoreManagerResponse) => {
      if (response.error) {
        return throwError(response.error);
      }
      return of(response.result);
    });
  }

  infoCoreVersion(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerVersionResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.infoCoreVersion),
        {
          ...NetworkUtils.getNodeManagerDefaultHeaders(authentication),
        }
      )
      .pipe(this.genericErrorHandler());
  }

  infoCoreStatus(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerCoreStatusResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.infoCoreStatus),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  infoNextForgingSlot(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerNextForgingSlotResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.infoNextForgingSlot
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  infoLastForgedBlock(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerLastForgedBlockResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.infoLastForgedBlock
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  infoBlockchainHeight(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerBlockchainHeightResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.infoBlockchainHeight
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  infoCurrentDelegate(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerCurrentDelegateResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.infoCurrentDelegate
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  infoDiskSpace(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerInfoDiskSpaceResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.infoDiskSpace, {
          showAllDisks: true,
        }),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  logArchived(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerLogArchivedResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.logArchived),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  logLog(
    payload: LogLogPayload,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerLogLogResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.logLog, payload),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  logDownload(
    logFileName: string,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

    return this.httpClient.get(`${baseUrl}${logFileName}`, {
      responseType: 'text',
      ...NetworkUtils.getNodeManagerDefaultHeaders(authentication),
    });
  }

  processList(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerProcessListResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.processList),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  processStart(
    processName: string,
    args: string = '--network=testnet --env=test',
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerProcessResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.processRestart, {
          name: processName,
          args,
        }),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  processRestart(
    processName: string,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerProcessResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.processRestart, {
          name: processName,
        }),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  processStop(
    processName: string,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerProcessResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.processStop, {
          name: processName,
        }),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  configurationGetEnv(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerConfigGetEnvResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.configurationGetEnv
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  configurationGetPlugins(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerConfigGetPluginsResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.configurationGetPlugins
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  configurationUpdatePlugins(
    content: any,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient.post(
      url,
      NetworkUtils.getNodeManagerPayload(
        CoreManagerMethods.configurationUpdatePlugins,
        { content: JSON.stringify(content) }
      ),
      { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
    );
  }

  snapshotsList(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient
      .post<CoreManagerSnapshotsListResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.snapshotsList),
        { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
      )
      .pipe(this.genericErrorHandler());
  }

  snapshotDelete(
    name: string,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient.post(
      url,
      NetworkUtils.getNodeManagerPayload(CoreManagerMethods.snapshotsDelete, {
        name,
      }),
      { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
    );
  }

  snapshotsCreate(
    payload: SnapshotsCreatePayload,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient.post(
      url,
      NetworkUtils.getNodeManagerPayload(
        CoreManagerMethods.snapshotsCreate,
        payload
      ),
      { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
    );
  }

  snapshotsRestore(
    payload: SnapshotsRestorePayload,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl()),
    authentication: NodeManagerAuthentication = this.store.selectSnapshot(
      ManagerAuthenticationState.getAuthentication
    )
  ) {
    return this.httpClient.post(
      url,
      NetworkUtils.getNodeManagerPayload(
        CoreManagerMethods.snapshotsRestore,
        payload
      ),
      { ...NetworkUtils.getNodeManagerDefaultHeaders(authentication) }
    );
  }
}
