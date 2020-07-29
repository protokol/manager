import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { v4 as uuid } from 'uuid';
import { CoreManagerMethods } from '@core/interfaces/core-manager-methods.enum';
import { BaseResourcesTypes } from '@protokol/nft-client';

export abstract class NetworkUtils {
  static isNodeCryptoConfiguration(
    node: NodeCryptoConfiguration | undefined
  ): node is NodeCryptoConfiguration {
    return (
      node && node.network && !!node.network.wif && !!node.network.pubKeyHash
    );
  }

  static isConfigurationsResource(
    configurations: BaseResourcesTypes.BaseConfigurations | undefined
  ): configurations is BaseResourcesTypes.BaseConfigurations {
    return (
      configurations && configurations.package && !!configurations.package.name
    );
  }

  static getPortRegex(): RegExp {
    return new RegExp(/:(?<port>[0-9]+)/g);
  }

  static buildNodeManagerUrl(baseUrl: string, port: number = 4005) {
    if (NetworkUtils.getPortRegex().test(baseUrl)) {
      return baseUrl.replace(NetworkUtils.getPortRegex(), `:${port}`);
    } else if (baseUrl.indexOf('/', 8) > 0) {
      const slashIndex = baseUrl.indexOf('/', 8);
      return `${baseUrl.substring(0, slashIndex)}:${port}${baseUrl.substring(
        slashIndex
      )}`;
    } else {
      return `${baseUrl}:${port}`;
    }
  }

  static getNodeManagerPayload(
    method: CoreManagerMethods,
    params: Record<string, any> = {}
  ) {
    return {
      jsonrpc: '2.0',
      method,
      params,
      id: uuid(),
    };
  }

  static getNodeManagerDefaultHeaders() {
    return {
      headers: {
        'Content-Type': 'application/vnd.api+json',
      },
    };
  }
}
