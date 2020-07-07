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
import { WalletsState } from '@app/dashboard/pages/wallets/state/wallets/wallets.state';
import { Wallet } from '@arkecosystem/client/dist/resourcesTypes/wallets';
import { LoadWallets } from '@app/dashboard/pages/wallets/state/wallets/wallets.actions';

@Component({
  selector: 'app-wallets',
  templateUrl: './wallets.component.html',
  styleUrls: ['./wallets.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  private params: NzTableQueryParams;

  @Select(WalletsState.getWalletsIds) walletIds$: Observable<string[]>;
  @Select(WalletsState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('addressTpl', { static: true }) addressTpl!: TemplateRef<{
    row: Wallet;
  }>;
  @ViewChild('publicKeyTpl', { static: true }) publicKeyTpl!: TemplateRef<{
    row: Wallet;
  }>;

  isLoading$ = new BehaviorSubject(false);

  rows$: Observable<Wallet[]> = of([]);
  tableColumns: TableColumnConfig<Wallet>[];

  constructor(private store: Store) {}

  ngOnInit() {
    this.tableColumns = [
      {
        propertyName: 'address',
        headerName: 'Address',
        columnTransformTpl: this.addressTpl,
        sortBy: true,
      },
      {
        propertyName: 'balance',
        headerName: 'Balance',
        sortBy: true,
      },
      {
        propertyName: 'nonce',
        headerName: 'Nonce',
        sortBy: true,
      },
      {
        propertyName: 'publicKey',
        headerName: 'Public Key',
        columnTransformTpl: this.publicKeyTpl,
        sortBy: true,
      },
    ];

    this.rows$ = this.walletIds$.pipe(
      distinctUntilChanged(),
      switchMap((walletIds) =>
        this.store.select(WalletsState.getWalletsByIds(walletIds))
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.store
      .select(NetworksState.getBaseUrl)
      .pipe(
        untilDestroyed(this),
        filter((baseUrl) => !!baseUrl),
        tap(() => this.isLoading$.next(true)),
        tap(() => this.store.dispatch(new LoadWallets(this.params)))
      )
      .subscribe();
  }

  ngOnDestroy() {}

  paginationChange(params: NzTableQueryParams) {
    if (!this.params) {
      this.params = params;
    } else {
      this.store.dispatch(new LoadWallets(params));
    }
  }
}
