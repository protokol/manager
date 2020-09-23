import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { ElectronUtils } from '@core/utils/electron-utils';
import { Interfaces as NftBaseInterfaces } from '@protokol/nft-base-crypto';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { TransactionsService } from '@core/services/transactions.service';
import { Observable } from 'rxjs';
import * as nftBaseCryptoType from '@protokol/nft-base-crypto';
import * as guardianCryptoType from '@protokol/guardian-crypto';
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { Interfaces as ArkInterfaces } from '@arkecosystem/crypto';
import { Interfaces as GuardianInterfaces } from '@protokol/guardian-crypto';

@Injectable()
export class CryptoService {
  readonly log = new Logger(this.constructor.name);

  private nftBaseCrypto: typeof nftBaseCryptoType;
  private guardianCrypto: typeof guardianCryptoType;

  constructor(
    private storeUtilsService: StoreUtilsService,
    private transactionsService: TransactionsService,
    private store: Store
  ) {
    if (ElectronUtils.isElectron()) {
      this.nftBaseCrypto = window.require('@protokol/nft-base-crypto');
      this.guardianCrypto = window.require('@protokol/guardian-crypto');

      // nft base crypto register transactions
      this.nftBaseCrypto.ARKCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.nftBaseCrypto.Transactions.NFTRegisterCollectionTransaction
      );
      this.nftBaseCrypto.ARKCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.nftBaseCrypto.Transactions.NFTCreateTransaction
      );
      this.nftBaseCrypto.ARKCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.nftBaseCrypto.Transactions.NFTTransferTransaction
      );

      // guardian crypto register transactions
      this.guardianCrypto.ARKCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.guardianCrypto.Transactions.GuardianGroupPermissionsTransaction
      );

      // Listen to node crypto config changes
      this.store
        .select(NetworksState.getNodeCryptoConfig)
        .pipe(
          filter((config) => !!config),
          distinctUntilChanged(),
          tap(({ exceptions, genesisBlock, network, milestones }) => {
            const networkConfig = {
              exceptions: { ...exceptions },
              genesisBlock: { ...genesisBlock },
              network: { ...network },
              milestones: [...milestones],
            } as ArkInterfaces.NetworkConfig;

            this.nftBaseCrypto.ARKCrypto.Managers.configManager.setConfig({...networkConfig});
            this.nftBaseCrypto.ARKCrypto.Managers.configManager.setHeight(2);

            this.guardianCrypto.ARKCrypto.Managers.configManager.setConfig({...networkConfig});
            this.guardianCrypto.ARKCrypto.Managers.configManager.setHeight(2);
          })
        )
        .subscribe();
    }
  }

  registerCollection(
    nftCollectionAsset: NftBaseInterfaces.NFTCollectionAsset
  ): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {
        const createCollectionTrans = new this.nftBaseCrypto.Builders.NFTRegisterCollectionBuilder()
          .NFTRegisterCollectionAsset({
            ...nftCollectionAsset
          })
          .nonce(nonce)
          .signWithWif(wif);

        return this.transactionsService.createTransactions({
          transactions: [createCollectionTrans.build().toJson()]
        });
      })
    );
  }

  registerAsset(nftTokenAsset: NftBaseInterfaces.NFTTokenAsset): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {
        const createCollectionTrans = new this.nftBaseCrypto.Builders.NFTCreateBuilder()
          .NFTCreateToken({
            ...nftTokenAsset
          })
          .nonce(nonce)
          .signWithWif(wif);

        return this.transactionsService.createTransactions({
          transactions: [createCollectionTrans.build().toJson()]
        });
      })
    );
  }

  transfer(nftTransferAsset: NftBaseInterfaces.NFTTransferAsset): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {

        const transfer = new this.nftBaseCrypto.Builders.NFTTransferBuilder()
          .NFTTransferAsset({
            ...nftTransferAsset
          })
          .nonce(nonce)
          .signWithWif(wif);

        return this.transactionsService.createTransactions({
          transactions: [transfer.build().toJson()]
        });
      })
    );
  }

  setGuardianGroupPermissions(guardianGroup: GuardianInterfaces.GuardianGroupPermissionsAsset): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {

        const transfer = new this.guardianCrypto.Builders.GuardianGroupPermissionsBuilder()
          .GuardianGroupPermissions({
            ...guardianGroup
          })
          .nonce(nonce)
          .signWithWif(wif);

        return this.transactionsService.createTransactions({
          transactions: [transfer.build().toJson()]
        });
      })
    );
  }
}
