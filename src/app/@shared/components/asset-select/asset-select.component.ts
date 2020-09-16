import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd';
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
import { BaseResourcesTypes } from '@protokol/client';
import { AssetsService } from '@core/services/assets.service';
import { LoadAssetsSelectFunc } from '@app/@shared/interfaces/asset-select.types';

@Component({
  selector: 'app-asset-select',
  templateUrl: './asset-select.component.html',
  styleUrls: ['./asset-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AssetSelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AssetSelectComponent),
      multi: true,
    },
  ],
})
export class AssetSelectComponent
  implements ControlValueAccessor, OnInit, OnDestroy {
  formControl!: FormControl;
  assets$ = new BehaviorSubject<Partial<BaseResourcesTypes.Assets>[]>([]);
  queryParams$ = new BehaviorSubject<NzTableQueryParams | null>(null);
  isLoading$ = new BehaviorSubject(false);
  isLastPage$ = new BehaviorSubject(false);
  filterOutIds$ = new BehaviorSubject<string[]>([]);
  loadFunc$ = new BehaviorSubject<LoadAssetsSelectFunc>((queryParams) => {
    const hasFilters = !!queryParams?.filter?.length;

    return hasFilters
      ? this.assetsService.searchAssets(TableUtils.toTableApiQuery(queryParams))
      : this.assetsService.getAssets(TableUtils.toTableApiQuery(queryParams));
  });

  @Input()
  set filterOutIds(filterOutIds: string[]) {
    if (Array.isArray(filterOutIds)) {
      this.filterOutIds$.next(filterOutIds);
    }
  }

  @Input()
  set loadFunc(loadFunc: LoadAssetsSelectFunc) {
    if (typeof loadFunc === 'function') {
      this.loadFunc$.next(loadFunc);
    }
  }

  @Input()
  set ownerAddress(ownerAddress: string) {
    if (!ownerAddress) {
      return;
    }

    this.loadFunc$.next((queryParams) => {
      return this.assetsService.getAssetsByWalletId(ownerAddress).pipe(
        map(({ data, meta }) => {
          const hasFilters = !!queryParams?.filter?.length;
          const idFilter = hasFilters
            ? queryParams.filter.find(({ key }) => key === 'id')?.value
            : null;

          return {
            data: idFilter ? data.filter(({ id }) => id === idFilter) : data,
            meta,
          };
        })
      );
    });
  }

  constructor(private assetsService: AssetsService) {
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
                this.assets$.next(
                  [...this.assets$.getValue(), ...data].filter(
                    ({ id }) => !this.filterOutIds$.getValue().includes(id)
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
      this.filterOutIds$.asObservable(),
    ])
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        tap(() => {
          this.assets$.next([]);
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
    this.assets$.next([]);
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
