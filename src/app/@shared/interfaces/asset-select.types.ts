import { NzTableQueryParams } from 'ng-zorro-antd';
import { Observable } from 'rxjs';
import { Pagination } from '@shared/interfaces/table.types';
import { BaseResourcesTypes } from '@protokol/nft-client';

export type LoadAssetsSelectFunc = (queryParams: NzTableQueryParams | null) => Observable<Pagination<Partial<BaseResourcesTypes.Assets>>>;
