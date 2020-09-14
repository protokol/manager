import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { ElectronUtils } from '@core/utils/electron-utils';
import { Interfaces } from '@protokol/nft-base-crypto';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { TransactionsService } from '@core/services/transactions.service';
import { Observable } from 'rxjs';
import * as nftBaseCryptoType from '@protokol/nft-base-crypto';
import { WalletsService } from '@core/services/wallets.service';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { Interfaces as ArkInterfaces } from '@arkecosystem/crypto';

@Injectable()
export class CryptoService {
  readonly log = new Logger(this.constructor.name);

  private nftBaseCrypto: typeof nftBaseCryptoType;

  constructor(
    private storeUtilsService: StoreUtilsService,
    private transactionsService: TransactionsService,
    private walletsService: WalletsService,
    private store: Store
  ) {
    if (ElectronUtils.isElectron()) {
      this.nftBaseCrypto = window.require('@protokol/nft-base-crypto');

      // Listen to node crypto config changes
      this.store
        .select(NetworksState.getNodeCryptoConfig)
        .pipe(
          filter((config) => !!config),
          distinctUntilChanged(),
          tap(({ exceptions, genesisBlock, network, milestones }) => {
            this.nftBaseCrypto.ARKCrypto.Managers.configManager.setConfig({
              exceptions: { ...exceptions },
              genesisBlock: { ...genesisBlock },
              network: { ...network },
              milestones: [...milestones],
            } as ArkInterfaces.NetworkConfig);
            this.nftBaseCrypto.ARKCrypto.Managers.configManager.setHeight(2);

            this.nftBaseCrypto.ARKCrypto.Transactions.TransactionRegistry.registerTransactionType(
              this.nftBaseCrypto.Transactions.NFTRegisterCollectionTransaction
            );
            this.nftBaseCrypto.ARKCrypto.Transactions.TransactionRegistry.registerTransactionType(
              this.nftBaseCrypto.Transactions.NFTCreateTransaction
            );
            this.nftBaseCrypto.ARKCrypto.Transactions.TransactionRegistry.registerTransactionType(
              this.nftBaseCrypto.Transactions.NFTTransferTransaction
            );
          })
        )
        .subscribe();
    }
  }

  registerCollection(
    nftCollectionAsset: Interfaces.NFTCollectionAsset
  ): Observable<any> {
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
              : '1';

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

  registerAsset(nftTokenAsset: Interfaces.NFTTokenAsset): Observable<any> {
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
              : '1';

            const createCollectionTrans = new this.nftBaseCrypto.Builders.NFTCreateBuilder()
              .NFTCreateToken({
                ...nftTokenAsset,
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

  transfer(nftTransferAsset: Interfaces.NFTTransferAsset): Observable<any> {
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
              : '1';

            const transfer = new this.nftBaseCrypto.Builders.NFTTransferBuilder()
              .NFTTransferAsset({
                ...nftTransferAsset,
              })
              .nonce(senderNonce)
              .signWithWif(wif);

            return this.transactionsService.createTransactions({
              transactions: [transfer.build().toJson()],
            });
          })
        );
      })
    );
  }
}
