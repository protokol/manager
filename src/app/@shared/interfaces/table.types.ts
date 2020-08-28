import { TemplateRef } from '@angular/core';
import { ApiQuery } from '@arkecosystem/client';

export interface TableColumnConfig<T = any> {
  propertyName?: keyof T;
  headerName?: string;
  headerNameTpl?: TemplateRef<never>;
  columnTransform?: (row: T, propertyValue: any) => any;
  columnTransformTpl?: TemplateRef<{ row: T }>;
  sortBy?: boolean;
  searchBy?: boolean;
  width?: string | null;
}

export interface PaginationMeta {
  totalCountIsEstimate: boolean;
  count: number;
  pageCount: number;
  totalCount: number;
  next?: string;
  previous?: string;
  self: string;
  first: string;
  last: string;
}

export interface Pagination<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface TablePagination {
  total: number;
  pageSize: number;
  pageIndex: number;
}

export interface TableColumnSearch {
  isVisible: boolean;
  value: string | null;
}

export interface TableApiQuery extends ApiQuery {
  orderBy?: string;
  transform?: boolean;
  filters?: {
    [filterName: string]: string;
  };
}
