export interface Profile {
  profileName: string;
  encodedWif: string;
  nodeBaseUrl: string;
}

export interface ProfileWithId extends Profile {
  id: string;
}
