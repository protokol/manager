export interface PinataAuthenticationInterface {
  apiKey: string;
  secretApiKey: string;
}

export enum PinataModalStepper {
  Authenticate,
  Upload,
  Result,
}

export interface PinFileToIPFSResponseInterface {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}
