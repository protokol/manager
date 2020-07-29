import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
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
  skip,
  switchMap,
  tap,
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { NzTableQueryParams } from 'ng-zorro-antd';
import { Logger } from '@app/@core/services/logger.service';
import { ExchangeResourcesTypes } from '@protokol/nft-client';
import { Router } from '@angular/router';
import { AuctionsState } from '@app/dashboard/pages/auctions/state/auctions/auctions.state';
import { LoadAuctions } from '@app/dashboard/pages/auctions/state/auctions/auctions.actions';
import { StoreUtilsService } from '@core/store/store-utils.service';

@Component({
  selector: 'app-auctions',
  templateUrl: './auctions.component.html',
  styleUrls: ['./auctions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  private tableQueryParams: NzTableQueryParams;

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

  isLoading$ = new BehaviorSubject(false);
  isCanceled$ = new BehaviorSubject(false);

  rows$: Observable<ExchangeResourcesTypes.Auctions[]> = of([]);
  tableColumns: TableColumnConfig<ExchangeResourcesTypes.Auctions>[];

  constructor(
    private store: Store,
    private router: Router,
    private storeUtilsService: StoreUtilsService
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
              tableQueryParams: this.tableQueryParams,
              canceled,
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
        sortBy: true,
      },
      {
        propertyName: 'senderPublicKey',
        headerName: 'Sender',
        columnTransformTpl: this.senderTpl,
      },
      {
        headerName: 'Start Amount',
        columnTransformTpl: this.startAmountTpl,
      },
      {
        headerName: 'Expiration(Block height)',
        columnTransformTpl: this.expirationTpl,
      },
      {
        headerName: 'Assets',
        columnTransformTpl: this.assetsTpl,
      },
    ];

    this.rows$ = this.auctionsIds$.pipe(
      distinctUntilChanged(),
      switchMap((auctionsIds) =>
        this.store.select(AuctionsState.getAuctionsByIds(auctionsIds))
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.store
      .select(NetworksState.getBaseUrl)
      .pipe(
        untilDestroyed(this),
        filter((baseUrl) => !!baseUrl),
        tap(() => this.isLoading$.next(true)),
        tap(() => this.store.dispatch(new LoadAuctions()))
      )
      .subscribe();
  }

  ngOnDestroy() {}

  paginationChange(tableQueryParams: NzTableQueryParams) {
    this.tableQueryParams = tableQueryParams;
    this.store.dispatch(new LoadAuctions({ tableQueryParams }));
  }

  onAssetClick(nftId: string) {
    this.router.navigate(['/dashboard/assets', nftId]);
  }

  onWalletDetailsClick(addressOrPublicKey: string, assetId: string) {
    this.router.navigate(['/dashboard/wallets', addressOrPublicKey], {
      queryParams: {
        assetId,
      },
    });
  }
}
