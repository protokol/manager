import { Peer } from '@arkecosystem/client/dist/resourcesTypes/peers';

interface PeerPlugin {
  enabled: boolean;
  estimateTotalCount?: boolean;
  port: number;
}

export interface Peers extends Peer {
  plugins: { [pluginName: string]: PeerPlugin };
}
