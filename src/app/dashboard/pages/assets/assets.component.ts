import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import {
  delay,
  distinctUntilChanged,
  filter,
  first,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { AssetsState } from '@app/@core/store/assets/assets.state';
import { LoadAsset, LoadAssets } from '@app/@core/store/assets/assets.actions';
import { Logger } from '@app/@core/services/logger.service';
import { AssetWithCollection } from '@app/dashboard/pages/assets/interfaces/asset.types';
import { AssetViewModalComponent } from '@app/dashboard/pages/assets/components/asset-view-modal/asset-view-modal.component';
import { TextUtils } from '@core/utils/text-utils';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { AssetCreateModalComponent } from '@shared/components/asset-create-modal/asset-create-modal.component';
import { CreateModalResponse } from '@core/interfaces/create-modal.response';
import { TableUtils } from '@shared/utils/table-utils';
import { ModalUtils } from '@core/utils/modal-utils';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  private params: NzTableQueryParams = TableUtils.getDefaultNzTableQueryParams();

  @Select(AssetsState.getAssetsIds) assetIds$: Observable<string[]>;
  @Select(AssetsState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;
  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;
  @ViewChild('collectionNameTpl', { static: true })
  collectionNameTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;
  @ViewChild('ownerTpl', { static: true }) ownerTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;
  @ViewChild('senderTpl', { static: true }) senderTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;
  @ViewChild('timestampTpl', { static: true }) timestampTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;
  @ViewChild('createAssetModalTitleTpl', { static: true })
  createAssetModalTitleTpl!: TemplateRef<{}>;
  @ViewChild('assetAttributesModalTitleTpl', { static: true })
  assetAttributesModalTitleTpl!: TemplateRef<{}>;

  isLoading$ = new BehaviorSubject(true);

  rows$: Observable<AssetWithCollection[]> = of([]);
  tableColumns: TableColumnConfig<AssetWithCollection>[];
  getBaseUrl$: Observable<string>;
  assetDetailId$ = new BehaviorSubject('');

  constructor(
    private store: Store,
    private nzModalService: NzModalService,
    private route: ActivatedRoute,
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
        headerName: 'Collection',
        columnTransformTpl: this.collectionNameTpl,
      },
      {
        propertyName: 'ownerPublicKey',
        headerName: 'Owner',
        columnTransformTpl: this.ownerTpl,
      },
      {
        propertyName: 'senderPublicKey',
        headerName: 'Sender',
        columnTransformTpl: this.ownerTpl,
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

    this.rows$ = this.assetIds$.pipe(
      distinctUntilChanged(),
      switchMap((assetIds) =>
        this.store
          .select(
            AssetsState.getAssetsByIds(assetIds, { withCollection: true })
          )
          .pipe(
            filter((assets) => {
              if (!assets.length) {
                return true;
              }
              return assets.every((a) => a && a.collection !== null);
            })
          )
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.getBaseUrl$ = this.store.select(NetworksState.getBaseUrl).pipe(
      filter((baseUrl) => !!baseUrl),
      tap(() => this.isLoading$.next(true)),
      tap(() =>
        this.store.dispatch(new LoadAssets(undefined, { withCollection: true }))
      )
    );

    const assetId: string = this.route.snapshot.paramMap.get('id');
    if (assetId) {
      this.store
        .select(AssetsState.getAssetsByIds([assetId], { withCollection: true }))
        .pipe(
          untilDestroyed(this),
          first(([a]) => a && a.collection !== null),
          tap(([a]) => {
            this.showAssetDetail(a);
          })
        )
        .subscribe();

      this.store.dispatch(new LoadAsset(assetId, { withCollection: true }));
    }
  }

  ngOnDestroy() {}

  showAttributes(event: MouseEvent, row: AssetWithCollection) {
    event.preventDefault();

    this.showAssetDetail(row);
  }

  showAssetDetail(assetWithCollection: AssetWithCollection) {
    this.assetDetailId$.next(TextUtils.clip(assetWithCollection.id));

    this.nzModalService.create({
      nzTitle: this.assetAttributesModalTitleTpl,
      nzContent: AssetViewModalComponent,
      nzComponentParams: {
        jsonSchema: { ...assetWithCollection.collection.jsonSchema },
        formValues: { ...assetWithCollection.attributes },
      },
      nzWidth: '75vw',
      nzFooter: null,
    });
  }

  paginationChange(params: NzTableQueryParams) {
    this.params = params;
    this.store.dispatch(new LoadAssets(params, { withCollection: true }));
  }

  onWalletDetailsClick(addressOrPublicKey: string, assetId: string) {
    this.router.navigate(['/dashboard/wallets', addressOrPublicKey], {
      queryParams: {
        assetId,
      },
    });
  }

  showCreateAssetModal(event: MouseEvent) {
    event.preventDefault();

    const createAssetModalRef = this.nzModalService.create<
      AssetCreateModalComponent,
      CreateModalResponse
    >({
      nzTitle: this.createAssetModalTitleTpl,
      nzContent: AssetCreateModalComponent,
      nzWidth: '75vw',
      ...ModalUtils.getCreateModalDefaultConfig(),
    });

    createAssetModalRef.afterClose
      .pipe(
        takeUntil(this.actions$.pipe(ofActionDispatched(LoadAssets))),
        delay(8000),
        tap((response) => {
          const refresh = (response && response.refresh) || false;
          if (refresh) {
            this.store.dispatch(
              new LoadAssets({
                ...this.params,
              })
            );
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
