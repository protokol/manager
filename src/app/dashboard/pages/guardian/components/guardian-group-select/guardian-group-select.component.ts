import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { TableUtils } from '@shared/utils/table-utils';
import { BehaviorSubject, combineLatest } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  skip,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { untilDestroyed } from '@core/until-destroyed';
import { BaseResourcesTypes, GuardianResourcesTypes } from '@protokol/client';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { GuardianGroupsService } from '@core/services/guardian-groups.service';
import {
  LoadGuardianGroupsSelectFunc,
  UserGroupsFormItem
} from '@app/dashboard/pages/guardian/interfaces/guardian.types';

@Component({
  selector: 'app-guardian-group-select',
  templateUrl: './guardian-group-select.component.html',
  styleUrls: ['./guardian-group-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GuardianGroupSelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => GuardianGroupSelectComponent),
      multi: true,
    },
  ],
})
export class GuardianGroupSelectComponent
  implements ControlValueAccessor, OnInit, OnDestroy {
  formControl!: FormControl;
  groups$ = new BehaviorSubject<Partial<GuardianResourcesTypes.Group>[]>([]);
  queryParams$ = new BehaviorSubject<NzTableQueryParams | null>(null);
  isLoading$ = new BehaviorSubject(false);
  isLastPage$ = new BehaviorSubject(false);
  filterOutGroupNames$ = new BehaviorSubject<UserGroupsFormItem[]>([]);
  loadFunc$ = new BehaviorSubject<LoadGuardianGroupsSelectFunc>((queryParams) => {
    return this.guardianGroupsService.getGroups(queryParams);
  });

  @Input()
  set filterOutIds(filterOutIds: UserGroupsFormItem) {
    if (Array.isArray(filterOutIds)) {
      this.filterOutGroupNames$.next(filterOutIds);
    }
  }

  @Input()
  set loadFunc(loadFunc: LoadGuardianGroupsSelectFunc) {
    if (typeof loadFunc === 'function') {
      this.loadFunc$.next(loadFunc);
    }
  }

  constructor(private guardianGroupsService: GuardianGroupsService) {
    this.formControl = new FormControl([]);
    this.formControl.valueChanges
      .pipe(
        tap((formControlValue) => {
          this.onChange(formControlValue);
          this.onTouched();
        }),
        untilDestroyed(this)
      )
      .subscribe();

    this.queryParams$
      .asObservable()
      .pipe(
        filter((queryParams) => !!queryParams),
        map((queryParams) => {
          if (queryParams.filter.length && queryParams.filter[0].value === '') {
            return {
              ...queryParams,
              filter: [],
            };
          }
          return queryParams;
        }),
        distinctUntilChanged(),
        tap(() => this.isLoading$.next(true)),
        debounceTime(1000),
        switchMap((queryParams) => {
          return this.loadFunc$
            .getValue()
            .apply(this, queryParams)
            .pipe(
              tap(({ data, meta }) => {
                this.groups$.next(
                  [...this.groups$.getValue(), ...data].filter(
                    ({ name }) => !this.filterOutGroupNames$.getValue().includes(name)
                  )
                );

                if (!meta.next) {
                  this.isLastPage$.next(true);
                }
              }),
              // Cancel previous
              takeUntil(this.queryParams$.asObservable().pipe(skip(1))),
              finalize(() => this.isLoading$.next(false))
            );
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnInit() {
    combineLatest([
      this.loadFunc$.asObservable(),
      this.filterOutGroupNames$.asObservable(),
    ])
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        tap(() => {
          this.groups$.next([]);
          this.isLastPage$.next(false);

          this.queryParams$.next({
            ...TableUtils.getDefaultNzTableQueryParams(),
            ...this.queryParams$.getValue(),
            pageIndex: 0,
          });
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  next() {
    if (this.isLastPage$.getValue() || this.isLoading$.getValue()) {
      return;
    }

    const prevQueryParams = this.queryParams$.getValue();
    const { pageIndex } = prevQueryParams;
    this.queryParams$.next({
      ...prevQueryParams,
      pageIndex: pageIndex + 1,
    });
  }

  onSearchChanged(event: string) {
    this.groups$.next([]);
    this.isLastPage$.next(false);

    this.queryParams$.next({
      ...TableUtils.getDefaultNzTableQueryParams(),
      filter: [{ key: 'id', value: event }],
    });
  }

  get value(): BaseResourcesTypes.Collections {
    return this.formControl.value;
  }

  set value(value) {
    this.formControl.setValue(value);
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
      this.formControl.disable();
    } else {
      this.formControl.enable();
    }
  }

  writeValue(value): void {
    if (value) {
      this.value = value;
    }

    if (value === null) {
      this.formControl.reset();
    }
  }

  validate() {
    return this.formControl.valid;
  }

  ngOnDestroy(): void {}
}
