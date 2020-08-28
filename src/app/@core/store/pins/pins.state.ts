import { Logger } from '@core/services/logger.service';
import { State, Action, StateContext, createSelector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import {
  AddPinAction,
  PINS_TYPE_NAME,
  ClearPinsAction,
} from '@core/store/pins/pins.actions';

export interface PinsStateModel {
  pins: { [profileId: string]: string };
}

const PINS_DEFAULT_STATE: PinsStateModel = {
  pins: {},
};

@State<PinsStateModel>({
  name: PINS_TYPE_NAME,
  defaults: { ...PINS_DEFAULT_STATE },
})
@Injectable()
export class PinsState {
  readonly log = new Logger(this.constructor.name);

  constructor() {}

  static getPinByProfileId(profileId: string) {
    return createSelector([PinsState], ({ pins }: PinsStateModel) => {
      return pins[profileId];
    });
  }

  @Action(AddPinAction)
  addPin(
    { getState, patchState }: StateContext<PinsStateModel>,
    { profileId, pin }: AddPinAction,
    {}
  ) {
    patchState({
      pins: {
        ...getState().pins,
        [profileId]: pin,
      },
    });
  }

  @Action(ClearPinsAction)
  clearPinsAction({ setState }: StateContext<PinsStateModel>) {
    setState({
      ...PINS_DEFAULT_STATE,
    });
  }
}
