import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Logger } from '@core/services/logger.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FormUtils } from '@core/utils/form-utils';
import { NzModalRef, NzSafeAny } from 'ng-zorro-antd';
import { untilDestroyed } from '@core/until-destroyed';
import { finalize, tap } from 'rxjs/operators';

@Component({
  selector: 'app-args-modal',
  templateUrl: './args-modal.component.html',
  styleUrls: ['./args-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArgsModalComponent implements OnDestroy {
  readonly log = new Logger(this.constructor.name);

  form!: FormGroup;

  isFormDirty$ = new BehaviorSubject(false);
  isLoading$ = new BehaviorSubject(false);

  complete$: (args: string) => Observable<NzSafeAny> = () => of(null);

  constructor(
    private formBuilder: FormBuilder,
    private nzModalRef: NzModalRef
  ) {
    this.createForm();
  }

  private createForm() {
    this.form = this.formBuilder.group({
      args: ['', [Validators.required]],
    });
  }

  c(controlName: string) {
    return this.form.controls[controlName];
  }

  ngOnDestroy(): void {}

  addNode(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.isLoading$.getValue()) {
      return;
    }

    if (!this.form.valid) {
      FormUtils.markFormGroupDirty(this.form);
      return;
    }

    this.isLoading$.next(true);

    const { args } = this.form.value;

    this.complete$(args)
      .pipe(
        tap(() => {
          this.nzModalRef.close();
        }),
        finalize(() => this.isLoading$.next(false)),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
