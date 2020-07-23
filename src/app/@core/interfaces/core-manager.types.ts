export interface CoreManagerResponse<T = any> {
  id: string;
  jsonrpc: string;
  result: T;
  error: {
    code: number;
    message: string;
  };
}

export interface InfoCoreVersion {
  currentVersion: string;
  latestVersion: string;
}

export type CoreManagerVersionResponse = CoreManagerResponse<InfoCoreVersion>;

export interface InfoBlockchainHeight {
  height: number;
}

export type CoreManagerBlockchainHeightResponse = CoreManagerResponse<
  InfoBlockchainHeight
>;

export interface InfoCurrentDelegate {
  rank: number;
  username: string;
}

export type CoreManagerCurrentDelegateResponse = CoreManagerResponse<
  InfoCurrentDelegate
>;

export interface LogArchivedItem {
  name: string;
  size: number;
  downloadLink: string;
}

export type CoreManagerLogArchivedResponse = CoreManagerResponse<
  LogArchivedItem[]
>;

export interface InfoCoreStatus {
  processStatus: ProcessStatus;
  syncing: boolean;
}

export type CoreManagerCoreStatusResponse = CoreManagerResponse<InfoCoreStatus>;

export interface InfoNextForgingSlot {
  remainingTime: number;
}

export type CoreManagerNextForgingSlotResponse = CoreManagerResponse<
  InfoNextForgingSlot
>;

export interface InfoLastForgedBlock {
  serialized: string;
  verification: {
    errors: any[];
    containsMultiSignatures: boolean;
    verified: boolean;
  };
  transactions: any[];
  data: {
    id: string;
    idHex: string;
    blockSignature: string;
    generatorPublicKey: string;
    payloadHash: string;
    payloadLength: number;
    reward: string;
    totalFee: string;
    totalAmount: string;
    numberOfTransactions: number;
    previousBlock: string;
    previousBlockHex: string;
    height: number;
    timestamp: number;
    version: number;
  };
}

export type CoreManagerLastForgedBlockResponse = CoreManagerResponse<
  InfoLastForgedBlock
>;

export type ProcessStatus = 'online' | 'offline';

export interface ProcessListItem {
  pid: number;
  name: string;
  pm_id: number;
  monit: {
    memory: number;
    cpu: number;
  };
  status: ProcessStatus;
}

export type CoreManagerProcessListResponse = CoreManagerResponse<
  ProcessListItem[]
>;

export type CoreManagerProcessResponse = CoreManagerResponse<ProcessListItem>;

export type CoreManagerConfigGetEnvResponse = CoreManagerResponse<string>;

export type CoreManagerConfigGetPluginsResponse = CoreManagerResponse<string>;
