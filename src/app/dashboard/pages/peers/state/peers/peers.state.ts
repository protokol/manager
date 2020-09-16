import { Logger } from '@core/services/logger.service';
import {
  State,
  Action,
  StateContext,
  createSelector,
  Selector,
  ofActionDispatched,
  Actions,
} from '@ngxs/store';
import { Injectable } from '@angular/core';
import { exhaustMap, takeUntil, tap } from 'rxjs/operators';
import { patch } from '@ngxs/store/operators';
import {
  LoadPeers,
  SetPeersByIds,
  PEERS_TYPE_NAME,
  PeersStartPooling,
  PeersStopPooling,
} from '@app/dashboard/pages/peers/state/peers/peers.actions';
import { PeersService } from '@core/services/peers.service';
import { Peers } from '@app/dashboard/pages/peers/interfaces/peer.types';
import { timer } from 'rxjs';

interface PeersStateModel {
  peersIds: string[];
  peers: { [name: string]: Peers };
}

const PEERS_DEFAULT_STATE: PeersStateModel = {
  peersIds: [],
  peers: {},
};

@State<PeersStateModel>({
  name: PEERS_TYPE_NAME,
  defaults: { ...PEERS_DEFAULT_STATE },
})
@Injectable()
export class PeersState {
  readonly log = new Logger(this.constructor.name);

  constructor(private peersService: PeersService, private actions$: Actions) {}

  @Selector()
  static getPeersIds({ peersIds }: PeersStateModel) {
    return peersIds;
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
    return this.peersService.getPeers(tableQueryParams).pipe(
      tap((peers) => dispatch(new SetPeersByIds(peers))),
      tap((peers) => {
        patchState({
          peersIds: peers.map((t) => t.ip),
        });
      })
    );
  }

  @Action(PeersStartPooling)
  peersStartPooling(
    { dispatch }: StateContext<PeersStateModel>,
    { tableQueryParams }: PeersStartPooling
  ) {
    timer(0, 8000)
      .pipe(
        exhaustMap(() => dispatch(new LoadPeers(tableQueryParams))),
        takeUntil(this.actions$.pipe(ofActionDispatched(PeersStartPooling))),
        takeUntil(this.actions$.pipe(ofActionDispatched(PeersStopPooling)))
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
