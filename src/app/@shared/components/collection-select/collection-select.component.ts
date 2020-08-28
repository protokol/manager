import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CollectionsService } from '@core/services/collections.service';
import { NzTableQueryParams } from 'ng-zorro-antd';
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
import { BaseResourcesTypes } from '@protokol/nft-client';

@Component({
  selector: 'app-collection-select',
  templateUrl: './collection-select.component.html',
  styleUrls: ['./collection-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionSelectComponent implements OnInit {
  collections$ = new BehaviorSubject<BaseResourcesTypes.Collections[]>([]);
  queryParams$ = new BehaviorSubject<NzTableQueryParams | null>(null);
  isLoading$ = new BehaviorSubject(false);
  isLastPage$ = new BehaviorSubject(false);

  @Input() formGroupInput;
  @Input() formControlNameInput;

  constructor(
    private collectionsService: CollectionsService,
    private store: Store
  ) {
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
}
