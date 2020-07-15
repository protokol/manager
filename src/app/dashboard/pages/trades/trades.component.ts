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
import { distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { NzTableQueryParams } from 'ng-zorro-antd';
import { Logger } from '@app/@core/services/logger.service';
import { ExchangeResourcesTypes } from '@protokol/nft-client';
import { TradesState } from '@app/dashboard/pages/trades/state/trades/trades.state';
import { LoadTrades } from '@app/dashboard/pages/trades/state/trades/trades.actions';

@Component({
  selector: 'app-trades',
  templateUrl: './trades.component.html',
  styleUrls: ['./trades.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradesComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Select(TradesState.getTradesIds) tradesIds$: Observable<string[]>;
  @Select(TradesState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Trades;
  }>;
  @ViewChild('auctionIdTpl', { static: true }) auctionIdTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Trades;
  }>;
  @ViewChild('bidIdTpl', { static: true }) bidIdTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Trades;
  }>;
  @ViewChild('senderTpl', { static: true }) senderTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Trades;
  }>;

  isLoading$ = new BehaviorSubject(false);

  rows$: Observable<ExchangeResourcesTypes.Trades[]> = of([]);
  tableColumns: TableColumnConfig[];

  constructor(private store: Store) {}

  ngOnInit() {
    this.tableColumns = [
      {
        propertyName: 'id',
        headerName: 'Id',
        columnTransformTpl: this.idTpl,
      },
      {
        propertyName: 'auctionId',
        headerName: 'Auction id',
        columnTransformTpl: this.auctionIdTpl,
        searchBy: true,
      },
      {
        propertyName: 'bidId',
        headerName: 'Bid id',
        columnTransformTpl: this.bidIdTpl,
        searchBy: true,
      },
      {
        propertyName: 'senderPublicKey',
        headerName: 'Sender',
        columnTransformTpl: this.senderTpl,
        searchBy: true,
      },
    ];

    this.rows$ = this.tradesIds$.pipe(
      distinctUntilChanged(),
      switchMap((bidsIds) =>
        this.store.select(TradesState.getTradesByIds(bidsIds))
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.store
      .select(NetworksState.getBaseUrl)
      .pipe(
        untilDestroyed(this),
        filter((baseUrl) => !!baseUrl),
        tap(() => this.isLoading$.next(true)),
        tap(() => this.store.dispatch(new LoadTrades()))
      )
      .subscribe();
  }

  paginationChange(tableQueryParams: NzTableQueryParams) {
    this.store.dispatch(new LoadTrades(tableQueryParams));
  }

  ngOnDestroy() {}
}
