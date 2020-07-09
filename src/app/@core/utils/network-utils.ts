import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';

export abstract class NetworkUtils {
  static isNodeCryptoConfiguration(
    node: NodeCryptoConfiguration | undefined
  ): node is NodeCryptoConfiguration {
    return (
      node && node.network && !!node.network.wif && !!node.network.pubKeyHash
    );
  }
}
