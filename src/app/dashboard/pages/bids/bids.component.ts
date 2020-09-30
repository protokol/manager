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
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { Logger } from '@app/@core/services/logger.service';
import { ExchangeResourcesTypes } from '@protokol/client';
import { BidsState } from './state/bids/bids.state';
import { LoadBids } from './state/bids/bids.actions';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { NzTableQueryParams } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-bids',
  templateUrl: './bids.component.html',
  styleUrls: ['./bids.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BidsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  private tableQueryParams: NzTableQueryParams;

  @Select(BidsState.getBidsIds) bidsIds$: Observable<string[]>;
  @Select(BidsState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Bids;
  }>;
  @ViewChild('auctionIdTpl', { static: true }) auctionIdTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Bids;
  }>;
  @ViewChild('bidAmountTpl', { static: true }) bidAmountTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Bids;
  }>;
  @ViewChild('senderTpl', { static: true }) senderTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Bids;
  }>;
  @ViewChild('timestampTpl', { static: true }) timestampTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Bids;
  }>;

  isLoading$ = new BehaviorSubject(false);
  isCanceled$ = new BehaviorSubject<boolean>(false);

  load$;
  rows$: Observable<ExchangeResourcesTypes.Bids[]> = of([]);
  tableColumns: TableColumnConfig[];

  constructor(
    private store: Store,
    private storeUtilsService: StoreUtilsService
  ) {
    this.storeUtilsService
      .nftConfigurationGuard()
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  ngOnInit() {
    this.load$ = combineLatest([
      this.isCanceled$,
      this.store.select(NetworksState.getBaseUrl),
    ]).pipe(
      tap(() => this.isLoading$.next(true)),
      tap(([canceled]) => {
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
            searchBy: !canceled,
          },
          {
            propertyName: 'bidAmount',
            headerName: 'Bid Amount',
            columnTransformTpl: this.bidAmountTpl,
            searchBy: !canceled,
          },
          {
            propertyName: 'senderPublicKey',
            headerName: 'Sender',
            columnTransformTpl: this.senderTpl,
            searchBy: true,
          },
          {
            propertyName: 'timestamp',
            headerName: 'Timestamp',
            columnTransformTpl: this.timestampTpl,
            sortBy: true,
          },
        ];

        this.store.dispatch(
          new LoadBids({
            tableQueryParams: this.tableQueryParams,
            canceled,
          })
        );
      })
    );

    this.rows$ = this.bidsIds$.pipe(
      distinctUntilChanged(),
      switchMap((bidsIds) =>
        this.store.select(BidsState.getBidsByIds(bidsIds))
      ),
      tap(() => this.isLoading$.next(false))
    );
  }

  ngOnDestroy() {}

  paginationChange(tableQueryParams: NzTableQueryParams) {
    this.tableQueryParams = tableQueryParams;
    this.store.dispatch(new LoadBids({ tableQueryParams }));
  }
}
