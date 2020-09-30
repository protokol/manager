import { Peers } from '@app/dashboard/pages/peers/interfaces/peer.types';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

export const PEERS_TYPE_NAME = 'peers';

export class LoadPeers {
  static type = `[${PEERS_TYPE_NAME}] LoadPeers`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class PeersStartPooling {
  static type = `[${PEERS_TYPE_NAME}] PeersStartPooling`;

  constructor(public tableQueryParams?: NzTableQueryParams) {}
}

export class PeersStopPooling {
  static type = `[${PEERS_TYPE_NAME}] PeersStopPooling`;

  constructor() {}
}

export class SetPeersByIds {
  static type = `[${PEERS_TYPE_NAME}] SetPeersByIds`;

  constructor(public peers: Peers[] | Peers) {}
}
