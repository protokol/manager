import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { ElectronUtils } from '@core/utils/electron-utils';
import { NetworksState } from '@core/store/network/networks.state';
import { filter, tap } from 'rxjs/operators';
import { Interfaces as ArkInterfaces } from '@arkecosystem/crypto';
import { Store } from '@ngxs/store';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import * as arkCryptoType from '@arkecosystem/crypto';

@Injectable()
export class ArkCryptoService {
  readonly log = new Logger(this.constructor.name);

  public readonly arkCrypto: typeof arkCryptoType;

  constructor(private store: Store) {
    if (ElectronUtils.isElectron()) {
      this.arkCrypto = window.require('@arkecosystem/crypto');

      // Listen to node crypto config changes
      this.store
        .select(NetworksState.getNodeCryptoConfig)
        .pipe(
          filter((config) => !!config),
          tap(({ exceptions, genesisBlock, network, milestones }) => {
            this.arkCrypto.Managers.configManager.setConfig({
              exceptions: { ...exceptions },
              genesisBlock: { ...genesisBlock },
              network: { ...network },
              milestones: [...milestones],
            } as ArkInterfaces.NetworkConfig);
            this.arkCrypto.Managers.configManager.setHeight(2);
          })
        )
        .subscribe();
    }
  }
}
