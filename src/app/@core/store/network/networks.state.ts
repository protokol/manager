import { Logger } from '@core/services/logger.service';
import { State, Selector, Action, StateContext } from '@ngxs/store';
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

interface NetworksStateModel {
  baseUrl: string | null;
  isValidNetwork: boolean | null;
  nodeCryptoConfiguration: NodeCryptoConfiguration | null;
}

const NETWORKS_DEFAULT_STATE: NetworksStateModel = {
  baseUrl: null,
  isValidNetwork: null,
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
  }

  @Action(ClearNetwork)
  clearNetwork({ setState }: StateContext<NetworksStateModel>) {
    setState({
      ...NETWORKS_DEFAULT_STATE,
    });
  }
}
