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
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { AttributesString } from '@app/dashboard/pages/collections/interfaces/collection.types';

@Component({
  selector: 'app-attribute-number-form',
  templateUrl: './attribute-number-form.component.html',
  styleUrls: ['./attribute-number-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AttributeNumberFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AttributeNumberFormComponent),
      multi: true,
    },
  ],
})
export class AttributeNumberFormComponent
  implements ControlValueAccessor, OnDestroy {
  form!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
  }

  get min() {
    return Number.MIN_SAFE_INTEGER;
  }

  get max() {
    return Number.MAX_SAFE_INTEGER;
  }

  createForm() {
    this.form = this.formBuilder.group({
      minimum: ['', [Validators.min(this.min), Validators.max(this.max)]],
      maximum: ['', [Validators.min(this.min), Validators.max(this.max)]],
    });

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

  get value(): AttributesString {
    return this.form.value;
  }

  set value(value) {
    this.form.setValue((value as unknown) as { [key: string]: any });
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
    if (
      value &&
      (value.hasOwnProperty('minimum') || value.hasOwnProperty('maximum'))
    ) {
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
