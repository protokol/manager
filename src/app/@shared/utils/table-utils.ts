import { NzTableQueryParams } from 'ng-zorro-antd';
import { NzTableSortOrder } from 'ng-zorro-antd/table/src/table.types';
import { BaseResourcesTypes } from '@protokol/nft-client';

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

	static toAllCollectionQuery(tableQueryParams?: NzTableQueryParams): BaseResourcesTypes.AllCollectionsQuery {
		const { pageSize, pageIndex, sort } = tableQueryParams || {
			pageIndex: 0,
			pageSize: 100
		};
		const currentSort = sort && sort.find(item => item && item.value !== null);
		const sortField = (currentSort && currentSort.key) || null;
		const sortOrder = TableUtils.toApiSortOrder((currentSort && currentSort.value) || 'ascend');

		return Object.assign({
			limit: pageSize,
			page: pageIndex + 1
		}, sortField ? { orderBy: `${sortField}:${sortOrder}` } : {});
	}
}
