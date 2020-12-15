import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { ElectronUtils } from '@core/utils/electron-utils';
import { Interfaces as NftBaseInterfaces } from '@protokol/nft-base-crypto';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { defer, Observable, of, OperatorFunction, throwError } from 'rxjs';
import * as nftBaseCryptoType from '@protokol/nft-base-crypto';
import * as nftExchangeCryptoType from '@protokol/nft-exchange-crypto';
import * as guardianCryptoType from '@protokol/guardian-crypto';
import { switchMap } from 'rxjs/operators';
import { Interfaces } from '@arkecosystem/crypto';
import { Interfaces as GuardianInterfaces } from '@protokol/guardian-crypto';
import { ApiResponse, CreateTransactionApiResponse } from '@arkecosystem/client';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { TransactionResultModalComponent } from '@shared/components/transaction-result-modal/transaction-result-modal.component';
import { ModalUtils } from '@core/utils/modal-utils';
import { BaseService } from '@core/services/base.service';
import { NzModalService } from 'ng-zorro-antd/modal';
import { ArkCryptoService } from '@core/services/ark-crypto.service';
import { Interfaces as NftExchangeInterfaces } from '@protokol/nft-exchange-crypto';

@Injectable()
export class CryptoService {
  readonly log = new Logger(this.constructor.name);

  private nftBaseCrypto: typeof nftBaseCryptoType;
  private guardianCrypto: typeof guardianCryptoType;
  private nftExchangeCrypto: typeof nftExchangeCryptoType;

  constructor(
    private storeUtilsService: StoreUtilsService,
    private nzModalService: NzModalService,
    private baseService: BaseService,
    private arkCryptoService: ArkCryptoService
  ) {
    if (ElectronUtils.isElectron()) {
      this.nftBaseCrypto = window.require('@protokol/nft-base-crypto');
      this.guardianCrypto = window.require('@protokol/guardian-crypto');
      this.nftExchangeCrypto = window.require('@protokol/nft-exchange-crypto');

      const {arkCrypto} = this.arkCryptoService;

      // nft base crypto register transactions
      arkCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.nftBaseCrypto.Transactions.NFTRegisterCollectionTransaction
      );
      arkCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.nftBaseCrypto.Transactions.NFTCreateTransaction
      );
      arkCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.nftBaseCrypto.Transactions.NFTTransferTransaction
      );
      arkCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.nftBaseCrypto.Transactions.NFTBurnTransaction
      );

      // nft exchange crypto register transactions
      arkCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.nftExchangeCrypto.Transactions.NFTAuctionTransaction
      );

      // guardian crypto register transactions
      arkCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.guardianCrypto.Transactions.GuardianGroupPermissionsTransaction
      );
      arkCrypto.Transactions.TransactionRegistry.registerTransactionType(
        this.guardianCrypto.Transactions.GuardianUserPermissionsTransaction
      );
    }
  }

  transactionErrorHandler<T>(): OperatorFunction<ApiResponse<T>, T> {
    return switchMap((response: ApiResponse<any>) => {
      if (response.body && response.body.errors) {
        this.log.error('Response contains errors:', response.body.errors);
        const errorsValues = Object.values<{ message: string; type: string }>(
          response.body.errors
        );
        return throwError(errorsValues.map((e) => e.message).join(' '));
      }
      return of(response.body.data);
    });
  }

  createTransactions(
    payload: {
      transactions: (Interfaces.ITransactionJson | Interfaces.ITransactionData)[];
    } & Record<string, any>,
    baseUrl?: string,
    connectionOptions?: ConnectionOptions
  ): Observable<void> {
    return this.baseService.getConnection(baseUrl, connectionOptions)
      .pipe(
        switchMap((c) => defer(() => c.api('transactions')
          .create(payload)
        )),
        this.transactionErrorHandler<CreateTransactionApiResponse>(),
        switchMap(() => {
          const { transactions } = payload;
          const transactionIds = transactions.map(({ id }) => id);

          const createCollectionModalRef = this.nzModalService.create<
            TransactionResultModalComponent,
            void
            >({
            nzTitle: null,
            nzFooter: null,
            nzContent: TransactionResultModalComponent,
            nzComponentParams: {
              transactionIds
            },
            ...ModalUtils.getCreateModalDefaultConfig(),
            nzCloseIcon: null,
          });

          return createCollectionModalRef.afterClose as Observable<void>;
        })
      );
  }

  registerCollection(
    nftCollectionAsset: NftBaseInterfaces.NFTCollectionAsset
  ): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {
        const tx = new this.nftBaseCrypto.Builders.NFTRegisterCollectionBuilder()
          .NFTRegisterCollectionAsset({
            ...nftCollectionAsset
          })
          .nonce(nonce.toFixed())
          .signWithWif(wif);

        return this.createTransactions({
          transactions: [tx.build().toJson()]
        });
      })
    );
  }

  registerAsset(nftTokenAsset: NftBaseInterfaces.NFTTokenAsset, numOfReplications: number = 1): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {
        const transactions = Array.from({ length: numOfReplications },
          (_k, i) => {
            return new this.nftBaseCrypto.Builders.NFTCreateBuilder()
              .NFTCreateToken({
                ...nftTokenAsset
              })
              .nonce(nonce.plus(i).toFixed())
              .signWithWif(wif)
              .build()
              .toJson();
          });

        return this.createTransactions({
          transactions
        });
      })
    );
  }

  transfer(nftTransferAsset: NftBaseInterfaces.NFTTransferAsset): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {

        const tx = new this.nftBaseCrypto.Builders.NFTTransferBuilder()
          .NFTTransferAsset({
            ...nftTransferAsset
          })
          .nonce(nonce.toFixed())
          .signWithWif(wif);

        return this.createTransactions({
          transactions: [tx.build().toJson()]
        });
      })
    );
  }

  burn(burnAssets: NftBaseInterfaces.NFTBurnAsset[]): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {

        const transactions = Array.from({ length: burnAssets.length },
          (_k, i) => {
            return new this.nftBaseCrypto.Builders.NFTBurnBuilder()
              .NFTBurnAsset({
                ...burnAssets[i]
              })
              .nonce(nonce.plus(i).toFixed())
              .signWithWif(wif)
              .build()
              .toJson();
          });

        return this.createTransactions({
          transactions
        });
      })
    );
  }

  auction(nftAuctionAsset: NftExchangeInterfaces.NFTAuctionAsset): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {

        const tx = new this.nftExchangeCrypto.Builders.NFTAuctionBuilder()
          .NFTAuctionAsset({
            ...nftAuctionAsset
          })
          .nonce(nonce.toFixed())
          .signWithWif(wif);

        return this.createTransactions({
          transactions: [tx.build().toJson()]
        });
      })
    );
  }

  setGuardianGroupPermissions(guardianGroup: GuardianInterfaces.IGuardianGroupPermissionsAsset): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {

        const tx = new this.guardianCrypto.Builders.GuardianGroupPermissionsBuilder()
          .GuardianGroupPermissions({
            ...guardianGroup,
          })
          .nonce(nonce.toFixed())
          .signWithWif(wif);

        return this.createTransactions({
          transactions: [tx.build().toJson()]
        });
      })
    );
  }

  setGuardianUserPermissions(guardianUser: GuardianInterfaces.IGuardianUserPermissionsAsset): Observable<any> {
    return this.storeUtilsService.getSelectedProfileWifAndNextNonce().pipe(
      switchMap(({ wif, nonce }) => {

        const tx = new this.guardianCrypto.Builders.GuardianUserPermissionsBuilder()
          .GuardianUserPermissions({
            ...guardianUser,
          })
          .nonce(nonce.toFixed())
          .signWithWif(wif);

        return this.createTransactions({
          transactions: [tx.build().toJson()]
        });
      })
    );
  }
}
