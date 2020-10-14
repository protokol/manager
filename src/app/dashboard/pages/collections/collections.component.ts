import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { LoadCollections } from '@app/@core/store/collections/collections.actions';
import { NetworksState } from '@core/store/network/networks.state';
import {
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  skip,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CollectionsState } from '@app/@core/store/collections/collections.state';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { BaseResourcesTypes } from '@protokol/client';
import { CollectionCreateModalComponent } from '@app/dashboard/pages/collections/components/collection-create-modal/collection-create-modal.component';
import { CollectionViewModalComponent } from '@app/dashboard/pages/collections/components/collection-view-modal/collection-view-modal.component';
import { Logger } from '@core/services/logger.service';
import { Router } from '@angular/router';
import { TableUtils } from '@shared/utils/table-utils';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { RefreshModalResponse } from '@core/interfaces/refresh-modal.response';
import { ModalUtils } from '@core/utils/modal-utils';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-collections',
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);
  private params: NzTableQueryParams = TableUtils.getDefaultNzTableQueryParams();

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
  @ViewChild('timestampTpl', { static: true }) timestampTpl!: TemplateRef<{
    row: BaseResourcesTypes.Collections;
  }>;
  @ViewChild('allowedIssuersTpl', { static: true }) allowedIssuersTpl!: TemplateRef<{
    row: BaseResourcesTypes.Collections;
  }>;

  isLoading$ = new BehaviorSubject(false);
  searchTerm$ = new BehaviorSubject('');

  getBaseUrl$: Observable<string>;
  rows$: Observable<BaseResourcesTypes.Collections[]> = of([]);
  tableColumns: TableColumnConfig<BaseResourcesTypes.Collections>[];

  constructor(
    private store: Store,
    private nzModalService: NzModalService,
    private router: Router,
    private storeUtilsService: StoreUtilsService,
    private actions$: Actions
  ) {
    this.storeUtilsService
      .nftConfigurationGuard()
      .pipe(untilDestroyed(this))
      .subscribe();
  }

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
        headerName: 'Allowed issuers',
        columnTransformTpl: this.allowedIssuersTpl,
      },
      {
        propertyName: 'timestamp',
        headerName: 'Timestamp',
        columnTransformTpl: this.timestampTpl,
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

    this.getBaseUrl$ = this.store.select(NetworksState.getBaseUrl).pipe(
      filter((baseUrl) => !!baseUrl),
      tap(() => this.isLoading$.next(true)),
      tap(() => this.store.dispatch(new LoadCollections()))
    );

    this.searchTerm$
      .pipe(
        skip(1),
        untilDestroyed(this),
        debounceTime(750),
        tap((searchTerm) => {
          if (searchTerm) {
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
                    ...(this.params.filter ? this.params.filter : []),
                  ],
                })
              );
            } catch (e) {
              this.log.error('Search term should be a valid JSON', e);
            }
          } else {
            this.store.dispatch(
              new LoadCollections({
                ...this.params,
              })
            );
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy() {}

  showJsonSchema(event: MouseEvent, row: BaseResourcesTypes.Collections) {
    event.preventDefault();

    this.nzModalService.create({
      nzContent: CollectionViewModalComponent,
      nzComponentParams: {
        schemaName: row.name,
        jsonSchema: row.jsonSchema,
      },
      nzFooter: null,
    });
  }

  paginationChange(params: NzTableQueryParams) {
    this.params = params;
    this.store.dispatch(new LoadCollections(params));
  }

  showAddCollectionModal(event: MouseEvent) {
    event.preventDefault();

    const createCollectionModalRef = this.nzModalService.create<
      CollectionCreateModalComponent,
      RefreshModalResponse
    >({
      nzContent: CollectionCreateModalComponent,
      ...ModalUtils.getCreateModalDefaultConfig(),
    });

    createCollectionModalRef.afterClose
      .pipe(
        takeUntil(this.actions$.pipe(ofActionDispatched(LoadCollections))),
        delay(8000),
        tap((response) => {
          const refresh = (response && response.refresh) || false;
          if (refresh) {
            this.store.dispatch(
              new LoadCollections({
                ...this.params,
              })
            );
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  onWalletDetailsClick(addressOrPublicKey: string, collectionId: string) {
    this.router.navigate(['/dashboard/wallets', addressOrPublicKey], {
      queryParams: {
        collectionId,
      },
    });
  }
}
