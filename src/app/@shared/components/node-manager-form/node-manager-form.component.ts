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
  Validators,
  FormGroup,
  FormBuilder,
} from '@angular/forms';
import { NodeManagerLoginSettingsEnum } from '@app/dashboard/pages/nodes/interfaces/node.types';
import { tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';

@Component({
  selector: 'app-node-manager-form',
  templateUrl: './node-manager-form.component.html',
  styleUrls: ['./node-manager-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NodeManagerFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => NodeManagerFormComponent),
      multi: true,
    },
  ],
})
export class NodeManagerFormComponent
  implements ControlValueAccessor, OnDestroy {
  NodeManagerLoginSettingsEnum = NodeManagerLoginSettingsEnum;
  form!: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.createForm();
    this.registerFormListeners();
  }

  createForm() {
    this.form = this.formBuilder.group({
      loginType: ['', [Validators.required]],
      port: [
        '',
        [Validators.required, Validators.min(1), Validators.max(65535)],
      ],
      secretToken: [''],
      loginUsername: [''],
      loginPassword: [''],
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

  private registerFormListeners() {
    this.c('loginType')
      .valueChanges.pipe(
        untilDestroyed(this),
        tap((networkType: NodeManagerLoginSettingsEnum) => {
          if (networkType === NodeManagerLoginSettingsEnum.None) {
            this.c('secretToken').clearValidators();
            this.c('loginUsername').clearValidators();
            this.c('loginPassword').clearValidators();
          } else if (networkType === NodeManagerLoginSettingsEnum.Token) {
            this.c('secretToken').setValidators(Validators.required);
            this.c('loginUsername').clearValidators();
            this.c('loginPassword').clearValidators();
          } else if (networkType === NodeManagerLoginSettingsEnum.Basic) {
            this.c('secretToken').clearValidators();
            this.c('loginUsername').setValidators(Validators.required);
            this.c('loginPassword').setValidators(Validators.required);
          }
          this.c('secretToken').updateValueAndValidity();
          this.c('loginUsername').updateValueAndValidity();
          this.c('loginPassword').updateValueAndValidity();
        })
      )
      .subscribe();
  }

  get value(): NodeManagerLoginSettingsEnum {
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
