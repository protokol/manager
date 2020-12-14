import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { CryptoService } from '@core/services/crypto.service';
import { FormUtils } from '@core/utils/form-utils';
import { finalize, first, map, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { WalletService } from '@core/services/wallet.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { NetworksState } from '@core/store/network/networks.state';
import { Store } from '@ngxs/store';
import { TextUtils } from '@core/utils/text-utils';
import { ArkCryptoService } from '@core/services/ark-crypto.service';

@Component({
  selector: 'app-auction-modal',
  templateUrl: './auction-modal.component.html',
  styleUrls: ['./auction-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionModalComponent implements OnInit, OnDestroy {
  auctionForm!: FormGroup;
  expirationForm!: FormGroup;
  isLoading$ = new BehaviorSubject(false);
  selectedProfileAddress$ = new BehaviorSubject<string | null>(null);

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  constructor(
    public nzModalRef: NzModalRef,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private cryptoService: CryptoService,
    private nzMessageService: NzMessageService,
    private nzNotificationService: NzNotificationService,
    private walletService: WalletService,
    private store: Store,
    private arkCryptoService: ArkCryptoService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.nzModalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzWidth: '65vw',
      });
      this.cd.markForCheck();
    });

    this.walletService
      .getSelectedProfileAddress()
      .pipe(
        first(),
        tap((address) => this.selectedProfileAddress$.next(address)),
        untilDestroyed(this)
      )
      .subscribe();
  }

  blockHeightMinAsyncValidator = (
    control: FormControl
  ): Observable<ValidationErrors | null> =>
    this.blockHeightMin
      .pipe(
        untilDestroyed(this),
        first(),
        map((lastBlockHeight) => {
          const { value } = control;
          if (lastBlockHeight > value) {
            return { error: true, min: true };
          }
          return null;
        })
        // tslint:disable-next-line:semicolon
      );

  get blockHeightMin(): Observable<null | number> {
    return this.store.select(NetworksState.getLastBlockHeight);
  }

  get blockHeightMax() {
    return Number.MAX_SAFE_INTEGER;
  }

  createForm() {
    this.expirationForm = this.formBuilder.group({
      blockHeight: [
        '',
        [
          Validators.required,
          Validators.max(this.blockHeightMax),
        ],
        [
          this.blockHeightMinAsyncValidator
        ]
      ]
    });

    this.auctionForm = this.formBuilder.group({
      nftIds: [],
      startAmount: [
        '0',
        [
          Validators.required,
          Validators.pattern(TextUtils.getOnlyNumbersRegex())
        ]
      ],
      expiration: this.expirationForm
    });
  }

  auction() {
    if (this.isLoading$.getValue()) {
      return;
    }

    if (!this.auctionForm.valid) {
      FormUtils.markFormGroupDirty(this.auctionForm);
      return;
    }

    const { nftIds, startAmount, expiration } = this.auctionForm.value;

    if (nftIds.length <= 0) {
      this.nzMessageService.error(`At least one NFT is required!`);
    }

    this.isLoading$.next(true);

    this.cryptoService
      .auction({
        nftIds,
        startAmount: this.arkCryptoService.arkCrypto.Utils.BigNumber.make(startAmount),
        expiration
      })
      .pipe(
        tap(
          () => {
            this.nzMessageService.success('Auction transaction broadcast to network!');
            this.nzModalRef.destroy({ refresh: true });
          },
          (err) => {
            this.nzNotificationService.create('error', 'Auction transaction failed!', err);
          }
        ),
        finalize(() => {
          this.isLoading$.next(false);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnDestroy(): void {}
}
