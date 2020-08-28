import { TestBed } from '@angular/core/testing';
import { Store, NgxsModule } from '@ngxs/store';
import { NodeClientService } from '@core/services/node-client.service';
import { of } from 'rxjs';
import { SetNetwork } from '@core/store/network/networks.actions';
import { WalletService } from '@core/services/wallet.service';
import { NetworksState } from '@core/store/network/networks.state';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';

describe('Networks', () => {
  let store: Store;
  let nodeClientService: NodeClientService;
  const baseUrlFixture = 'http://localhost:4003';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([NetworksState])],
      providers: [WalletService, NodeClientService],
    });

    store = TestBed.inject(Store);
    nodeClientService = TestBed.inject(NodeClientService);
  });

  it('should set network and load crypto', () => {
    const nodeCryptoConfiguration = {
      network: { wif: 10, name: '4382984398' },
    } as Partial<NodeCryptoConfiguration> & any;
    spyOn(nodeClientService, 'getNodeCryptoConfiguration').and.returnValue(
      of(nodeCryptoConfiguration)
    );

    store.dispatch(new SetNetwork(baseUrlFixture));

    const networkStateBaseUrl = store.selectSnapshot(
      (state) => state.networks.baseUrl
    );
    expect(networkStateBaseUrl).toEqual(baseUrlFixture);

    const nodeCryptoConfig = store.selectSnapshot(
      NetworksState.getNodeCryptoConfig
    );
    expect(nodeCryptoConfig).toEqual(nodeCryptoConfiguration);
  });
});
