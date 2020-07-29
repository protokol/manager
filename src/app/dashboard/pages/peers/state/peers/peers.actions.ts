import { NzTableQueryParams } from 'ng-zorro-antd';
import { Peers } from '@app/dashboard/pages/peers/interfaces/peer.types';

export const PEERS_TYPE_NAME = 'peers';

export class LoadPeers {
  static type = `[${PEERS_TYPE_NAME}] LoadPeers`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class SetPeersByIds {
  static type = `[${PEERS_TYPE_NAME}] SetPeersByIds`;

  constructor(public peers: Peers[] | Peers) {}
}
