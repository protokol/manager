import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
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
  CoreManagerLastForgedBlockResponse,
  CoreManagerLogArchivedResponse,
  CoreManagerNextForgingSlotResponse,
  CoreManagerProcessListResponse,
  CoreManagerProcessResponse,
  CoreManagerVersionResponse,
} from '@core/interfaces/core-manager.types';
import { CoreManagerMethods } from '../interfaces/core-manager-methods.enum';

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

  infoCoreStatus(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerCoreStatusResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.infoCoreStatus),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  infoNextForgingSlot(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerNextForgingSlotResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.infoNextForgingSlot
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  infoLastForgedBlock(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerLastForgedBlockResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.infoLastForgedBlock
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  infoBlockchainHeight(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerBlockchainHeightResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.infoBlockchainHeight
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  infoCurrentDelegate(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerCurrentDelegateResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.infoCurrentDelegate
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  logArchived(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerLogArchivedResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.logArchived),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  logDownload(
    logFileName: string,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    const baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;

    return this.httpClient.get(`${baseUrl}${logFileName}`, {
      responseType: 'text',
      ...NetworkUtils.getNodeManagerDefaultHeaders(),
    });
  }

  processList(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerProcessListResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.processList),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  processStart(
    processName: string,
    args: string = '--network=testnet --env=test',
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerProcessResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.processRestart, {
          name: processName,
          args,
        }),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  processRestart(
    processName: string,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerProcessResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.processRestart, {
          name: processName,
        }),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  processStop(
    processName: string,
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerProcessResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(CoreManagerMethods.processStop, {
          name: processName,
        }),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  configurationGetEnv(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerConfigGetEnvResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.configurationGetEnv
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }

  configurationGetPlugins(
    url: string = this.store.selectSnapshot(NetworksState.getNodeManagerUrl())
  ) {
    return this.httpClient
      .post<CoreManagerConfigGetPluginsResponse>(
        url,
        NetworkUtils.getNodeManagerPayload(
          CoreManagerMethods.configurationGetPlugins
        ),
        { ...NetworkUtils.getNodeManagerDefaultHeaders() }
      )
      .pipe(map((response) => response.result));
  }
}
