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
  SetNetwork,
} from '@core/store/network/networks.actions';
import { NodeClientService } from '@core/services/node-client.service';
import { tap } from 'rxjs/operators';
import { NetworkUtils } from '@core/utils/network-utils';
import { BaseResourcesTypes } from '@protokol/client';
import { forkJoin } from 'rxjs';

interface NetworksStateModel {
  baseUrl: string | null;
  isValidNetwork: boolean | null;
  hasNftPluginsLoaded: boolean | null;
  nftBaseConfigurations: BaseResourcesTypes.BaseConfigurations | null;
  nodeCryptoConfiguration: NodeCryptoConfiguration | null;
}

const NETWORKS_DEFAULT_STATE: NetworksStateModel = {
  baseUrl: null,
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

  @Selector()
  static getNodeCryptoBaseConfig({
    nftBaseConfigurations,
  }: NetworksStateModel) {
    return nftBaseConfigurations;
  }

  static getCryptoDefaults() {
    return createSelector(
      [NetworksState.getNodeCryptoBaseConfig],
      ({
        crypto: { defaults },
      }: ReturnType<typeof NetworksState.getNodeCryptoBaseConfig>) => {
        return defaults;
      }
    );
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

    return forkJoin([
      this.nodeClientService.getNodeCryptoConfiguration(baseUrl).pipe(
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
      ),
      this.nodeClientService.getNftBaseConfigurations(baseUrl).pipe(
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
      ),
    ]);
  }

  @Action(ClearNetwork)
  clearNetwork({ setState }: StateContext<NetworksStateModel>) {
    setState({
      ...NETWORKS_DEFAULT_STATE,
    });
  }
}
