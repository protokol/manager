import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Logger } from '@core/services/logger.service';
import { BehaviorSubject } from 'rxjs';
import {
  Actions,
  ofActionCompleted,
  ofActionSuccessful,
  Store,
} from '@ngxs/store';
import { ManagerCreateSnapshot } from '@app/dashboard/pages/nodes/state/manager-snapshots/manager-snapshots.actions';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { untilDestroyed } from '@core/until-destroyed';
import { tap } from 'rxjs/operators';
import { FuncUtils } from '@core/utils/func-utils';
import { FormUtils } from '@core/utils/form-utils';

@Component({
  selector: 'app-snapshot-create-modal',
  templateUrl: './snapshot-create-modal.component.html',
  styleUrls: ['./snapshot-create-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SnapshotCreateModalComponent implements OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Input() managerUrl;

  isFormDirty$ = new BehaviorSubject(false);
  isLoading$ = new BehaviorSubject(false);

  snapshotForm!: FormGroup;

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
        ofActionCompleted(ManagerCreateSnapshot),
        tap(() => this.isLoading$.next(false))
      )
      .subscribe();

    this.action$
      .pipe(
        untilDestroyed(this),
        ofActionSuccessful(ManagerCreateSnapshot),
        tap(() => this.nzMessageService.success(`Snapshot "${name}" created!`)),
        tap(() => this.modalRef.destroy())
      )
      .subscribe();
  }

  private createForm() {
    this.snapshotForm = this.formBuilder.group({
      codec: ['json', Validators.required],
      skipCompression: [true],
      start: ['', [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
      end: ['', [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)]],
    });
  }

  c(controlName: string) {
    return this.snapshotForm.controls[controlName];
  }

  createSnapshot(event) {
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
      {}
    );

    this.store
      .dispatch(
        new ManagerCreateSnapshot(nonEmptySnapshotFormValues, this.managerUrl)
      )
      .pipe(
        untilDestroyed(this),
        tap(FuncUtils.noop, (err) => {
          this.log.error(err);
          this.nzMessageService.error('Snapshot create failed!');
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {}
}
