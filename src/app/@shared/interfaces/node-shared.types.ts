import { NodeManagerLoginSettingsEnum } from '@app/dashboard/pages/nodes/interfaces/node.types';

export interface NodeManagerFormInterface {
  loginType: NodeManagerLoginSettingsEnum;
  port: number;
  secretToken: string;
  loginUsername: string;
  loginPassword: string;
}
