import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoadWallet } from '@app/dashboard/pages/wallets/state/wallets/wallets.actions';
import { WalletsState } from '@app/dashboard/pages/wallets/state/wallets/wallets.state';
import { untilDestroyed } from '@core/until-destroyed';
import { map, tap } from 'rxjs/operators';
import { Wallet } from '@arkecosystem/client/dist/resourcesTypes/wallets';

@Component({
  selector: 'app-wallet-details',
  templateUrl: './wallet-details.component.html',
  styleUrls: ['./wallet-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletDetailsComponent implements OnInit, OnDestroy {
  isLoading$ = new BehaviorSubject(true);
  wallet$: Observable<Wallet>;

  descriptionColumns = { xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    const walletId: string = this.route.snapshot.paramMap.get('id');
    if (walletId) {
      this.wallet$ = this.store
        .select(WalletsState.getWalletsByIds([walletId]))
        .pipe(
          untilDestroyed(this),
          map(([w]) => w),
          tap(console.log)
        );

      this.store.dispatch(new LoadWallet(walletId));
    } else {
      this.router.navigate(['/dashboard/wallets']);
    }
  }

  ngOnDestroy(): void {}
}
