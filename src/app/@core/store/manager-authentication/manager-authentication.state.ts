import { Logger } from '@core/services/logger.service';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { patch } from '@ngxs/store/operators';
import { NodeManagerAuthentication } from '@core/interfaces/node.types';
import {
  MANAGER_AUTHENTICATION_TYPE_NAME,
  ManagerAuthenticationSet,
  ManagerAuthenticationUnset,
} from './manager-authentication.actions';

interface ManagerAuthenticationStateModel {
  authentication?: NodeManagerAuthentication;
}

const MANAGER_AUTHENTICATION_DEFAULT_STATE: ManagerAuthenticationStateModel = {
  authentication: null,
};

@State<ManagerAuthenticationStateModel>({
  name: MANAGER_AUTHENTICATION_TYPE_NAME,
  defaults: { ...MANAGER_AUTHENTICATION_DEFAULT_STATE },
})
@Injectable()
export class ManagerAuthenticationState {
  readonly log = new Logger(this.constructor.name);

  constructor() {}

  @Selector()
  static getAuthentication({
    authentication,
  }: ManagerAuthenticationStateModel) {
    return authentication;
  }

  @Action(ManagerAuthenticationSet)
  managerAuthenticationSet(
    { setState }: StateContext<ManagerAuthenticationStateModel>,
    { authentication }: ManagerAuthenticationSet
  ) {
    setState(
      patch({
        authentication,
      })
    );
  }

  @Action(ManagerAuthenticationUnset)
  managerAuthenticationUnset({
    setState,
  }: StateContext<ManagerAuthenticationStateModel>) {
    setState(
      patch({
        authentication: null,
      })
    );
  }
}
