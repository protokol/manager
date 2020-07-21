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

export interface LogArchivedItem {
  name: string;
  size: number;
  downloadLink: string;
}

export type CoreManagerLogArchivedResponse = CoreManagerResponse<
  LogArchivedItem[]
>;
