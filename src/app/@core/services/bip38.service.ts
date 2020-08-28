import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { ElectronUtils } from '@core/utils/electron-utils';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { Bip38ServiceInterface } from '@core/interfaces/bip38-service.interface';
import { of, throwError } from 'rxjs';
import { ArkCryptoService } from '@core/services/ark-crypto.service';
import { Interfaces as ArkInterfaces } from '@arkecosystem/crypto';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import * as bip38Type from 'bip38';
import * as wifType from 'wif';

@Injectable()
export class Bip38Service implements Bip38ServiceInterface {
  readonly log = new Logger(this.constructor.name);

  private readonly bip38: typeof bip38Type;
  private readonly wif: typeof wifType;

  constructor(private arkCryptoService: ArkCryptoService) {
    if (ElectronUtils.isElectron()) {
      this.bip38 = window.require('bip38');
      this.wif = window.require('wif');
    }
  }

  encrypt(
    passphrase: string,
    pin: string,
    network: NodeCryptoConfiguration['network'] = this.arkCryptoService.arkCrypto.Managers.configManager.get<
      ArkInterfaces.Network
    >('network')
  ) {
    try {
      const key = this.arkCryptoService.arkCrypto.Identities.WIF.fromPassphrase(
        passphrase,
        network
      );
      const decoded = this.wif.decode(key);
      const encrypted = this.bip38.encrypt(
        decoded.privateKey,
        decoded.compressed,
        pin
      );
      return of(encrypted);
    } catch (e) {
      return throwError(e);
    }
  }

  decrypt(
    encodedPassphrase: string,
    pin: string,
    network: NodeCryptoConfiguration['network'] = this.arkCryptoService.arkCrypto.Managers.configManager.get<
      ArkInterfaces.Network
    >('network')
  ) {
    try {
      const decryptedKey = this.bip38.decrypt(encodedPassphrase, pin);
      const encoded = this.wif.encode(
        network.wif,
        decryptedKey.privateKey,
        decryptedKey.compressed
      );
      return of(encoded);
    } catch (e) {
      return throwError(e);
    }
  }
}
