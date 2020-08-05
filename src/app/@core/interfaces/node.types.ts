export interface ConnectionOptions {
  timeout?: number;
}

export interface MyNode {
  nodeUrl: string;
  coreManagerPort: number;
  coreManagerAuth?: NodeManagerAuthentication;
}

export interface NodeManagerAuthentication {
  token?: string;
  basic?: {
    username: string;
    password: string;
  };
}
