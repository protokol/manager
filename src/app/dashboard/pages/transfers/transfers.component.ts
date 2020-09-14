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
import { NzModalService, NzTableQueryParams } from 'ng-zorro-antd';
import { Logger } from '@app/@core/services/logger.service';
import { TransfersState } from '@app/dashboard/pages/transfers/state/transfers/transfers.state';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { LoadTransfers } from '@app/dashboard/pages/transfers/state/transfers/transfers.actions';
import { Router } from '@angular/router';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { TransferModalComponent } from '@app/dashboard/pages/transfers/components/transfer-modal/transfer-modal.component';
import { ModalUtils } from '@core/utils/modal-utils';

@Component({
  selector: 'app-transfers',
  templateUrl: './transfers.component.html',
  styleUrls: ['./transfers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransfersComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

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
  @ViewChild('timestampTpl', { static: true }) timestampTpl!: TemplateRef<{
    row: BaseResourcesTypes.Transfers;
  }>;

  isLoading$ = new BehaviorSubject(false);

  getBaseUrl$: Observable<string>;
  rows$: Observable<BaseResourcesTypes.Transfers[]> = of([]);
  tableColumns: TableColumnConfig<BaseResourcesTypes.Transfers>[];

  constructor(
    private store: Store,
    private router: Router,
    private storeUtilsService: StoreUtilsService,
    private nzModalService: NzModalService
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
      {
        propertyName: 'timestamp',
        headerName: 'Timestamp',
        columnTransformTpl: this.timestampTpl,
        sortBy: true,
      },
    ];

    this.rows$ = this.transferIds$.pipe(
      distinctUntilChanged(),
      switchMap((transferIds) =>
        this.store.select(TransfersState.getTransfersByIds(transferIds))
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.getBaseUrl$ = this.store.select(NetworksState.getBaseUrl).pipe(
      filter((baseUrl) => !!baseUrl),
      tap(() => this.isLoading$.next(true)),
      tap(() => this.store.dispatch(new LoadTransfers()))
    );
  }

  ngOnDestroy() {}

  paginationChange(params: NzTableQueryParams) {
    this.store.dispatch(new LoadTransfers(params));
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

  showTransferModal(event: MouseEvent) {
    event.preventDefault();

    this.nzModalService.create({
      nzContent: TransferModalComponent,
      ...ModalUtils.getCreateModalDefaultConfig()
    });
  }
}
