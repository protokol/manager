// TODO: Replace import from dist
import { IPeerResponse } from '@protokol/client/dist/peer-discovery';

interface PeerPlugin {
  enabled: boolean;
  estimateTotalCount?: boolean;
  port: number;
}

export interface Peers extends IPeerResponse {
  plugins: { [pluginName: string]: PeerPlugin };
}
