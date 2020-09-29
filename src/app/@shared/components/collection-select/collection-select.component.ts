import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CollectionsService } from '@core/services/collections.service';
import { TableUtils } from '@shared/utils/table-utils';
import { BehaviorSubject } from 'rxjs';
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
import { Store } from '@ngxs/store';
import { SetCollectionsByIds } from '@core/store/collections/collections.actions';
import { BaseResourcesTypes } from '@protokol/client';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { untilDestroyed } from '@core/until-destroyed';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-collection-select',
  templateUrl: './collection-select.component.html',
  styleUrls: ['./collection-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CollectionSelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => CollectionSelectComponent),
      multi: true,
    },
  ],
})
export class CollectionSelectComponent
  implements ControlValueAccessor, OnInit, OnDestroy {
  formControl!: FormControl;
  collections$ = new BehaviorSubject<BaseResourcesTypes.Collections[]>([]);
  queryParams$ = new BehaviorSubject<NzTableQueryParams | null>(null);
  isLoading$ = new BehaviorSubject(false);
  isLastPage$ = new BehaviorSubject(false);

  constructor(
    private collectionsService: CollectionsService,
    private store: Store
  ) {
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
          const hasFilters =
            queryParams && queryParams.filter && queryParams.filter.length;

          const loadCollections = hasFilters
            ? this.collectionsService.searchCollections(
                TableUtils.toTableApiQuery(queryParams)
              )
            : this.collectionsService.getCollections(
                TableUtils.toTableApiQuery(queryParams)
              );

          return loadCollections.pipe(
            tap(({ data, meta }) => {
              this.store.dispatch(new SetCollectionsByIds(data));
              this.collections$.next([
                ...this.collections$.getValue(),
                ...data,
              ]);

              if (!meta.next) {
                this.isLastPage$.next(true);
              }
            }),
            // Cancel previous
            takeUntil(this.queryParams$.asObservable().pipe(skip(1))),
            finalize(() => this.isLoading$.next(false))
          );
        })
      )
      .subscribe();
  }

  ngOnInit() {
    this.queryParams$.next({
      ...TableUtils.getDefaultNzTableQueryParams(),
    });
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
    this.collections$.next([]);
    this.isLastPage$.next(false);

    this.queryParams$.next({
      ...TableUtils.getDefaultNzTableQueryParams(),
      filter: [{ key: 'name', value: event }],
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
