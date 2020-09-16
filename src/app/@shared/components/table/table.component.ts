import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import { BehaviorSubject, isObservable, Observable, of, Subject } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
  TableColumnSearch,
  TablePagination,
} from '@app/@shared/interfaces/table.types';
import { distinctUntilChanged, filter, share, skip, tap } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd';
import { untilDestroyed } from '@core/until-destroyed';
import { TableUtils } from '@shared/utils/table-utils';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit, OnDestroy {
  scrollX$ = new BehaviorSubject<string | null>(null);
  scrollY$ = new BehaviorSubject<string | null>('70vh');
  isLoading$ = new BehaviorSubject(false);
  isExpandable$ = new BehaviorSubject(false);
  expandableRows$ = new BehaviorSubject<{ [name: string]: boolean }>({});
  isFrontPagination$ = new BehaviorSubject(false);
  pagination$ = new BehaviorSubject<TablePagination>({
    pageIndex: 0,
    pageSize: TableUtils.getDefaultPageSize(),
    total: 0,
  });
  rows$: Observable<any[]>;
  headers: TableColumnConfig[] = [];
  search: { [columnName: string]: TableColumnSearch } = {};
  tableQueryParams: Partial<NzTableQueryParams> = {
    pageIndex: 1,
    pageSize: TableUtils.getDefaultPageSize(),
  };

  @ContentChild(TemplateRef, { static: false }) expandTpl: TemplateRef<any>;

  paginationChange$ = new Subject<NzTableQueryParams>();
  @Output() paginationChange = new EventEmitter<NzTableQueryParams>();

  @Input('scrollX')
  set _scrollX(scrollX: string | null) {
    this.scrollX$.next(scrollX);
  }

  @Input('scrollY')
  set _scrollY(scrollY: string | null) {
    this.scrollY$.next(scrollY);
  }

  @Input('isLoading')
  set _isLoading(isLoading: boolean) {
    this.isLoading$.next(isLoading);
  }

  @Input('isExpandable')
  set _isExpandable(isExpandable: boolean) {
    this.isExpandable$.next(isExpandable);
  }

  @Input('isFrontPagination')
  set _isFrontPagination(isRemotePagination: boolean) {
    this.isFrontPagination$.next(isRemotePagination);
  }

  @Input('rows')
  set _rows(rows: any[] | Observable<any[]>) {
    if (isObservable(rows)) {
      this.rows$ = this.pipeRows(rows);
    } else {
      this.rows$ = this.pipeRows(of(rows));
    }
  }

  @Input('tableColumns')
  set _tableColumns(tableColumns: TableColumnConfig[]) {
    this.headers = [...tableColumns];
    this.search = tableColumns
      .filter((c) => c.searchBy === true)
      .reduce(
        (acc, curr) => ({
          ...acc,
          [curr.propertyName]: {
            isVisible: false,
            value: null,
          } as TableColumnSearch,
        }),
        {} as { [columnName: string]: TableColumnSearch }
      );
  }

  @Input('meta')
  set _meta(meta: PaginationMeta) {
    if (meta) {
      const { totalCountIsEstimate, totalCount, count } = meta;
      const { pageIndex, pageSize } = this.tableQueryParams;
      const isEmptyNextPage = count <= 0 && pageIndex > 1;

      const getTotal = () => {
        const calculateTotalCount = () =>
          (pageIndex - 1) * pageSize + totalCount;
        const calculateTotalCountPrev = () => (pageIndex - 1) * pageSize;

        if (totalCountIsEstimate && count < pageSize) {
          return calculateTotalCount();
        } else if (totalCountIsEstimate) {
          return isEmptyNextPage
            ? calculateTotalCountPrev() - 1
            : calculateTotalCount() + 1;
        }
        return totalCount;
      };

      this.pagination$.next({
        total: getTotal(),
        pageSize,
        pageIndex:
          (totalCountIsEstimate && isEmptyNextPage
            ? pageIndex - 1
            : pageIndex) || 1,
      });
    }
  }

  private pipeRows(rows$: Observable<any[]>) {
    return rows$.pipe(
      untilDestroyed(this),
      filter((rows) => !!rows),
      tap((rows) => {
        const isExpandable = this.isExpandable$.getValue();
        if (isExpandable && rows.every((r) => r.hasOwnProperty('id'))) {
          this.expandableRows$.next(
            rows.reduce(
              (acc, curr) => ({
                ...acc,
                [curr.id]: false,
              }),
              {}
            )
          );
        }
      }),
      share()
    );
  }

  constructor() {
    this.paginationChange$
      .asObservable()
      .pipe(
        untilDestroyed(this),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        skip(1),
        tap((pagination) => {
          this.paginationChange.emit(pagination);
        })
      )
      .subscribe();
  }

  ngOnInit(): void {}

  onQueryParamsChange(tableQueryParams: NzTableQueryParams) {
    const { pageIndex } = tableQueryParams;
    if (pageIndex !== 0 || !!this.isFrontPagination$.getValue()) {
      this.paginationChange$.next({
        ...tableQueryParams,
        filter: this.serializeFilter(),
      });
      this.tableQueryParams = { ...tableQueryParams };
    }
  }

  onExpandChange(expanded: boolean, id: string) {
    this.expandableRows$.next({
      ...this.expandableRows$.getValue(),
      [id]: expanded,
    });
  }

  searchChanged(event: MouseEvent) {
    event.preventDefault();
    this.emitPaginationChange({ loadFirstPage: true });
  }

  searchReset(event: MouseEvent, propertyName: string) {
    event.preventDefault();
    this.search = {
      ...this.search,
      [propertyName]: {
        isVisible: false,
        value: null,
      },
    };

    this.emitPaginationChange({ loadFirstPage: true });
  }

  emitPaginationChange(
    options: { loadFirstPage: boolean } = { loadFirstPage: false }
  ) {
    const { pageIndex } = this.pagination$.getValue();
    const { pageSize, sort } = this.tableQueryParams;
    const { loadFirstPage } = options;

    if (loadFirstPage) {
      this.tableQueryParams = {
        ...this.tableQueryParams,
        pageIndex: 1,
      };
    }

    this.paginationChange$.next({
      pageSize,
      pageIndex: loadFirstPage ? 1 : pageIndex,
      sort: [...sort],
      filter: this.serializeFilter(),
    });
  }

  serializeFilter() {
    return Object.keys(this.search)
      .reduce(
        (acc, curr) => [
          ...acc,
          {
            key: curr,
            value: this.search[curr].value,
          },
        ],
        []
      )
      .filter((f) => !!f.value);
  }

  ngOnDestroy(): void {}
}
