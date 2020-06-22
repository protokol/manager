import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	Input,
	OnInit,
	Output
} from '@angular/core';
import { BehaviorSubject, isObservable, Observable, of } from 'rxjs';
import { PaginationMeta, TableColumnConfig, TablePagination } from '@app/@shared/interfaces/table.types';
import { share } from 'rxjs/operators';
import { NzTableQueryParams } from 'ng-zorro-antd';

@Component({
	selector: 'app-table',
	templateUrl: './table.component.html',
	styleUrls: ['./table.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableComponent implements OnInit {
	isLoading$ = new BehaviorSubject(false);
	isFrontPagination$ = new BehaviorSubject(false);
	rows$: Observable<any[]>;
	headers: TableColumnConfig[] = [];
	pagination: TablePagination = {
		pageIndex: 0,
		pageSize: 0,
		total: 0
	};

	@Output() paginationChange: EventEmitter<NzTableQueryParams> = new EventEmitter<NzTableQueryParams>();

	@Input('isLoading')
	set _isLoading(isLoading: boolean) {
		this.isLoading$.next(isLoading);
	}

	@Input('isFrontPagination')
	set _isFrontPagination(isRemotePagination: boolean) {
		this.isFrontPagination$.next(isRemotePagination);
	}

	@Input('rows')
	set _rows(rows: any[] | Observable<any[]>) {
		if (isObservable(rows)) {
			this.rows$ = rows.pipe(share());
		} else {
			this.rows$ = of(rows).pipe(share());
		}
	}

	@Input('tableColumns')
	set _tableColumns(tableColumns: TableColumnConfig[]) {
		this.headers = [...tableColumns];
	}

	@Input('meta')
	set _meta(meta: PaginationMeta) {
		if (meta) {
			this.pagination = {
				total: meta.totalCount,
				pageSize: meta.count,
				pageIndex: 0
			};
		}
	}

	constructor() {}

	ngOnInit(): void {}

	onQueryParamsChange(tableQueryParams: NzTableQueryParams) {
		this.paginationChange.emit(tableQueryParams);
	}
}
