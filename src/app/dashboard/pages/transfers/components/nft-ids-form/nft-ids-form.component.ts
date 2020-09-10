import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  OnDestroy
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
import { NftIdsFormItem } from '@app/dashboard/pages/transfers/interfaces/transfers.types';
import { BaseResourcesTypes } from '@protokol/nft-client';

@Component({
  selector: 'app-nft-ids-form',
  templateUrl: './nft-ids-form.component.html',
  styleUrls: ['./nft-ids-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NftIdsFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NftIdsFormComponent),
      multi: true,
    },
  ],
})
export class NftIdsFormComponent implements ControlValueAccessor, OnDestroy {
  form!: FormArray;
  assetDropdownFormControl = new FormControl();

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

  onAddNft(event: MouseEvent, value: BaseResourcesTypes.Assets) {
    event.preventDefault();

    this.form.push(
      this.formBuilder.group({
        nftId: [value.id, Validators.required],
      })
    );
  }

  onRemoveNft(event: MouseEvent, index: number) {
    event.preventDefault();

    this.form.removeAt(index);
  }
}
