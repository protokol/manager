import { TestBed } from '@angular/core/testing';
import { Store, NgxsModule } from '@ngxs/store';
import { NodeClientService } from '@core/services/node-client.service';
import { of } from 'rxjs';
import { SetNetwork } from '@core/store/network/networks.actions';
import { WalletService } from '@core/services/wallet.service';
import { NetworksState } from '@core/store/network/networks.state';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { BaseResourcesTypes } from '@protokol/client';
import { finalize, tap } from 'rxjs/operators';
import { BaseService } from '@core/services/base.service';
import { BlockchainService } from '@core/services/blockchain.service';

describe('Networks', () => {
  let store: Store;
  let nodeClientService: NodeClientService;
  const baseUrlFixture = 'http://localhost:4003';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([NetworksState])],
      providers: [BaseService, WalletService, NodeClientService, BlockchainService],
    });

    store = TestBed.inject(Store);
    nodeClientService = TestBed.inject(NodeClientService);
  });

  it('should set network and load crypto', (done) => {
    const nodeCryptoConfiguration = {
      network: {
        wif: 10,
        name: '4382984398',
        pubKeyHash: '13910239012390',
      },
    } as Partial<NodeCryptoConfiguration> & any;
    const nodeNftConfiguration = {
      crypto: {},
      package: { name: 'node-nft' },
      transactions: {},
    } as Partial<BaseResourcesTypes.BaseConfigurations> & any;
    spyOn(nodeClientService, 'getNodeCryptoConfiguration').and.returnValue(
      of(nodeCryptoConfiguration)
    );
    spyOn(nodeClientService, 'getNftBaseConfigurations').and.returnValue(
      of(nodeNftConfiguration)
    );

    store
      .dispatch(new SetNetwork(baseUrlFixture))
      .pipe(
        tap(() => {
          const networkStateBaseUrl = store.selectSnapshot(
            (state) => state.networks.baseUrl
          );
          const nodeCryptoConfig = store.selectSnapshot(
            NetworksState.getNodeCryptoConfig
          );

          expect(networkStateBaseUrl).toEqual(baseUrlFixture);
          expect(nodeCryptoConfig).toEqual(nodeCryptoConfiguration);
        }),
        finalize(done)
      )
      .subscribe();
  });
});
