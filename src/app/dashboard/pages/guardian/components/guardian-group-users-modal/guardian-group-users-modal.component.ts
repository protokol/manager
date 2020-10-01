import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormUtils } from '@core/utils/form-utils';
import { GuardianResourcesTypes } from '@protokol/client';
import { untilDestroyed } from '@core/until-destroyed';
import { filter, finalize, pluck, switchMap, tap } from 'rxjs/operators';
import { CryptoService } from '@core/services/crypto.service';
import { Store } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { Wallet } from '@arkecosystem/client';
import {
  AddGuardianUserToGroup,
  LoadGuardianGroupUsers
} from '@app/dashboard/pages/guardian/state/guardian/guardian.actions';
import { GuardianState } from '@app/dashboard/pages/guardian/state/guardian/guardian.state';
import { TableColumnConfig } from '@shared/interfaces/table.types';

@Component({
  selector: 'app-guardian-group-users-modal',
  templateUrl: './guardian-group-users-modal.component.html',
  styleUrls: ['./guardian-group-users-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuardianGroupUsersModalComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  isLoading$ = new BehaviorSubject(false);
  isFormReady$ = new BehaviorSubject(false);
  group$ = new BehaviorSubject<GuardianResourcesTypes.Group>(null);
  filterOutWallets$ = new BehaviorSubject<string[]>([]);
  rows$: Observable<GuardianResourcesTypes.User[]> = of([]);
  tableColumns: TableColumnConfig<GuardianResourcesTypes.User>[];

  group?: GuardianResourcesTypes.Group;

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;
  @ViewChild('publicKeyTpl', { static: true }) publicKeyTpl!: TemplateRef<{
    row: GuardianResourcesTypes.User;
  }>;

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
  }

  ngOnInit(): void {
    this.group$.next(this.group);

    this.tableColumns = [
      {
        propertyName: 'publicKey',
        headerName: 'Public Key',
        columnTransformTpl: this.publicKeyTpl
      },
    ];

    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.nzModalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzWidth: '50vw'
      });
      this.cd.markForCheck();
    });

    const { name } = this.group;

    this.rows$ = this.store
      .select(GuardianState.getGuardianGroupUsersByGroupName(name))
      .pipe(
        filter(users => !!users),
        switchMap((guardianUserPubKeys) =>
          this.store.select(
            GuardianState.getGuardianUsersByPubKeys(guardianUserPubKeys)
          )
        ),
        tap(() => {
          if (!this.isFormReady$.getValue()) {
            this.isFormReady$.next(true);
          }
        }),
        untilDestroyed(this)
      );

    this.store.dispatch(new LoadGuardianGroupUsers(name));
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.group({
      wallet: ['', [Validators.required]],
    });
  }

  c(controlName: string) {
    return this.form.controls[controlName];
  }

  submitForm(event: MouseEvent) {
    event.preventDefault();

    if (this.isLoading$.getValue()) {
      return;
    }

    if (!this.form.valid) {
      FormUtils.markFormGroupDirty(this.form);
      return;
    }

    this.isLoading$.next(true);

    const { wallet: { publicKey }, groupNames, permissions } = this.form.value as {
      wallet: Wallet,
      groupNames: string[],
      permissions: GuardianResourcesTypes.Permissions[]
    };

    this.cryptoService
      .setGuardianUserPermissions({
        publicKey,
        groupNames,
        permissions
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

  onAddUser(event: MouseEvent) {
    event.preventDefault();

    const { address, publicKey } = this.c('wallet').value;
    const { name } = this.group$.getValue();

    this.filterOutWallets$.next([...this.filterOutWallets$.getValue(), address]);
    this.store.dispatch(new AddGuardianUserToGroup(
      name,
      publicKey
    ));
    this.c('wallet').reset();
  }

  ngOnDestroy(): void {}
}
