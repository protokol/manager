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
import { BehaviorSubject, isObservable, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
  TableColumnSearch,
  TablePagination,
} from '@app/@shared/interfaces/table.types';
import { share, tap } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd';
import { untilDestroyed } from '@core/until-destroyed';

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
  rows$: Observable<any[]>;
  headers: TableColumnConfig[] = [];
  pagination: TablePagination = {
    pageIndex: 0,
    pageSize: 0,
    total: 0,
  };
  search: { [columnName: string]: TableColumnSearch } = {};
  tableQueryParams: NzTableQueryParams;

  @ContentChild(TemplateRef, { static: false }) expandTpl: TemplateRef<any>;

  @Output() paginationChange: EventEmitter<
    NzTableQueryParams
  > = new EventEmitter<NzTableQueryParams>();

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
    // Expanded table does not seems to work with fixed scroll
    if (isExpandable) {
      this.scrollY$.next(null);
    }
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
      this.pagination = {
        total: meta.totalCount,
        pageSize: meta.count,
        pageIndex: 0,
      };
    }
  }

  private pipeRows(rows$: Observable<any[]>) {
    return rows$.pipe(
      untilDestroyed(this),
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

  constructor() {}

  ngOnInit(): void {}

  onQueryParamsChange(tableQueryParams: NzTableQueryParams) {
    const { pageIndex, pageSize } = tableQueryParams;
    if (!(pageIndex === 0 && pageSize === 0)) {
      this.paginationChange.emit({
        ...tableQueryParams,
        filter: this.serializeFilter(),
      });
      this.tableQueryParams = tableQueryParams;
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
    this.emitPaginationChange();
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

    this.emitPaginationChange();
  }

  emitPaginationChange() {
    this.paginationChange.emit({
      pageSize: this.pagination.pageSize,
      pageIndex: this.pagination.pageIndex,
      sort: [...this.tableQueryParams.sort],
      filter: this.serializeFilter(),
    });
  }

  serializeFilter() {
    return Object.keys(this.search).reduce(
      (acc, curr) => [
        ...acc,
        {
          key: curr,
          value: this.search[curr].value,
        },
      ],
      []
    );
  }

  ngOnDestroy(): void {}
}
