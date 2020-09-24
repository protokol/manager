import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  OnDestroy,
} from '@angular/core';
import {
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { first, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { NftIdsFormItem } from '@app/dashboard/pages/transfers/interfaces/transfers.types';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngxs/store';
import { LoadTransactionTypes } from '@app/dashboard/pages/guardian-groups/state/guardian-groups/guardian-groups.actions';
import { GuardianGroupsState } from '@app/dashboard/pages/guardian-groups/state/guardian-groups/guardian-groups.state';

@Component({
  selector: 'app-guardian-group-permissions-form',
  templateUrl: './guardian-group-permissions-form.component.html',
  styleUrls: ['./guardian-group-permissions-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GuardianGroupPermissionsFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GuardianGroupPermissionsFormComponent),
      multi: true,
    },
  ],
})
export class GuardianGroupPermissionsFormComponent implements ControlValueAccessor, OnDestroy {
  form!: FormArray;
  isFormReady$ = new BehaviorSubject(false);
  transactionTypes$ = new BehaviorSubject<[string, Record<string, number>][] | null>(null);

  constructor(private formBuilder: FormBuilder, private store: Store) {
    this.store.select(GuardianGroupsState.getTransactionTypes)
      .pipe(
        first(transactionTypes => !!transactionTypes),
        tap((transactionTypes) => {
          this.transactionTypes$.next(Object.entries(transactionTypes));
          this.createForm();
          this.isFormReady$.next(true);
        }),
        untilDestroyed(this)
      ).subscribe();

    this.store.dispatch(new LoadTransactionTypes());

    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.array([]);

    this.form.valueChanges
      .pipe(
        tap((formValue) => {
          this.onChange(formValue);
          this.onTouched();
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  c(controlName: string) {
    return this.form.controls[controlName];
  }

  get value(): NftIdsFormItem[] {
    return this.form.value;
  }

  set value(value) {
    this.form.setValue((value as unknown) as any[]);
    this.onChange(value);
    this.onTouched();
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  writeValue(value): void {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.form.reset();
    }
  }

  validate() {
    return this.form.valid;
  }

  ngOnDestroy(): void {}
}
