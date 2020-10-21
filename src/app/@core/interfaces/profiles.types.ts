export interface Profile {
  name: string;
  address: string;
  encodedWif: string;
  nodeBaseUrl: string;
  useRandomizedPeer?: boolean;
}

export interface ProfileWithId extends Profile {
  id: string;
}
