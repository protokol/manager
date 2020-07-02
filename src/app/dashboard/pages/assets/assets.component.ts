import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import {
  distinctUntilChanged,
  filter,
  first,
  switchMap,
  tap,
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { NzModalService, NzTableQueryParams } from 'ng-zorro-antd';
import { AssetsState } from '@app/dashboard/pages/assets/state/assets/assets.state';
import {
  LoadAsset,
  LoadAssets,
} from '@app/dashboard/pages/assets/state/assets/assets.actions';
import { Logger } from '@app/@core/services/logger.service';
import { AssetWithCollection } from '@app/dashboard/pages/assets/interfaces/asset.types';
import { AssetViewModalComponent } from '@app/dashboard/pages/assets/components/asset-view-modal/asset-view-modal.component';
import { TextUtils } from '@core/utils/text-utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-assets',
  templateUrl: './assets.component.html',
  styleUrls: ['./assets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  private params: NzTableQueryParams;

  @Select(AssetsState.getAssetsIds) assetIds$: Observable<string[]>;
  @Select(AssetsState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;
  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;
  @ViewChild('collectionIdTpl', { static: true })
  collectionIdTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;
  @ViewChild('ownerTpl', { static: true }) ownerTpl!: TemplateRef<{
    row: AssetWithCollection;
  }>;

  isLoading$ = new BehaviorSubject(false);

  rows$: Observable<AssetWithCollection[]> = of([]);
  tableColumns: TableColumnConfig<AssetWithCollection>[];

  constructor(
    private store: Store,
    private nzModalService: NzModalService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.tableColumns = [
      {
        propertyName: 'id',
        headerName: 'Id',
        columnTransformTpl: this.idTpl,
        sortBy: true,
      },
      {
        propertyName: 'collectionId',
        headerName: 'Collection',
        columnTransformTpl: this.collectionIdTpl,
      },
      {
        propertyName: 'ownerPublicKey',
        headerName: 'Owner',
        columnTransformTpl: this.ownerTpl,
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

    this.store
      .select(NetworksState.getBaseUrl)
      .pipe(
        untilDestroyed(this),
        filter((baseUrl) => !!baseUrl),
        tap(() => this.isLoading$.next(true)),
        tap(() =>
          this.store.dispatch(
            new LoadAssets(this.params, { withCollection: true })
          )
        )
      )
      .subscribe();

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
    this.nzModalService.create({
      nzTitle: `"${TextUtils.clip(assetWithCollection.id)}" preview`,
      nzContent: AssetViewModalComponent,
      nzComponentParams: {
        jsonSchema: { ...assetWithCollection.collection.jsonSchema },
        formValues: { ...assetWithCollection.attributes },
      },
      nzFooter: null,
      nzWidth: '75vw',
    });
  }

  paginationChange(params: NzTableQueryParams) {
    if (!this.params) {
      this.params = params;
    } else {
      this.store.dispatch(new LoadAssets(params));
    }
  }
}
