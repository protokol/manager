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
} from '@angular/forms';
import { first, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { NftIdsFormItem } from '@app/dashboard/pages/transfers/interfaces/transfers.types';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngxs/store';
import { GuardianState } from '@app/dashboard/pages/guardian/state/guardian/guardian.state';
import { GuardianUtils } from '@app/dashboard/pages/guardian/utils/guardian-utils';
import { GuardianResourcesTypes } from '@protokol/client';
import { TransactionType } from '@app/dashboard/pages/guardian/interfaces/guardian.types';

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
export class GuardianGroupPermissionsFormComponent
  implements ControlValueAccessor, OnInit, OnDestroy {
  form!: FormArray;
  isFormReady$ = new BehaviorSubject(false);
  isLoading$ = new BehaviorSubject(false);
  transactionTypes$ = new BehaviorSubject<TransactionType[] | null>(null);
  isExpanded$ = new BehaviorSubject<{ [type: number]: boolean }>({});

  @Input('defaultValues')
  set defaultValues(defaultValues: GuardianResourcesTypes.Permissions[]) {
    this.setDefaultValues(defaultValues);
  }

  constructor(private formBuilder: FormBuilder, private store: Store) {
    this.store
      .select(GuardianState.getTransactionTypes)
      .pipe(
        first((transactionTypes) => !!transactionTypes),
        tap((transactionTypes) => {
          const transactionTypesEntries = Object.entries(
            transactionTypes
          ).map(([index, value]) => [
            parseInt(index, 10),
            value,
          ]) as TransactionType[];

          this.isExpanded$.next(
            transactionTypesEntries
              .map(([index]) => index)
              .reduce((acc, curr) => ({ ...acc, [curr]: false }), {})
          );

          this.transactionTypes$.next(transactionTypesEntries);

          const formDefaultValues = transactionTypesEntries
            .map(([transactionTypeGroup, typeGroupValue]) => {
              return Object.values(typeGroupValue).map((transactionType) => {
                return {
                  kind: -1,
                  types: [
                    {
                      transactionTypeGroup,
                      transactionType,
                    },
                  ],
                };
              });
            })
            .flat() as GuardianResourcesTypes.Permissions[];

          this.createForm(formDefaultValues);
          this.isFormReady$.next(true);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnInit(): void {
  }

  fromPermissionToFormItem({
    kind,
    types: [{ transactionType, transactionTypeGroup }],
  }: GuardianResourcesTypes.Permissions) {
    return this.formBuilder.group({
      kind: [kind],
      types: this.formBuilder.array([
        this.formBuilder.group({
          transactionTypeGroup: [transactionTypeGroup],
          transactionType: [transactionType],
        }),
      ]),
    });
  }

  createForm(formPermissions: GuardianResourcesTypes.Permissions[]) {
    this.form = this.formBuilder.array(
      formPermissions
        .sort(
          (
            { types: [{ transactionTypeGroup: a }] },
            { types: [{ transactionTypeGroup: b }] }
          ) => a - b
        )
        .map((p) => this.fromPermissionToFormItem(p))
    );

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
      this.setDefaultValues(value);
    } else if (value === null) {
      const formDefaultValues = this.transactionTypes$.getValue()
        .map(([transactionTypeGroup, typeGroupValue]) => {
          return Object.values(typeGroupValue).map((transactionType) => {
            return {
              kind: -1,
              types: [
                {
                  transactionTypeGroup,
                  transactionType
                }
              ]
            };
          });
        })
        .flat() as GuardianResourcesTypes.Permissions[];

      this.setDefaultValues(formDefaultValues);
    }
  }

  validate() {
    return this.form.valid;
  }

  getGroupName(transactionTypeGroup: number) {
    return GuardianUtils.transactionTypeIndexToGroupName(transactionTypeGroup);
  }

  isTypeGroupSelected(transactionTypeGroupIndex: number, kindSelected: number) {
    const permissions = this.form.value as GuardianResourcesTypes.Permissions[];
    const permissionsForTransactionKind = permissions.filter(
      ({ types: [{ transactionTypeGroup }] }) =>
        transactionTypeGroupIndex === transactionTypeGroup
    );
    return permissionsForTransactionKind.every(({ kind }) => kind === kindSelected);
  }

  selectTypeGroup(isSelected: boolean, transactionTypeGroupIndex: number, kindSelected: number) {
    const permissions = this.form.value as GuardianResourcesTypes.Permissions[];
    const markAsKind = isSelected ? kindSelected : -1;
    this.isLoading$.next(true);

    permissions.forEach(
      ({ kind, types: [{ transactionTypeGroup }] }, index) => {
        if (
          kind !== markAsKind &&
          transactionTypeGroupIndex === transactionTypeGroup
        ) {
          this.form.at(index).patchValue({
            kind: markAsKind,
          });
        }
      }
    );

    this.isLoading$.next(false);
  }

  isTypeSelected(
    transactionTypeGroupIndex: number,
    transactionTypeIndex: number,
    kind: number
  ) {
    const permissions = this.form.value as GuardianResourcesTypes.Permissions[];
    return (
      permissions.find(
        ({ types: [{ transactionTypeGroup, transactionType }] }) =>
          transactionTypeGroupIndex === transactionTypeGroup &&
          transactionTypeIndex === transactionType
      )?.kind === kind
    );
  }

  selectType(
    isSelected: boolean,
    transactionTypeGroupIndex: number,
    transactionTypeIndex: number,
    kind: number
  ) {
    const permissions = this.form.value as GuardianResourcesTypes.Permissions[];
    const markAsKind = isSelected ? kind : -1;

    const permissionIndex = permissions.findIndex(
      ({ types: [{ transactionTypeGroup, transactionType }] }) =>
        transactionTypeGroupIndex === transactionTypeGroup &&
        transactionTypeIndex === transactionType
    );
    if (permissionIndex >= 0) {
      this.form.at(permissionIndex).patchValue({
        kind: markAsKind,
      });
    }
  }

  onExpand(
    event: MouseEvent,
    transactionTypeGroupIndex: number,
    expand: boolean
  ) {
    event.preventDefault();

    this.isExpanded$.next({
      ...this.isExpanded$.getValue(),
      [transactionTypeGroupIndex]: expand,
    });
  }

  setDefaultValues(defaultValues: GuardianResourcesTypes.Permissions[]) {
    if (defaultValues?.length) {
      this.isFormReady$.asObservable()
        .pipe(
          first(isFormReady => !!isFormReady),
          tap(() => {
            this.isLoading$.next(true);

            defaultValues.forEach(({ kind, types }) => {
              types.forEach(({ transactionTypeGroup, transactionType }) => {
                const permissions = this.form.value as GuardianResourcesTypes.Permissions[];

                const permissionIndex = permissions.findIndex(
                  ({ types: [{ transactionTypeGroup: typeGroup, transactionType: type }] }) => {
                    return transactionTypeGroup === typeGroup && type === transactionType;
                  });

                this.form.at(permissionIndex).patchValue({
                  kind
                });
              });
            });

            this.onChange(this.form.value);
            this.onTouched();

            this.isLoading$.next(false);
          }),
          untilDestroyed(this)
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {}
}
