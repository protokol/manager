import { Logger } from '@core/services/logger.service';
import {
  State,
  Action,
  StateContext,
  createSelector,
  Selector,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';
import { patch } from '@ngxs/store/operators';
import { PaginationMeta } from '@shared/interfaces/table.types';
import { TableUtils } from '@shared/utils/table-utils';
import {
  LoadPeers,
  SetPeersByIds,
  PEERS_TYPE_NAME,
} from '@app/dashboard/pages/peers/state/peers/peers.actions';
import { PeersService } from '@core/services/peers.service';
import { Peers } from '@app/dashboard/pages/peers/interfaces/peer.types';

interface PeersStateModel {
  peersIds: string[];
  peers: { [name: string]: Peers };
  meta: PaginationMeta | null;
}

const PEERS_DEFAULT_STATE: PeersStateModel = {
  peersIds: [],
  peers: {},
  meta: null,
};

@State<PeersStateModel>({
  name: PEERS_TYPE_NAME,
  defaults: { ...PEERS_DEFAULT_STATE },
})
@Injectable()
export class PeersState {
  readonly log = new Logger(this.constructor.name);

  constructor(private peersService: PeersService) {}

  @Selector()
  static getPeersIds({ peersIds }: PeersStateModel) {
    return peersIds;
  }

  @Selector()
  static getMeta({ meta }: PeersStateModel) {
    return meta;
  }

  static getPeersByIds(peersIds: string[]) {
    return createSelector([PeersState], ({ peers }: PeersStateModel) => {
      if (!peersIds.length) {
        return [];
      }

      return peersIds.map((cId) => peers[cId]);
    });
  }

  @Action(LoadPeers)
  loadPeers(
    { patchState, dispatch }: StateContext<PeersStateModel>,
    { tableQueryParams }: LoadPeers
  ) {
    this.peersService
      .getPeers(TableUtils.toTableApiQuery(tableQueryParams))
      .pipe(
        tap(({ data }) => dispatch(new SetPeersByIds(data))),
        tap(({ data, meta }) => {
          patchState({
            peersIds: data.map((t) => t.ip),
            meta,
          });
        })
      )
      .subscribe();
  }

  @Action(SetPeersByIds)
  setPeersByIds(
    { setState, getState }: StateContext<PeersStateModel>,
    { peers }: SetPeersByIds
  ) {
    const peersSet = Array.isArray(peers) ? peers : [peers];

    setState(
      patch({
        peers: peersSet.reduce(
          (acc, value) => ({
            ...acc,
            [value.ip]: value,
          }),
          { ...getState().peers }
        ),
      })
    );
  }
}
