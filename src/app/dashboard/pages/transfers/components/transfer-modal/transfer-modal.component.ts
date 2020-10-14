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

@Component({
  selector: 'app-transfer-modal',
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferModalComponent implements OnInit, OnDestroy {
  transferForm!: FormGroup;
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
        nzWidth: '50vw',
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
      FormUtils.markFormGroupDirty(this.transferForm);
      return;
    }

    this.isLoading$.next(true);

    const {
      wallet: { address: recipientId },
      nftIds: nftIdsObjArray,
    } = this.transferForm.value;
    const nftIds = nftIdsObjArray.map(({ nftId }) => nftId);

    this.cryptoService
      .transfer({
        nftIds,
        recipientId,
      })
      .pipe(
        tap(
          () => {
            this.nzMessageService.success('Transfer initiated!');
            this.nzModalRef.destroy({ refresh: true });
          },
          (err) => {
            this.nzNotificationService.create('error', 'Transfer failed!', err);
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
