import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { Pagination } from '@app/@shared/interfaces/table.types';
import { AssetsServiceInterface } from '@core/interfaces/assets-service.interface';
import { getMetaFixture } from '@core/services/__fixtures__/base-fixture.spec';
import {
  assetsFixture,
  getAssetFixture,
} from '@core/services/__fixtures__/assets-fixture.spec';

@Injectable()
export class AssetsServiceMock implements AssetsServiceInterface {
  constructor() {}

  getAsset(assetId: string): Observable<BaseResourcesTypes.Assets> {
    return of(getAssetFixture(assetId));
  }

  getAssets(): Observable<Pagination<BaseResourcesTypes.Assets>> {
    const assets = [...assetsFixture];
    return of({
      data: assets,
      meta: getMetaFixture(assets.length),
    });
  }

  searchAssets(): Observable<Pagination<BaseResourcesTypes.Assets>> {
    return this.getAssets();
  }
}
