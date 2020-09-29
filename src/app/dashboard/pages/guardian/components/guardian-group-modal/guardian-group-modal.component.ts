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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  NzMessageService,
  NzModalRef,
  NzNotificationService,
} from 'ng-zorro-antd';
import { FormUtils } from '@core/utils/form-utils';
import { GuardianResourcesTypes } from '@protokol/client';
import { Store } from '@ngxs/store';
import { GuardianState } from '@app/dashboard/pages/guardian/state/guardian/guardian.state';
import { untilDestroyed } from '@core/until-destroyed';
import { defaultIfEmpty, finalize, first, tap } from 'rxjs/operators';
import {
  LoadGuardianConfigurations,
  LoadTransactionTypes
} from '@app/dashboard/pages/guardian/state/guardian/guardian.actions';
import { CryptoService } from '@core/services/crypto.service';

@Component({
  selector: 'app-guardian-group-modal',
  templateUrl: './guardian-group-modal.component.html',
  styleUrls: ['./guardian-group-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuardianGroupModalComponent implements OnInit, OnDestroy {
  groupForm!: FormGroup;
  isFormReady$ = new BehaviorSubject(false);
  isPermissionFormGroupReady$ = new BehaviorSubject(false);
  isLoading$ = new BehaviorSubject(false);
  isEditMode$ = new BehaviorSubject(false);
  guardianConfigurations$ = new BehaviorSubject<GuardianResourcesTypes.GuardianConfigurations | null>(
    null
  );

  // use to fill out initial form values
  group?: GuardianResourcesTypes.Group;

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  constructor(
    private nzModalRef: NzModalRef,
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private store: Store,
    private cryptoService: CryptoService,
    private nzMessageService: NzMessageService,
    private nzNotificationService: NzNotificationService
  ) {
  }

  ngOnInit(): void {
    if (this.group) {
      this.isEditMode$.next(true);
    }

    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.nzModalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzWidth: '75vw',
      });
      this.cd.markForCheck();
    });

    this.store
      .select(GuardianState.getGuardianConfigurations)
      .pipe(
        first((guardianConfigurations) => !!guardianConfigurations),
        tap((guardianConfigurations) => {
          this.guardianConfigurations$.next(guardianConfigurations);
          this.createForm(this.group);
          this.isFormReady$.next(true);
        }),
        untilDestroyed(this)
      )
      .subscribe();

    this.store.dispatch(new LoadGuardianConfigurations());
    this.store.dispatch(new LoadTransactionTypes())
      .pipe(
        defaultIfEmpty(),
        tap(() => {
          this.isPermissionFormGroupReady$.next(true);
        }),
        untilDestroyed(this)
      ).subscribe();
  }

  get nameMinLength() {
    const {
      crypto: {
        defaults: {
          guardianGroupName: { minLength },
        },
      },
    } = this.guardianConfigurations$.getValue();
    return minLength;
  }

  get nameMaxLength() {
    const {
      crypto: {
        defaults: {
          guardianGroupName: { maxLength },
        },
      },
    } = this.guardianConfigurations$.getValue();
    return maxLength;
  }

  get priorityMin() {
    const {
      crypto: {
        defaults: { guardianGroupPriority },
      },
    } = this.guardianConfigurations$.getValue();
    const { min } = guardianGroupPriority || { min: 0 };
    return min;
  }

  get priorityMax() {
    const {
      crypto: {
        defaults: { guardianGroupPriority },
      },
    } = this.guardianConfigurations$.getValue();
    const { max } = guardianGroupPriority || { max: Number.MAX_SAFE_INTEGER };
    return max;
  }

  createForm(group?: GuardianResourcesTypes.Group) {
    this.groupForm = this.formBuilder.group({
      name: [
        group?.name || '',
        [
          Validators.required,
          Validators.min(this.nameMinLength),
          Validators.max(this.nameMaxLength),
        ],
      ],
      priority: [
        group?.priority || this.priorityMin,
        [
          Validators.required,
          Validators.min(this.priorityMin),
          Validators.max(this.priorityMax),
        ],
      ],
      active: [group?.active || false],
      default: [group?.default || false],
      permissions: [this.group?.permissions || []],
    });
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

  ngOnDestroy(): void {}
}