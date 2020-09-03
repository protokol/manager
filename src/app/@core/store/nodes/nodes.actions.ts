import { MyNode } from '@core/interfaces/node.types';

export const NODES_TYPE_NAME = 'nodes';
import { v4 as uuid } from 'uuid';

export class AddMyNode {
  static type = `[${NODES_TYPE_NAME}] AddMyNode`;

  constructor(public node: Partial<MyNode>, public nodeId: string = uuid()) {}
}

export class UpdateMyNode {
  static type = `[${NODES_TYPE_NAME}] UpdateMyNode`;

  constructor(
    public node: Partial<MyNode>,
    public updateBy: { nodeId?: string; nodeUrl?: string }
  ) {}
}

export class RemoveMyNode {
  static type = `[${NODES_TYPE_NAME}] RemoveMyNode`;

  constructor(public nodeId: string) {}
}

export class RemoveMyNodeByUrl {
  static type = `[${NODES_TYPE_NAME}] RemoveMyNodeByUrl`;

  constructor(public nodeUrl: string) {}
}
