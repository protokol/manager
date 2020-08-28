import { Logger } from '@core/services/logger.service';
import {
  State,
  Selector,
  Action,
  StateContext,
  createSelector,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import {
  AddMyNode,
  NODES_TYPE_NAME,
  RemoveMyNode,
  UpdateMyNode,
} from './nodes.actions';
import { MyNode } from '../../interfaces/node.types';
import { patch } from '@ngxs/store/operators';
import { NetworkUtils } from '@core/utils/network-utils';

interface NodesStateModel {
  nodes: { [nodeId: string]: Partial<MyNode> };
}

const NODES_DEFAULT_STATE: NodesStateModel = {
  nodes: {},
};

@State<NodesStateModel>({
  name: NODES_TYPE_NAME,
  defaults: { ...NODES_DEFAULT_STATE },
})
@Injectable()
export class NodesState {
  readonly log = new Logger(this.constructor.name);

  constructor() {}

  @Selector()
  static getNodes({ nodes }: NodesStateModel): MyNode[] {
    return Object.keys(nodes).reduce(
      (acc, curr) => [...acc, { ...nodes[curr], id: curr }],
      []
    );
  }

  static getNodeById(nodeId: string) {
    return createSelector(
      [NodesState.getNodes],
      (nodes: ReturnType<typeof NodesState.getNodes>) => {
        return nodes[nodeId];
      }
    );
  }

  static getNodeByUrl(nodeUrl: string) {
    return createSelector(
      [NodesState.getNodes],
      (nodes: ReturnType<typeof NodesState.getNodes>) => {
        return nodes.find((n) => n.nodeUrl === nodeUrl);
      }
    );
  }

  static getNodeManagerUrl(nodeUrl: string) {
    return createSelector(
      [NodesState.getNodes],
      (nodes: ReturnType<typeof NodesState.getNodes>) => {
        const node = nodes.find((n) => n.nodeUrl === nodeUrl);
        return NetworkUtils.buildNodeManagerUrl(
          node.nodeUrl,
          node.coreManagerPort
        );
      }
    );
  }

  @Action(AddMyNode)
  addMyNode(
    { setState }: StateContext<NodesStateModel>,
    { node, nodeId }: AddMyNode
  ) {
    setState(
      patch({
        nodes: patch({ [nodeId]: node }),
      })
    );
  }

  @Action(UpdateMyNode)
  updateMyNode(
    { setState, getState }: StateContext<NodesStateModel>,
    { node, updateBy: { nodeUrl, nodeId } }: UpdateMyNode
  ) {
    const { nodes } = getState();
    const updateNodeId = (() => {
      if (nodeId) {
        return nodeId;
      }
      const foundNodeId = Object.keys(nodes).find(
        (k) => nodes[k].nodeUrl === nodeUrl
      );
      if (foundNodeId) {
        return foundNodeId;
      }
      return null;
    })();

    if (updateNodeId) {
      setState(
        patch({
          nodes: patch({
            [updateNodeId]: {
              ...nodes[updateNodeId],
              ...node,
            },
          }),
        })
      );
    } else {
      this.log.error(`Node with id: ${updateNodeId} not found!`);
    }
  }

  @Action(RemoveMyNode)
  removeMyNode(
    { getState, patchState }: StateContext<NodesStateModel>,
    { nodeId }: RemoveMyNode
  ) {
    const { nodes } = getState();

    if (nodes.hasOwnProperty(nodeId)) {
      delete nodes[nodeId];

      patchState({
        nodes,
      });
    } else {
      this.log.error(`Node with id: ${nodeId} not found!`);
    }
  }
}
