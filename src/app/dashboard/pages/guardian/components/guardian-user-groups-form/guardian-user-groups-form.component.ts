import {
  ChangeDetectionStrategy,
  Component,
  forwardRef, Input,
  OnDestroy, OnInit
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
import { GuardianResourcesTypes } from '@protokol/client';
import { BehaviorSubject } from 'rxjs';
import { UserGroupsFormItem } from '@app/dashboard/pages/guardian/interfaces/guardian.types';

@Component({
  selector: 'app-guardian-user-groups-form',
  templateUrl: './guardian-user-groups-form.component.html',
  styleUrls: ['./guardian-user-groups-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GuardianUserGroupsFormComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GuardianUserGroupsFormComponent),
      multi: true,
    },
  ],
})
export class GuardianUserGroupsFormComponent implements ControlValueAccessor, OnInit, OnDestroy {
  form!: FormArray;
  groupDropdownFormControl = new FormControl();
  filterOutGroups$ = new BehaviorSubject<UserGroupsFormItem[]>([]);

  @Input() max = Number.MAX_SAFE_INTEGER;

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.form = this.formBuilder.array([], [Validators.maxLength(this.max - 1)]);

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

  get value(): UserGroupsFormItem[] {
    return this.form.value;
  }

  set value(value) {
    this.form.reset();
    if (value.length) {
      value.forEach((g) => {
        this.onAddGroup(g);
      });
      this.form.setValue(value);
    }
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

  onAddGroup(value: Partial<GuardianResourcesTypes.Group>, event?: MouseEvent) {
    if (event) {
      event.preventDefault();
    }

    const { name } = value;
    this.filterOutGroups$.next([...this.filterOutGroups$.getValue(), { name }]);
    this.groupDropdownFormControl.reset();

    this.form.push(
      this.formBuilder.group({
        name: [value.name, Validators.required],
      })
    );
  }

  onRemoveGroup(event: MouseEvent, index: number, groupName: string) {
    event.preventDefault();

    this.filterOutGroups$.next([
      ...this.filterOutGroups$
        .getValue()
        .filter(({ name }) => name !== groupName),
    ]);

    this.form.removeAt(index);
  }
}
