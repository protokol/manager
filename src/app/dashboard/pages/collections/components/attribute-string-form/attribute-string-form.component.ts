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
import { AttributeString } from '@app/dashboard/pages/collections/interfaces/collection.types';

@Component({
  selector: 'app-attribute-string-form',
  templateUrl: './attribute-string-form.component.html',
  styleUrls: ['./attribute-string-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AttributeStringFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AttributeStringFormComponent),
      multi: true,
    },
  ],
})
export class AttributeStringFormComponent
  implements ControlValueAccessor, OnDestroy {
  form!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
  }

  get minLength() {
    return 1;
  }

  get maxLength() {
    return Number.MAX_SAFE_INTEGER;
  }

  createForm() {
    this.form = this.formBuilder.group({
      minLength: [
        '',
        [Validators.min(this.minLength), Validators.max(this.maxLength)],
      ],
      maxLength: [
        '',
        [Validators.min(this.minLength), Validators.max(this.maxLength)],
      ],
      pattern: [''],
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

  get value(): AttributeString {
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
