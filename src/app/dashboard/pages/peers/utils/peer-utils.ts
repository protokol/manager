import { Peers } from '@app/dashboard/pages/peers/interfaces/peer.types';
import { NetworkUtils } from '@core/utils/network-utils';
import { MyNode } from '@core/interfaces/node.types';

export abstract class PeerUtils {
  static coreApiPlugin = 'core-api';

  static getApiUrlFromPeer(peer: Peers): string | null {
    if (Object.keys(peer.plugins || {}).length <= 0) {
      return null;
    }

    const corePluginName = Object.keys(peer.plugins).find((pKey) =>
      pKey.includes(PeerUtils.coreApiPlugin)
    );
    if (!corePluginName || !peer.plugins[corePluginName].enabled) {
      return null;
    }

    return `http://${peer.ip}:${peer.plugins[corePluginName].port}`;
  }

  static getIpFromMyNode(myNode: MyNode) {
    const { nodeUrl } = myNode;

    const getBaseUrl = (url: string) => {
      if (NetworkUtils.getPortRegex().test(url)) {
        return url.replace(NetworkUtils.getPortRegex(), '');
      }
      return url;
    };

    return getBaseUrl(nodeUrl).replace('http://', '').replace('https://', '');
  }
}
