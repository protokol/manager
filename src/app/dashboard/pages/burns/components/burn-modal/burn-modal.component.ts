import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CryptoService } from '@core/services/crypto.service';
import { FormUtils } from '@core/utils/form-utils';
import { finalize, first, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { WalletService } from '@core/services/wallet.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { environment } from '@env/environment';

const { api: { transactionBatchLimit } } = environment;

@Component({
  selector: 'app-burn-modal',
  templateUrl: './burn-modal.component.html',
  styleUrls: ['./burn-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BurnModalComponent implements OnInit, OnDestroy {
  burnForm!: FormGroup;
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
    private walletService: WalletService
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

  createForm() {
    this.burnForm = this.formBuilder.group({
      nftIds: [],
    });
  }

  burn() {
    if (this.isLoading$.getValue()) {
      return;
    }

    if (!this.burnForm.valid) {
      FormUtils.markFormGroupDirty(this.burnForm);
      return;
    }

    const { nftIds } = this.burnForm.value;

    if (nftIds.length <= 0) {
      this.nzMessageService.error(`At least one NFT is required!`);
    }

    if (nftIds.length > transactionBatchLimit) {
      this.nzMessageService.error(`Maximum number of NFTs allowed: ${transactionBatchLimit}!`);
    }

    this.isLoading$.next(true);

    this.cryptoService
      .burn(nftIds)
      .pipe(
        tap(
          () => {
            this.nzMessageService.success('Burn/s initiated!');
            this.nzModalRef.destroy({ refresh: true });
          },
          (err) => {
            this.nzNotificationService.create('error', 'Burn/s failed!', err);
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
