import { Logger } from '@core/services/logger.service';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { patch } from '@ngxs/store/operators';
import { NodeManagerAuthentication } from '@core/interfaces/node.types';
import {
  MANAGER_AUTHENTICATION_TYPE_NAME,
  ManagerCurrSet,
  ManagerCurrUnset,
} from './manager-authentication.actions';
import { DEFAULT_CORE_MANAGER_PORT } from '@core/constants/node.constants';

interface ManagerAuthenticationStateModel {
  port?: number;
  authentication?: NodeManagerAuthentication;
}

const MANAGER_AUTHENTICATION_DEFAULT_STATE: ManagerAuthenticationStateModel = {
  port: DEFAULT_CORE_MANAGER_PORT,
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

  @Action(ManagerCurrSet)
  managerCurrSet(
    { setState }: StateContext<ManagerAuthenticationStateModel>,
    { authentication, port }: ManagerCurrSet
  ) {
    setState(
      patch({
        port,
        authentication,
      })
    );
  }

  @Action(ManagerCurrUnset)
  managerCurrUnset({
    setState,
  }: StateContext<ManagerAuthenticationStateModel>) {
    setState(
      patch({
        port: null,
        authentication: null,
      })
    );
  }
}
