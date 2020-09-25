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
import { GuardianGroupsState } from '@app/dashboard/pages/guardian-groups/state/guardian-groups/guardian-groups.state';
import { untilDestroyed } from '@core/until-destroyed';
import { finalize, first, tap } from 'rxjs/operators';
import { LoadGuardianConfigurations } from '@app/dashboard/pages/guardian-groups/state/guardian-groups/guardian-groups.actions';
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
  isLoading$ = new BehaviorSubject(false);
  guardianConfigurations$ = new BehaviorSubject<GuardianResourcesTypes.GuardianConfigurations | null>(
    null
  );

  @Input() group?: GuardianResourcesTypes.Group;

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
    this.store
      .select(GuardianGroupsState.getGuardianConfigurations)
      .pipe(
        first((guardianConfigurations) => !!guardianConfigurations),
        tap((guardianConfigurations) => {
          this.guardianConfigurations$.next(guardianConfigurations);
          this.createForm();
          this.isFormReady$.next(true);
        }),
        untilDestroyed(this)
      )
      .subscribe();

    this.store.dispatch(new LoadGuardianConfigurations());
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

  createForm() {
    this.groupForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.min(this.nameMinLength),
          Validators.max(this.nameMaxLength),
        ],
      ],
      priority: [
        this.priorityMin,
        [
          Validators.required,
          Validators.min(this.priorityMin),
          Validators.max(this.priorityMax),
        ],
      ],
      active: [false],
      default: [false],
      permissions: [],
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
