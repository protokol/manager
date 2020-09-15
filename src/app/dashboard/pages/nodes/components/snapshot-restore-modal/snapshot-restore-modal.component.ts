import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Logger } from '@core/services/logger.service';
import { BehaviorSubject } from 'rxjs';
import {
  Actions,
  ofActionCompleted,
  ofActionSuccessful,
  Store,
} from '@ngxs/store';
import { ManagerRestoreSnapshot } from '@app/dashboard/pages/nodes/state/manager-snapshots/manager-snapshots.actions';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { untilDestroyed } from '@core/until-destroyed';
import { tap } from 'rxjs/operators';
import { FuncUtils } from '@core/utils/func-utils';
import { FormUtils } from '@core/utils/form-utils';

@Component({
  selector: 'app-snapshot-restore-modal',
  templateUrl: './snapshot-restore-modal.component.html',
  styleUrls: ['./snapshot-restore-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapshotRestoreModalComponent implements OnDestroy {
  readonly log = new Logger(this.constructor.name);

  isFormDirty$ = new BehaviorSubject(false);
  isLoading$ = new BehaviorSubject(false);

  snapshotForm!: FormGroup;

  @Input() snapshotName;
  @Input() managerUrl;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private modalRef: NzModalRef,
    private action$: Actions,
    private nzMessageService: NzMessageService
  ) {
    this.createForm();

    this.action$
      .pipe(
        untilDestroyed(this),
        ofActionCompleted(ManagerRestoreSnapshot),
        tap(() => this.isLoading$.next(false))
      )
      .subscribe();

    this.action$
      .pipe(
        untilDestroyed(this),
        ofActionSuccessful(ManagerRestoreSnapshot),
        tap(() =>
          this.nzMessageService.success(`Snapshot "${name}" restored!`)
        ),
        tap(() => this.modalRef.destroy())
      )
      .subscribe();
  }

  private createForm() {
    this.snapshotForm = this.formBuilder.group({
      truncate: [false],
      verify: [false],
    });
  }

  c(controlName: string) {
    return this.snapshotForm.controls[controlName];
  }

  snapshotRestore(event) {
    if (event) {
      event.preventDefault();
    }

    if (!this.snapshotForm.valid) {
      FormUtils.markFormGroupDirty(this.snapshotForm);
      this.isFormDirty$.next(true);
      return;
    }

    this.isLoading$.next(true);

    const snapshotFormValues = { ...this.snapshotForm.value };
    const nonEmptySnapshotFormValues = Object.keys(snapshotFormValues).reduce(
      (acc, curr) => {
        if (snapshotFormValues[curr]) {
          return { ...acc, [curr]: snapshotFormValues[curr] };
        }
        return acc;
      },
      {
        name: this.snapshotName,
      }
    );

    this.store
      .dispatch(
        new ManagerRestoreSnapshot(nonEmptySnapshotFormValues, this.managerUrl)
      )
      .pipe(
        untilDestroyed(this),
        tap(FuncUtils.noop, (err) => {
          this.log.error(err);
          this.nzMessageService.error('Snapshot restore failed!');
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {}
}
