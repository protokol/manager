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
import { BaseResourcesTypes } from '@protokol/nft-client';
import { Router } from '@angular/router';
import { BurnsState } from '@app/dashboard/pages/burns/state/burns/burns.state';
import { LoadBurns } from '@app/dashboard/pages/burns/state/burns/burns.actions';

@Component({
  selector: 'app-burns',
  templateUrl: './burns.component.html',
  styleUrls: ['./burns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BurnsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  private params: NzTableQueryParams;

  @Select(BurnsState.getBurnsIds) burnIds$: Observable<string[]>;
  @Select(BurnsState.getMeta) meta$: Observable<PaginationMeta>;

  @ViewChild('idTpl', { static: true }) idTpl!: TemplateRef<{
    row: BaseResourcesTypes.Burns;
  }>;
  @ViewChild('senderTpl', { static: true }) senderTpl!: TemplateRef<{
    row: BaseResourcesTypes.Burns;
  }>;
  @ViewChild('assetsTpl', { static: true }) assetsTpl!: TemplateRef<{
    row: BaseResourcesTypes.Burns;
  }>;

  isLoading$ = new BehaviorSubject(false);

  rows$: Observable<BaseResourcesTypes.Burns[]> = of([]);
  tableColumns: TableColumnConfig<BaseResourcesTypes.Burns>[];

  constructor(private store: Store, private router: Router) {}

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
        headerName: 'Assets',
        columnTransformTpl: this.assetsTpl,
      },
    ];

    this.rows$ = this.burnIds$.pipe(
      distinctUntilChanged(),
      switchMap((burnIds) =>
        this.store.select(BurnsState.getBurnsByIds(burnIds))
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.store
      .select(NetworksState.getBaseUrl)
      .pipe(
        untilDestroyed(this),
        filter((baseUrl) => !!baseUrl),
        tap(() => this.isLoading$.next(true)),
        tap(() => this.store.dispatch(new LoadBurns(this.params)))
      )
      .subscribe();
  }

  ngOnDestroy() {}

  paginationChange(params: NzTableQueryParams) {
    if (!this.params) {
      this.params = params;
    } else {
      this.store.dispatch(new LoadBurns(params));
    }
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
