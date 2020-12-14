import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import {
  distinctUntilChanged,
  filter,
  skip,
  switchMap, takeUntil,
  tap
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig
} from '@app/@shared/interfaces/table.types';
import { Logger } from '@app/@core/services/logger.service';
import { ExchangeResourcesTypes } from '@protokol/client';
import { Router } from '@angular/router';
import { AuctionsState } from '@app/dashboard/pages/auctions/state/auctions/auctions.state';
import { LoadAuctions } from '@app/dashboard/pages/auctions/state/auctions/auctions.actions';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { TableUtils } from '@shared/utils/table-utils';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RefreshModalResponse } from '@core/interfaces/refresh-modal.response';
import { AuctionModalComponent } from '@app/dashboard/pages/auctions/components/auction-modal/auction-modal.component';
import { ModalUtils } from '@core/utils/modal-utils';
import { LoadBurns } from '@app/dashboard/pages/burns/state/burns/burns.actions';

@Component({
  selector: 'app-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuctionsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  private params: NzTableQueryParams = TableUtils.getDefaultNzTableQueryParams();

  @HostBinding('class.canceled') canceledClass = false;

  @Select(AuctionsState.getAuctionsIds) auctionsIds$: Observable<string[]>;
  @Select(AuctionsState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;
  @ViewChild('senderTpl', { static: true }) senderTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;
  @ViewChild('startAmountTpl', { static: true }) startAmountTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;
  @ViewChild('expirationTpl', { static: true }) expirationTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;
  @ViewChild('assetsTpl', { static: true }) assetsTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;
  @ViewChild('timestampTpl', { static: true }) timestampTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;

  isLoading$ = new BehaviorSubject(false);
  isCanceled$ = new BehaviorSubject(false);

  getBaseUrl$: Observable<string>;
  rows$: Observable<ExchangeResourcesTypes.Auctions[]> = of([]);
  tableColumns: TableColumnConfig<ExchangeResourcesTypes.Auctions>[];

  constructor(
    private store: Store,
    private router: Router,
    private storeUtilsService: StoreUtilsService,
    private nzModalService: NzModalService,
    private actions$: Actions
  ) {
    this.storeUtilsService
      .nftConfigurationGuard()
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  ngOnInit() {
    this.isCanceled$
      .pipe(
        untilDestroyed(this),
        skip(1),
        tap((canceled) => (this.canceledClass = canceled)),
        tap((canceled) => {
          this.store.dispatch(
            new LoadAuctions({
              tableQueryParams: this.params,
              canceled
            })
          );
        })
      )
      .subscribe();

    this.tableColumns = [
      {
        propertyName: 'id',
        headerName: 'Id',
        columnTransformTpl: this.idTpl,
        sortBy: true
      },
      {
        propertyName: 'senderPublicKey',
        headerName: 'Sender',
        columnTransformTpl: this.senderTpl
      },
      {
        headerName: 'Start Amount',
        columnTransformTpl: this.startAmountTpl
      },
      {
        headerName: 'Expiration(Block height)',
        columnTransformTpl: this.expirationTpl
      },
      {
        headerName: 'Assets',
        columnTransformTpl: this.assetsTpl
      },
      {
        propertyName: 'timestamp',
        headerName: 'Timestamp',
        columnTransformTpl: this.timestampTpl,
        sortBy: true
      }
    ];

    this.rows$ = this.auctionsIds$.pipe(
      distinctUntilChanged(),
      switchMap((auctionsIds) =>
        this.store.select(AuctionsState.getAuctionsByIds(auctionsIds))
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.getBaseUrl$ = this.store.select(NetworksState.getBaseUrl).pipe(
      filter((baseUrl) => !!baseUrl),
      tap(() => this.isLoading$.next(true)),
      tap(() => this.store.dispatch(new LoadAuctions()))
    );
  }

  ngOnDestroy() {
  }

  paginationChange(params: NzTableQueryParams) {
    this.params = params;
    this.store.dispatch(new LoadAuctions({ tableQueryParams: params }));
  }

  onAssetClick(nftId: string) {
    this.router.navigate(['/dashboard/assets', nftId]);
  }

  onWalletDetailsClick(addressOrPublicKey: string, assetId: string) {
    this.router.navigate(['/dashboard/wallets', addressOrPublicKey], {
      queryParams: {
        assetId
      }
    });
  }

  showAuctionModal(event: MouseEvent) {
    event.preventDefault();

    const auctionModalRef = this.nzModalService.create<AuctionModalComponent,
      RefreshModalResponse>({
      nzContent: AuctionModalComponent,
      ...ModalUtils.getCreateModalDefaultConfig()
    });

    auctionModalRef.afterClose
      .pipe(
        takeUntil(this.actions$.pipe(ofActionDispatched(LoadAuctions))),
        tap((response) => {
          const refresh = (response && response.refresh) || false;
          if (refresh) {
            this.store.dispatch(
              new LoadBurns({
                ...this.params
              })
            );
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
