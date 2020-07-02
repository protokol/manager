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
import { TransfersState } from '@app/dashboard/pages/transfers/state/transfers/transfers.state';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { LoadTransfers } from '@app/dashboard/pages/transfers/state/transfers/transfers.actions';

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrls: ['./transfers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransfersComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  private params: NzTableQueryParams;

  @Select(TransfersState.getTransfersIds) transferIds$: Observable<string[]>;
  @Select(TransfersState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
    row: BaseResourcesTypes.Transfers;
  }>;
  @ViewChild('senderTpl', { static: true }) senderTpl!: TemplateRef<{
    row: BaseResourcesTypes.Transfers;
  }>;
  @ViewChild('receiverTpl', { static: true }) receiverTpl!: TemplateRef<{
    row: BaseResourcesTypes.Transfers;
  }>;
  @ViewChild('assetsTpl', { static: true }) assetsTpl!: TemplateRef<{
    row: BaseResourcesTypes.Transfers;
  }>;

  isLoading$ = new BehaviorSubject(false);

  rows$: Observable<BaseResourcesTypes.Transfers[]> = of([]);
  tableColumns: TableColumnConfig<BaseResourcesTypes.Transfers>[];

  constructor(private store: Store) {}

  ngOnInit() {
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
        headerName: 'Receiver',
        columnTransformTpl: this.receiverTpl,
      },
      {
        headerName: 'Assets',
        columnTransformTpl: this.assetsTpl,
      },
    ];

    this.rows$ = this.transferIds$.pipe(
      distinctUntilChanged(),
      switchMap((transferIds) =>
        this.store.select(TransfersState.getTransfersByIds(transferIds))
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.store
      .select(NetworksState.getBaseUrl)
      .pipe(
        untilDestroyed(this),
        filter((baseUrl) => !!baseUrl),
        tap(() => this.isLoading$.next(true)),
        tap(() => this.store.dispatch(new LoadTransfers(this.params)))
      )
      .subscribe();
  }

  ngOnDestroy() {}

  paginationChange(params: NzTableQueryParams) {
    if (!this.params) {
      this.params = params;
    } else {
      this.store.dispatch(new LoadTransfers(params));
    }
  }
}
