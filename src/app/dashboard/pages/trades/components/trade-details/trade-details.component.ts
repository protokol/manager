import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { LoadTrade } from '@app/dashboard/pages/trades/state/trades/trades.actions';
import { Observable } from 'rxjs';
import { ExchangeResourcesTypes } from '@protokol/nft-client';
import { TradesState } from '@app/dashboard/pages/trades/state/trades/trades.state';
import { untilDestroyed } from '@core/until-destroyed';
import { filter, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-trade-details',
  templateUrl: './trade-details.component.html',
  styleUrls: ['./trade-details.component.scss'],
})
export class TradeDetailsComponent implements OnInit, OnDestroy {
  private tradeId: string;

  descriptionColumns = { xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 };

  @Input('tradeId')
  set _tradeId(tradeId: string) {
    this.tradeId = tradeId;
    this.loadTradeDetails();
  }

  trade$!: Observable<ExchangeResourcesTypes.TradeById & any>;

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {
    this.trade$ = this.store
      .select(TradesState.getTradeDetailsByIds([this.tradeId]))
      .pipe(
        untilDestroyed(this),
        filter(([t]) => !!t),
        map(([t]) => t)
      );
  }

  loadTradeDetails() {
    this.store.dispatch(new LoadTrade(this.tradeId));
  }

  onAssetClick(nftId: string) {
    this.router.navigate(['/dashboard/assets', nftId]);
  }

  ngOnDestroy(): void {}
}
