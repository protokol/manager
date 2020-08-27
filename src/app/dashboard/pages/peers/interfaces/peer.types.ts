import { Peer } from '@arkecosystem/client';

interface PeerPlugin {
  enabled: boolean;
  estimateTotalCount?: boolean;
  port: number;
}

export interface Peers extends Peer {
  plugins: { [pluginName: string]: PeerPlugin };
}
