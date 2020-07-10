export interface Profile {
  name: string;
  address: string;
  encodedWif: string;
  nodeBaseUrl: string;
}

export interface ProfileWithId extends Profile {
  id: string;
}
