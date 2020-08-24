import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { ElectronUtils } from '@core/utils/electron-utils';
import { NFTCollectionAsset } from '@protokol/nft-base-crypto/dist/interfaces';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { TransactionsService } from '@core/services/transactions.service';
import { Observable } from 'rxjs';
import * as nftBaseCryptoType from '@protokol/nft-base-crypto';
import { WalletsService } from '@core/services/wallets.service';
import { switchMap } from 'rxjs/operators';

@Injectable()
export class CryptoService {
  readonly log = new Logger(this.constructor.name);

  private nftBaseCrypto: typeof nftBaseCryptoType;

  constructor(
    private storeUtilsService: StoreUtilsService,
    private transactionsService: TransactionsService,
    private walletsService: WalletsService
  ) {
    if (ElectronUtils.isElectron()) {
      this.nftBaseCrypto = window.require('@protokol/nft-base-crypto');
      this.nftBaseCrypto.ARKCrypto.Managers.configManager.setHeight(2);
      this.nftBaseCrypto.ARKCrypto.Managers.configManager.setFromPreset(
        'testnet'
      );

      this.nftBaseCrypto.ARKCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.nftBaseCrypto.Transactions.NFTRegisterCollectionTransaction
      );
    }
  }

  registerCollection(nftCollectionAsset: NFTCollectionAsset): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWif().pipe(
      switchMap(({ wif }) => {
        const address = this.nftBaseCrypto.ARKCrypto.Identities.Address.fromWIF(
          wif
        );

        return this.walletsService.getWallet(address).pipe(
          switchMap((senderWallet) => {
            const senderNonce = senderWallet
              ? this.nftBaseCrypto.ARKCrypto.Utils.BigNumber.make(
                  senderWallet.nonce
                )
                  .plus(1)
                  .toFixed()
              : '0';

            const createCollectionTrans = new this.nftBaseCrypto.Builders.NFTRegisterCollectionBuilder()
              .NFTRegisterCollectionAsset({
                ...nftCollectionAsset,
              })
              .nonce(senderNonce)
              .signWithWif(wif);

            return this.transactionsService.createTransactions({
              transactions: [createCollectionTrans.build().toJson()],
            });
          })
        );
      })
    );
  }
}
