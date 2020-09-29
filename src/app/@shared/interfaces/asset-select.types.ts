import { Observable } from 'rxjs';
import { Pagination } from '@shared/interfaces/table.types';
import { BaseResourcesTypes } from '@protokol/client';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

export type LoadAssetsSelectFunc = (
  queryParams: NzTableQueryParams | null
) => Observable<Pagination<Partial<BaseResourcesTypes.Assets>>>;
