import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExchangeResourcesTypes } from '@protokol/client';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@shared/interfaces/table.types';
import { NzTableQueryParams } from 'ng-zorro-antd';
import { tap } from 'rxjs/operators';
import { BidsService } from '@core/services/bids.service';
import { untilDestroyed } from '@core/until-destroyed';
import { Router } from '@angular/router';
import { TableUtils } from '@shared/utils/table-utils';

@Component({
  selector: 'app-auction-bids-table',
  templateUrl: './auction-bids-table.component.html',
  styleUrls: ['./auction-bids-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuctionBidsTableComponent implements OnInit, OnDestroy {
  private auctionId: string;

  isLoading$ = new BehaviorSubject(true);
  rows$ = new BehaviorSubject<ExchangeResourcesTypes.Bids[]>([]);
  meta$ = new BehaviorSubject<PaginationMeta | null>(null);

  @Input('auctionId')
  set _auctionId(auctionId: string) {
    this.auctionId = auctionId;
    this.getBidsByAuctionId();
  }
  @Input() assetId;

  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;
  @ViewChild('bidAmountTpl', { static: true }) bidAmountTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;
  @ViewChild('senderPublicKeyTpl', { static: true })
  senderPublicKeyTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;
  @ViewChild('timestampTpl', { static: true }) timestampTpl!: TemplateRef<{
    row: ExchangeResourcesTypes.Auctions;
  }>;

  tableColumns: TableColumnConfig<ExchangeResourcesTypes.Auctions>[];

  constructor(private bidsService: BidsService, private router: Router) {}

  ngOnInit(): void {
    this.tableColumns = [
      {
        propertyName: 'id',
        headerName: 'Id',
        columnTransformTpl: this.idTpl,
        sortBy: true,
      },
      {
        headerName: 'Bid amount',
        columnTransformTpl: this.bidAmountTpl,
      },
      {
        headerName: 'Sender',
        columnTransformTpl: this.senderPublicKeyTpl,
      },
      {
        propertyName: 'timestamp',
        headerName: 'Timestamp',
        columnTransformTpl: this.timestampTpl,
        sortBy: true,
      },
    ];
  }

  onPaginationChange(query: NzTableQueryParams) {
    this.getBidsByAuctionId(query);
  }

  getBidsByAuctionId(query: NzTableQueryParams | {} = {}) {
    this.isLoading$.next(true);

    return this.bidsService
      .searchBids({
        limit: TableUtils.getDefaultPageSize(),
        ...query,
        filters: { auctionId: this.auctionId },
      })
      .pipe(
        untilDestroyed(this),
        tap(({ data, meta }) => {
          this.rows$.next(data);
          this.meta$.next(meta);
          this.isLoading$.next(false);
        })
      )
      .subscribe();
  }

  onWalletDetailsClick(addressOrPublicKey: string) {
    this.router.navigate(['/dashboard/wallets', addressOrPublicKey], {
      queryParams: {
        assetId: this.assetId,
      },
    });
  }

  ngOnDestroy(): void {}
}
