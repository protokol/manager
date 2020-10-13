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
  FormControl,
  Validators,
} from '@angular/forms';
import { tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject } from 'rxjs';
import { Wallet } from '@arkecosystem/client';
import { PublicKeyFormItem } from '@app/dashboard/pages/collections/interfaces/collection.types';

@Component({
  selector: 'app-public-keys-form',
  templateUrl: './public-keys-form.component.html',
  styleUrls: ['./public-keys-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PublicKeysFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => PublicKeysFormComponent),
      multi: true,
    },
  ],
})
export class PublicKeysFormComponent implements ControlValueAccessor, OnDestroy {
  form!: FormArray;
  walletDropdownFormControl = new FormControl();
  filterOutWallets$ = new BehaviorSubject<string[]>([]);

  constructor(private formBuilder: FormBuilder) {
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

  get value(): PublicKeyFormItem[] {
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

  onAddWallet(event: MouseEvent, value: Wallet) {
    event.preventDefault();

    this.filterOutWallets$.next([...this.filterOutWallets$.getValue(), value.publicKey]);
    this.walletDropdownFormControl.reset();

    this.form.push(
      this.formBuilder.group({
        publicKey: [value.publicKey, Validators.required],
      })
    );
  }

  onRemoveWallet(event: MouseEvent, index: number, publicKey: string) {
    event.preventDefault();

    this.filterOutWallets$.next([
      ...this.filterOutWallets$
        .getValue()
        .filter((key) => key !== publicKey),
    ]);

    this.form.removeAt(index);
  }
}
