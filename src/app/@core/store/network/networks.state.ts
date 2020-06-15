import {Logger} from '@core/services/logger.service';
import {State, Selector, Action, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {NodeConfiguration, NodeCryptoConfiguration} from '@arkecosystem/client/dist/resourcesTypes/node';
import {
	NETWORKS_TYPE_NAME,
	SetNetwork,
} from '@core/store/network/networks.actions';
import {NodeClientService} from '@core/services/node-client.service';
import {tap} from 'rxjs/operators';
import {forkJoin} from 'rxjs';

export interface NetworksStateModel {
	baseUrl: string | null;
	nodeConfiguration: NodeConfiguration | null;
	nodeCryptoConfiguration: NodeCryptoConfiguration | null;
}

const NETWORKS_DEFAULT_STATE: NetworksStateModel = {
	baseUrl: null,
	nodeConfiguration: null,
	nodeCryptoConfiguration: null,
};

@State<NetworksStateModel>({
	name: NETWORKS_TYPE_NAME,
	defaults: {...NETWORKS_DEFAULT_STATE},
})
@Injectable()
export class NetworksState {
	readonly log = new Logger(this.constructor.name);

	constructor(private nodeClientService: NodeClientService) {
	}

	@Selector()
	static getNetworkConfig({nodeConfiguration}: NetworksStateModel) {
		return nodeConfiguration;
	}

	@Selector()
	static getNodeCryptoConfig({nodeCryptoConfiguration}: NetworksStateModel) {
		return nodeCryptoConfiguration;
	}

	@Action(SetNetwork)
	setNetwork(
		{patchState}: StateContext<NetworksStateModel>,
		{baseUrl}: SetNetwork,
		{}
	) {
		patchState({
			baseUrl,
		});

		forkJoin([
			this.nodeClientService.getNodeConfiguration(baseUrl).pipe(
				tap((nodeConfiguration) => {
					patchState({
						nodeConfiguration,
					});
				})
			),
			this.nodeClientService.getNodeCryptoConfiguration(baseUrl).pipe(
				tap((nodeCryptoConfiguration) => {
					patchState({
						nodeCryptoConfiguration,
					});
				})
			),
		]).subscribe();
	}
}
