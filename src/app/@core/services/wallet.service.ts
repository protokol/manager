import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { ElectronUtils } from '@core/utils/electron-utils';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import * as bip39Type from 'bip39';
import { ArkCryptoService } from '@core/services/ark-crypto.service';
import { Interfaces as ArkInterfaces } from '@arkecosystem/crypto';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export enum MnemonicGenerateLanguage {
  ENGLISH = 'english',
}

@Injectable()
export class WalletService {
  readonly log = new Logger(this.constructor.name);

  private readonly bip39: typeof bip39Type;

  constructor(private arkCryptoService: ArkCryptoService, private storeUtilsService: StoreUtilsService) {
    if (ElectronUtils.isElectron()) {
      this.bip39 = window.require('bip39');
    }
  }

  generate(
    language: MnemonicGenerateLanguage,
    pubKeyHash = this.arkCryptoService.arkCrypto.Managers.configManager.get<
      ArkInterfaces.Network
    >('network').pubKeyHash
  ) {
    const passphrase = this.bip39.generateMnemonic(
      null,
      null,
      this.bip39.wordlists[language]
    );
    const {
      publicKey,
    } = this.arkCryptoService.arkCrypto.Identities.Keys.fromPassphrase(
      passphrase
    );
    return {
      address: this.arkCryptoService.arkCrypto.Identities.Address.fromPublicKey(
        publicKey,
        pubKeyHash
      ),
      passphrase,
    };
  }

  getSelectedProfileAddress(): Observable<string> {
    return this.storeUtilsService.getSelectedProfileWif()
      .pipe(
        map(({wif}) => this.arkCryptoService.arkCrypto.Identities.Address.fromWIF(
          wif
        ))
      );
  }

  getSelectedProfilePublicKey(): Observable<string> {
    return this.storeUtilsService.getSelectedProfileWif()
      .pipe(
        map(({wif}) => this.arkCryptoService.arkCrypto.Identities.PublicKey.fromWIF(
          wif
        ))
      );
  }
}
