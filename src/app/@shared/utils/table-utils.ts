import { NzTableQueryParams, NzTableSortOrder } from 'ng-zorro-antd/table/src/table.types';
import { TableApiQuery } from '@shared/interfaces/table.types';

export abstract class TableUtils {
  static toApiSortOrder(tableSortOrder: NzTableSortOrder) {
    switch (tableSortOrder) {
      case 'ascend':
        return 'asc';
      case 'descend':
      default:
        return 'desc';
    }
  }

  static getSort(
    sort: NzTableQueryParams['sort']
  ): { key: string; direction: string } {
    const currentSort =
      sort && sort.find((item) => item && item.value !== null);
    const key = (currentSort && currentSort.key) || null;
    const direction = TableUtils.toApiSortOrder(
      (currentSort && currentSort.value) || 'ascend'
    );

    return {
      key,
      direction,
    };
  }

  static getFilterValue(
    filter: NzTableQueryParams['filter'],
    filterKey: string
  ): string | null {
    const filterItem =
      filter && filter.find((item) => item && item.key === filterKey);
    return filterItem?.value || null;
  }

  static toTableApiQuery(tableQueryParams?: NzTableQueryParams): TableApiQuery {
    const { pageSize, pageIndex, sort, filter } = tableQueryParams || {
      pageIndex: 1,
      pageSize: TableUtils.getDefaultPageSize(),
    };
    const currentSort =
      sort && sort.find((item) => item && item.value !== null);
    const sortField = (currentSort && currentSort.key) || null;
    const sortOrder = TableUtils.toApiSortOrder(
      (currentSort && currentSort.value) || 'ascend'
    );

    return Object.assign(
      {
        limit: pageSize,
        page: pageIndex,
      },
      sortField ? { orderBy: `${sortField}:${sortOrder}` } : {},
      filter && filter.length
        ? {
            filters: filter.reduce(
              (acc, curr) => ({
                ...acc,
                [curr.key]: curr.value,
              }),
              {}
            ),
          }
        : {}
    );
  }

  static getDefaultPageSize() {
    return 50;
  }

  static getDefaultNzTableQueryParams(): NzTableQueryParams {
    return {
      pageIndex: 1,
      pageSize: 50,
      filter: [],
      sort: [],
    };
  }
}
