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
import {
  NzMessageService,
  NzModalRef,
  NzNotificationService,
} from 'ng-zorro-antd';
import { FormUtils } from '@core/utils/form-utils';
import { GuardianResourcesTypes } from '@protokol/client';
import { untilDestroyed } from '@core/until-destroyed';
import { finalize, pluck, tap } from 'rxjs/operators';
import { CryptoService } from '@core/services/crypto.service';
import { Store } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';

@Component({
  selector: 'app-guardian-user-modal',
  templateUrl: './guardian-user-modal.component.html',
  styleUrls: ['./guardian-user-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuardianUserModalComponent implements OnInit, OnDestroy {
  groupForm!: FormGroup;
  isLoading$ = new BehaviorSubject(false);

  @Input() group?: GuardianResourcesTypes.Group;

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
    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.nzModalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzWidth: '75vw',
      });
      this.cd.markForCheck();
    });
  }

  createForm() {
    this.groupForm = this.formBuilder.group({
      wallet: ['', [Validators.required]],
      groups: [[]],
      permissions: []
    });
  }

  c(controlName: string) {
    return this.groupForm.controls[controlName];
  }

  registerFormListeners() {
    this.c('wallet').valueChanges
      .pipe(
        untilDestroyed(this)
      )
      .subscribe();
  }

  submitForm(event: MouseEvent) {
    event.preventDefault();

    if (this.isLoading$.getValue()) {
      return;
    }

    if (!this.groupForm.valid) {
      FormUtils.markFormGroupDirty(this.groupForm);
      return;
    }

    this.isLoading$.next(true);

    const guardianGroup = this.groupForm.value;

    this.cryptoService
      .setGuardianGroupPermissions(guardianGroup)
      .pipe(
        tap(
          () => {
            this.nzMessageService.success(
              'Group transaction broadcast to network!'
            );
            this.nzModalRef.destroy({ refresh: true });
          },
          (err) => {
            this.nzNotificationService.create(
              'error',
              'Creating group transaction failed!',
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
