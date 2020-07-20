export interface CoreManagerResponse<T = any> {
  id: string;
  jsonrpc: string;
  result: T;
  error: {
    code: number;
    message: string;
  };
}

export type CoreManagerVersionResponse = CoreManagerResponse<{
  currentVersion: string;
  latestVersion: string;
}>;
