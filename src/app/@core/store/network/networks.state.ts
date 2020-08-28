import { Logger } from '@core/services/logger.service';
import {
  State,
  Selector,
  Action,
  StateContext,
  createSelector,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import {
  ClearNetwork,
  NETWORKS_TYPE_NAME,
  SetCoreManagerPort,
  SetNetwork,
} from '@core/store/network/networks.actions';
import { NodeClientService } from '@core/services/node-client.service';
import { tap } from 'rxjs/operators';
import { NetworkUtils } from '@core/utils/network-utils';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { DEFAULT_CORE_MANAGER_PORT } from '@core/constants/node.constants';

interface NetworksStateModel {
  baseUrl: string | null;
  coreManagerPort: number;
  isValidNetwork: boolean | null;
  hasNftPluginsLoaded: boolean | null;
  nftBaseConfigurations: BaseResourcesTypes.BaseConfigurations | null;
  nodeCryptoConfiguration: NodeCryptoConfiguration | null;
}

const NETWORKS_DEFAULT_STATE: NetworksStateModel = {
  baseUrl: null,
  coreManagerPort: DEFAULT_CORE_MANAGER_PORT,
  isValidNetwork: null,
  hasNftPluginsLoaded: null,
  nftBaseConfigurations: null,
  nodeCryptoConfiguration: null,
};

@State<NetworksStateModel>({
  name: NETWORKS_TYPE_NAME,
  defaults: { ...NETWORKS_DEFAULT_STATE },
})
@Injectable()
export class NetworksState {
  readonly log = new Logger(this.constructor.name);

  constructor(private nodeClientService: NodeClientService) {}

  @Selector()
  static getBaseUrl({ baseUrl }: NetworksStateModel) {
    return baseUrl;
  }

  @Selector()
  static getCoreManagerPort({ coreManagerPort }: NetworksStateModel) {
    return coreManagerPort;
  }

  static getNodeManagerUrl() {
    return createSelector(
      [NetworksState.getBaseUrl, NetworksState.getCoreManagerPort],
      (
        baseUrl: ReturnType<typeof NetworksState.getBaseUrl>,
        port: ReturnType<typeof NetworksState.getCoreManagerPort>
      ) => {
        return NetworkUtils.buildNodeManagerUrl(baseUrl, port);
      }
    );
  }

  @Selector()
  static getIsValidNetwork({ isValidNetwork }: NetworksStateModel) {
    return isValidNetwork;
  }

  @Selector()
  static hasNftPluginsLoaded({ hasNftPluginsLoaded }: NetworksStateModel) {
    return hasNftPluginsLoaded;
  }

  @Selector()
  static getNodeCryptoConfig({ nodeCryptoConfiguration }: NetworksStateModel) {
    return nodeCryptoConfiguration;
  }

  @Action(SetNetwork)
  setNetwork(
    { patchState }: StateContext<NetworksStateModel>,
    { baseUrl }: SetNetwork,
    {}
  ) {
    patchState({
      baseUrl,
    });

    this.nodeClientService
      .getNodeCryptoConfiguration(baseUrl)
      .pipe(
        tap(
          (nodeCryptoConfiguration) => {
            if (
              NetworkUtils.isNodeCryptoConfiguration(nodeCryptoConfiguration)
            ) {
              patchState({
                nodeCryptoConfiguration,
                isValidNetwork: true,
              });
            } else {
              patchState({
                isValidNetwork: false,
              });
            }
          },
          () => {
            patchState({
              isValidNetwork: false,
            });
          }
        )
      )
      .subscribe();

    this.nodeClientService
      .getNftBaseConfigurations(baseUrl)
      .pipe(
        tap(
          (nftBaseConfigurations) => {
            if (NetworkUtils.isConfigurationsResource(nftBaseConfigurations)) {
              patchState({
                nftBaseConfigurations,
                hasNftPluginsLoaded: true,
              });
            } else {
              patchState({
                hasNftPluginsLoaded: false,
              });
            }
          },
          () => {
            patchState({
              hasNftPluginsLoaded: false,
            });
          }
        )
      )
      .subscribe();
  }

  @Action(ClearNetwork)
  clearNetwork({ setState }: StateContext<NetworksStateModel>) {
    setState({
      ...NETWORKS_DEFAULT_STATE,
    });
  }

  @Action(SetCoreManagerPort)
  setCoreManagerPort(
    { patchState }: StateContext<NetworksStateModel>,
    { coreManagerPort }: SetCoreManagerPort
  ) {
    patchState({
      coreManagerPort,
    });
  }
}
