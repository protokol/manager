import { TemplateRef } from '@angular/core';

export interface TableColumnConfig<T = any> {
	propertyName?: keyof T;
	headerName?: string;
	headerNameTpl?: TemplateRef<never>;
	columnTransform?: (row: T, propertyValue: any) => any;
	columnTransformTpl?: TemplateRef<{ row: T }>;
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
