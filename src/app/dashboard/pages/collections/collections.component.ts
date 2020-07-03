import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { LoadCollections } from '@app/@core/store/collections/collections.actions';
import { NetworksState } from '@core/store/network/networks.state';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  skip,
  switchMap,
  tap,
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionsState } from '@app/@core/store/collections/collections.state';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { NzModalService, NzTableQueryParams } from 'ng-zorro-antd';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { CollectionCreateModalComponent } from '@app/dashboard/pages/collections/components/collection-create-modal/collection-create-modal.component';
import { CollectionViewModalComponent } from '@app/dashboard/pages/collections/components/collection-view-modal/collection-view-modal.component';
import { Logger } from '@core/services/logger.service';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);
  private params: NzTableQueryParams;

  @Select(CollectionsState.getCollectionIds) collectionIds$: Observable<
    string[]
  >;
  @Select(CollectionsState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
    row: BaseResourcesTypes.Collections;
  }>;
  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
    row: BaseResourcesTypes.Collections;
  }>;
  @ViewChild('ownerTpl', { static: true }) ownerTpl!: TemplateRef<{
    row: BaseResourcesTypes.Collections;
  }>;

  isLoading$ = new BehaviorSubject(false);
  searchTerm$ = new BehaviorSubject('');

  rows$: Observable<BaseResourcesTypes.Collections[]> = of([]);
  tableColumns: TableColumnConfig<BaseResourcesTypes.Collections>[];

  constructor(private store: Store, private nzModalService: NzModalService) {}

  ngOnInit() {
    this.tableColumns = [
      {
        propertyName: 'id',
        headerName: 'Id',
        columnTransformTpl: this.idTpl,
        sortBy: true,
      },
      {
        propertyName: 'name',
        headerName: 'Name',
        searchBy: true,
      },
      {
        propertyName: 'description',
        headerName: 'Description',
      },
      {
        propertyName: 'maximumSupply',
        headerName: 'Supply',
      },
      {
        propertyName: 'senderPublicKey',
        headerName: 'Owner',
        columnTransformTpl: this.ownerTpl,
        sortBy: true,
      },
      {
        headerName: 'Actions',
        columnTransformTpl: this.actionsTpl,
      },
    ];

    this.rows$ = this.collectionIds$.pipe(
      distinctUntilChanged(),
      switchMap((collectionsIds) =>
        this.store.select(CollectionsState.getCollectionsByIds(collectionsIds))
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.store
      .select(NetworksState.getBaseUrl)
      .pipe(
        untilDestroyed(this),
        filter((baseUrl) => !!baseUrl),
        tap(() => this.isLoading$.next(true)),
        tap(() => this.store.dispatch(new LoadCollections(this.params)))
      )
      .subscribe();

    this.searchTerm$
      .pipe(
        skip(1),
        untilDestroyed(this),
        debounceTime(750),
        tap((searchTerm) => {
          try {
            const jsonSearchTerm = JSON.parse(searchTerm);

            this.store.dispatch(
              new LoadCollections({
                ...this.params,
                filter: [
                  {
                    key: 'jsonSchema',
                    value: jsonSearchTerm,
                  },
                ],
              })
            );
          } catch (e) {
            this.log.error('Search term should be a valid JSON', e);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {}

  showJsonSchema(event: MouseEvent, row: BaseResourcesTypes.Collections) {
    event.preventDefault();

    this.nzModalService.create({
      nzTitle: `"${row.name}" json schema`,
      nzContent: CollectionViewModalComponent,
      nzComponentParams: {
        jsonSchema: row.jsonSchema,
      },
      nzFooter: null,
      nzWidth: '75vw',
    });
  }

  paginationChange(params: NzTableQueryParams) {
    if (!this.params) {
      this.params = params;
    } else {
      this.store.dispatch(new LoadCollections(params));
    }
  }

  showAddCollectionModal(event: MouseEvent) {
    event.preventDefault();

    this.nzModalService.create({
      nzTitle: 'Create new collection',
      nzContent: CollectionCreateModalComponent,
      nzWidth: '75vw',
    });
  }
}
