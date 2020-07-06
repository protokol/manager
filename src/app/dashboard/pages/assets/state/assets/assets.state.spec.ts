import { TestBed } from '@angular/core/testing';
import { Store, NgxsModule } from '@ngxs/store';
import { v4 as uuid } from 'uuid';
import {
  AssetsState,
  AssetsStateModel,
} from '@app/dashboard/pages/assets/state/assets/assets.state';
import { AssetsService } from '@core/services/assets.service';
import { AssetsServiceMock } from '@core/services/__mocks__/assets-service-mock.spec';
import {
  ASSETS_TYPE_NAME,
  LoadAsset,
  LoadAssets,
} from '@app/dashboard/pages/assets/state/assets/assets.actions';
import {
  assetsFixture,
  getAssetFixture,
} from '@core/services/__fixtures__/assets-fixture.spec';
import { getMetaFixture } from '@core/services/__fixtures__/base-fixture.spec';
import {
  CollectionsState,
  CollectionsStateModel,
} from '@core/store/collections/collections.state';
import { CollectionsService } from '@core/services/collections.service';
import { CollectionsServiceMock } from '@core/services/__mocks__/collections-service-mock.spec';
import { first } from 'rxjs/operators';
import { COLLECTIONS_TYPE_NAME } from '@core/store/collections/collections.actions';

describe('Assets', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([AssetsState, CollectionsState])],
      providers: [
        { provide: AssetsService, useClass: AssetsServiceMock },
        { provide: CollectionsService, useClass: CollectionsServiceMock },
      ],
    });

    store = TestBed.inject(Store);
  });

  it('should load single asset', () => {
    const assetIdFixture = uuid();
    const assetFixture = getAssetFixture(assetIdFixture);

    store.dispatch(new LoadAsset(assetIdFixture));

    const assets = store.selectSnapshot(
      (state) => state[ASSETS_TYPE_NAME].assets
    );
    expect(assets).toEqual({ [assetIdFixture]: assetFixture });
  });

  it('should load assets', () => {
    const assetListFixture = [...assetsFixture];

    store.dispatch(new LoadAssets());
    const assetsState: AssetsStateModel = store.selectSnapshot(
      (state) => state[ASSETS_TYPE_NAME]
    );

    expect(assetsState.assetsIds).toEqual(assetListFixture.map((a) => a.id));
    expect(assetsState.assets).toEqual(
      assetListFixture.reduce(
        (acc, value) => ({
          ...acc,
          [value.id]: value,
        }),
        {}
      )
    );
    expect(assetsState.meta).toEqual(getMetaFixture(assetListFixture.length));
  });

  it('should select asset ids', () => {
    const assetsIdsFixture = [uuid(), uuid(), uuid()];

    store.reset({
      [ASSETS_TYPE_NAME]: {
        assetsIds: assetsIdsFixture,
      } as Partial<AssetsStateModel>,
    });
    const assetIds = store.selectSnapshot(AssetsState.getAssetsIds);

    expect(assetIds).toEqual(assetsIdsFixture);
  });

  it('should select meta', () => {
    const metaFixture = getMetaFixture(1000);

    store.reset({
      [ASSETS_TYPE_NAME]: {
        meta: metaFixture,
      } as Partial<AssetsStateModel>,
    });
    const meta = store.selectSnapshot(AssetsState.getMeta);

    expect(meta).toEqual(metaFixture);
  });

  it('should select assets by ids', async () => {
    const assetsArrayFixture = [
      getAssetFixture(uuid()),
      getAssetFixture(uuid()),
    ];

    store.reset({
      [ASSETS_TYPE_NAME]: {
        assets: assetsArrayFixture.reduce(
          (acc, value) => ({
            ...acc,
            [value.id]: value,
          }),
          {}
        ),
      } as Partial<AssetsStateModel>,
      [COLLECTIONS_TYPE_NAME]: {
        collections: {},
      } as Partial<CollectionsStateModel>,
    });
    const assets = await store
      .select(
        AssetsState.getAssetsByIds(
          assetsArrayFixture.map((a) => a.id),
          { withCollection: false }
        )
      )
      .pipe(first())
      .toPromise();

    expect(assets).toEqual(assetsArrayFixture);
  });
});
