import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormUtils } from '@core/utils/form-utils';
import { GuardianResourcesTypes } from '@protokol/client';
import { untilDestroyed } from '@core/until-destroyed';
import { defaultIfEmpty, finalize, first, map, pluck, tap } from 'rxjs/operators';
import { CryptoService } from '@core/services/crypto.service';
import { Store } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {
  LoadTransactionTypes
} from '@app/dashboard/pages/guardian/state/guardian/guardian.actions';
import { Wallet } from '@arkecosystem/client';
import { WalletsState } from '@core/store/wallets/wallets.state';
import { LoadWallet } from '@core/store/wallets/wallets.actions';
import { PermissionFormItem, UserGroupsFormItem } from '@app/dashboard/pages/guardian/interfaces/guardian.types';
import { GuardianUtils } from '@app/dashboard/pages/guardian/utils/guardian-utils';

@Component({
  selector: 'app-guardian-user-modal',
  templateUrl: './guardian-user-modal.component.html',
  styleUrls: ['./guardian-user-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuardianUserModalComponent implements OnInit, OnDestroy {
  userForm!: FormGroup;
  isLoading$ = new BehaviorSubject(false);
  isEditMode$ = new BehaviorSubject(false);
  isFormReady$ = new BehaviorSubject(false);
  isPermissionFormGroupReady$ = new BehaviorSubject(false);

  @Input() user?: GuardianResourcesTypes.User;

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  constructor(
    private nzModalRef: NzModalRef,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private cryptoService: CryptoService,
    private nzMessageService: NzMessageService,
    private nzNotificationService: NzNotificationService,
    private store: Store
  ) {
    this.createForm();
    this.registerFormListeners();
  }

  ngOnInit(): void {
    if (this.user) {
      this.isEditMode$.next(true);
    }

    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.nzModalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzWidth: '75vw'
      });
      this.cd.markForCheck();
    });

    if (this.isEditMode$.getValue()) {
      const { publicKey } = this.user;

      this.store
        .select(WalletsState.getWalletsByIds([publicKey]))
        .pipe(
          map(([wallet]) => wallet),
          first((wallet) => !!(wallet && wallet.wallet)),
          map(({ wallet }) => wallet),
          tap((wallet) => {
            this.createForm(this.user, wallet);
            this.isFormReady$.next(true);
          }),
          untilDestroyed(this)
        )
        .subscribe();
      this.store.dispatch(new LoadWallet(publicKey));
    } else {
      this.createForm();
      this.isFormReady$.next(true);
    }

    this.store.dispatch(new LoadTransactionTypes())
      .pipe(
        defaultIfEmpty(),
        tap(() => {
          this.isPermissionFormGroupReady$.next(true);
        }),
        untilDestroyed(this)
      ).subscribe();
  }

  createForm(user: GuardianResourcesTypes.User = {
               groups: [],
               publicKey: '',
               allow: [],
               deny: []
             },
             wallet: Wallet = null) {

    this.userForm = this.formBuilder.group({
      wallet: [wallet, [Validators.required]],
      groupNames: [user.groups.map((name) => ({ name }))],
      permissions: [GuardianUtils.toPermissionFormItems(user)]
    });
  }

  c(controlName: string) {
    return this.userForm.controls[controlName];
  }

  registerFormListeners() {
    this.c('wallet').valueChanges
      .pipe(
        tap(() => {
          this.c('groupNames').setValue([]);
          this.c('permissions').setValue(null);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  submitForm(event: MouseEvent) {
    event.preventDefault();

    if (this.isLoading$.getValue()) {
      return;
    }

    if (!this.userForm.valid) {
      FormUtils.markFormGroupDirty(this.userForm);
      return;
    }

    this.isLoading$.next(true);

    const { wallet: { publicKey }, groupNames, permissions } = this.userForm.value as {
      wallet: Wallet,
      groupNames: UserGroupsFormItem[],
      permissions: PermissionFormItem[]
    };

    this.cryptoService
      .setGuardianUserPermissions({
        publicKey,
        groupNames: groupNames.map(({ name }) => name),
        ...GuardianUtils.toPermissions(permissions)
      })
      .pipe(
        tap(
          () => {
            this.nzMessageService.success(
              'User permissions transaction broadcast to network!'
            );
            this.nzModalRef.destroy({ refresh: true });
          },
          (err) => {
            this.nzNotificationService.create(
              'error',
              'Creating user permissions transaction failed!',
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

  get selectedProfileAddress(): Observable<string> {
    return this.store.select(ProfilesState.getSelectedProfile)
      .pipe(pluck('address'));
  }

  ngOnDestroy(): void {}
}
