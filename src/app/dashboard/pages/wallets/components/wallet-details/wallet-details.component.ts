import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoadWallet } from '@app/@core/store/wallets/wallets.actions';
import { WalletsState } from '@app/@core/store/wallets/wallets.state';
import { untilDestroyed } from '@core/until-destroyed';
import { map } from 'rxjs/operators';
import { Wallet } from '@arkecosystem/client/dist/resourcesTypes/wallets';
import {
  AssetsWallet,
  CollectionsWallet,
} from '@protokol/nft-client/dist/resourcesTypes/base';

@Component({
  selector: 'app-wallet-details',
  templateUrl: './wallet-details.component.html',
  styleUrls: ['./wallet-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletDetailsComponent implements OnInit, OnDestroy {
  isLoading$ = new BehaviorSubject(true);
  wallet$: Observable<{
    wallet: Wallet;
    collectionsWallet?: CollectionsWallet;
    assetsWallet?: AssetsWallet;
  }>;

  descriptionColumns = { xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {
    const walletId: string = this.route.snapshot.paramMap.get('id');
    const collectionId: string = this.route.snapshot.queryParamMap.get(
      'collectionId'
    );
    const assetId: string = this.route.snapshot.queryParamMap.get('assetId');

    if (walletId) {
      this.wallet$ = this.store
        .select(
          WalletsState.getWalletsByIds([walletId], {
            collectionId,
            assetId,
          })
        )
        .pipe(
          untilDestroyed(this),
          map(([w]) => w)
        );

      this.store.dispatch(
        new LoadWallet(walletId, {
          collectionId,
          assetId,
        })
      );
    } else {
      this.router.navigate(['/dashboard/wallets']);
    }
  }

  ngOnDestroy(): void {}
}
