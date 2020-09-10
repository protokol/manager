import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { BehaviorSubject, Observable, OperatorFunction } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NzMessageService, NzModalRef, NzNotificationService } from 'ng-zorro-antd';
import { CryptoService } from '@core/services/crypto.service';
import { FormUtils } from '@core/utils/form-utils';
import { finalize, map, shareReplay, switchMap, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { Pagination } from '@shared/interfaces/table.types';
import { Wallet } from '@arkecosystem/client';
import { WalletService } from '@core/services/wallet.service';

@Component({
  selector: 'app-transfer-modal',
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferModalComponent implements OnInit, OnDestroy {
  transferForm!: FormGroup;
  isLoading$ = new BehaviorSubject(false);

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  constructor(
    private nzModalRef: NzModalRef,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private cryptoService: CryptoService,
    private nzMessageService: NzMessageService,
    private nzNotificationService: NzNotificationService,
    private walletService: WalletService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.nzModalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzWidth: '50vw'
      });
      this.cd.markForCheck();
    });
  }

  createForm() {
    this.transferForm = this.formBuilder.group({
      wallet: [],
      nftIds: [],
    });
  }

  transfer(event: MouseEvent) {
    event.preventDefault();

    if (this.isLoading$.getValue()) {
      return;
    }

    if (!this.transferForm.valid) {
      FormUtils.markFormGroupTouched(this.transferForm);
      return;
    }

    this.isLoading$.next(true);

    const { wallet: { address: recipientId }, nftIds: nftIdsObjArray } = this.transferForm.value;
    const nftIds = nftIdsObjArray.map(({ nftId }) => nftId);

    this.cryptoService
      .transfer({
        nftIds,
        recipientId
      })
      .pipe(
        tap(
          () => {
            this.nzMessageService.success('Transfer initiated!');
            this.nzModalRef.destroy({ refresh: true });
          },
          (err) => {
            this.nzNotificationService.create(
              'error',
              'Transfer failed!',
              err
            );
          }
        ),
        finalize(() => {
          this.isLoading$.next(false);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  filterWallets = (): OperatorFunction<Pagination<Wallet>, Pagination<Wallet>> => {
    return (switchMap(({ data: originData, meta }) => {
      return this.getSelectedProfileAddress()
        .pipe(map((selectedProfileAddress) => {
          const data = originData.filter(({ address }) => address !== selectedProfileAddress);
          return {
            data,
            meta
          };
        }));
    }));
    // tslint:disable-next-line:semicolon
  };

  getSelectedProfileAddress(): Observable<string> {
    return this.walletService.getSelectedProfileAddress()
      .pipe(
        shareReplay()
      );
  }

  get selectedProfilePubKey(): Observable<string> {
    return this.walletService.getSelectedProfilePublicKey()
      .pipe(
        shareReplay()
      );
  }

  ngOnDestroy(): void {
  }
}
