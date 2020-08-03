export interface ConnectionOptions {
  timeout?: number;
}

export interface MyNodeManagerAuthentication {
  username;
  password;
}

export interface MyNode {
  nodeUrl: string;
  coreManagerPort: number;
  coreManagerAuth: MyNodeManagerAuthentication | false;
}
