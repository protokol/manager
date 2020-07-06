import { TestBed } from '@angular/core/testing';
import { Store, NgxsModule } from '@ngxs/store';
import {
  CollectionsState,
  CollectionsStateModel,
} from '@core/store/collections/collections.state';
import { CollectionsService } from '@core/services/collections.service';
import {
  COLLECTIONS_TYPE_NAME,
  LoadCollection,
  LoadCollections,
} from '@core/store/collections/collections.actions';
import { v4 as uuid } from 'uuid';
import { CollectionsServiceMock } from '@core/services/__mocks__/collections-service-mock.spec';
import {
  collectionsFixture,
  getCollectionFixture,
  getMetaFixture,
} from '@app/@core/services/__fixtures__/collections-fixture.spec';

describe('Collections', () => {
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([CollectionsState])],
      providers: [
        { provide: CollectionsService, useClass: CollectionsServiceMock },
      ],
    });

    store = TestBed.inject(Store);
  });

  it('should load single collection', () => {
    const collectionIdFixture = uuid();
    const collectionFixture = getCollectionFixture(collectionIdFixture);

    store.dispatch(new LoadCollection(collectionIdFixture));

    const collections = store.selectSnapshot(
      (state) => state[COLLECTIONS_TYPE_NAME].collections
    );
    expect(collections).toEqual({ [collectionIdFixture]: collectionFixture });
  });

  it('should load collections', () => {
    const collectionListFixture = [...collectionsFixture];

    store.dispatch(new LoadCollections());
    const collectionState: CollectionsStateModel = store.selectSnapshot(
      (state) => state[COLLECTIONS_TYPE_NAME]
    );

    expect(collectionState.collectionsIds).toEqual(
      collectionListFixture.map((c) => c.id)
    );
    expect(collectionState.collections).toEqual(
      collectionListFixture.reduce(
        (acc, value) => ({
          ...acc,
          [value.id]: value,
        }),
        {}
      )
    );
    expect(collectionState.meta).toEqual(
      getMetaFixture(collectionListFixture.length)
    );
  });

  it('should select collection ids', () => {
    const collectionsIdsFixture = [uuid(), uuid(), uuid()];

    store.reset({
      [COLLECTIONS_TYPE_NAME]: {
        collectionsIds: collectionsIdsFixture,
      } as Partial<CollectionsStateModel>,
    });
    const collectionIds = store.selectSnapshot(
      CollectionsState.getCollectionIds
    );

    expect(collectionIds).toEqual(collectionsIdsFixture);
  });

  it('should select meta', () => {
    const metaFixture = getMetaFixture(1000);

    store.reset({
      [COLLECTIONS_TYPE_NAME]: {
        meta: metaFixture,
      } as Partial<CollectionsStateModel>,
    });
    const meta = store.selectSnapshot(CollectionsState.getMeta);

    expect(meta).toEqual(metaFixture);
  });

  it('should select meta', () => {
    const collectionsArrayFixture = [
      getCollectionFixture(uuid()),
      getCollectionFixture(uuid()),
    ];

    store.reset({
      [COLLECTIONS_TYPE_NAME]: {
        collections: collectionsArrayFixture.reduce(
          (acc, value) => ({
            ...acc,
            [value.id]: value,
          }),
          {}
        ),
      } as Partial<CollectionsStateModel>,
    });
    const collections = store.selectSnapshot(
      CollectionsState.getCollectionsByIds(
        collectionsArrayFixture.map((c) => c.id)
      )
    );

    expect(collections).toEqual(collectionsArrayFixture);
  });
});
