import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { LoadWallet } from '@app/@core/store/wallets/wallets.actions';
import { WalletsState } from '@app/@core/store/wallets/wallets.state';
import { untilDestroyed } from '@core/until-destroyed';
import { filter, map } from 'rxjs/operators';
import { Wallet } from '@arkecosystem/client';
import { TableColumnConfig } from '@shared/interfaces/table.types';
import { BaseResourcesTypes } from '@protokol/client';
import { AssetsState } from '@app/@core/store/assets/assets.state';
import { LoadAsset } from '@app/@core/store/assets/assets.actions';

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
    collectionsWallet?: BaseResourcesTypes.CollectionsWallet;
    assetsWallet?: BaseResourcesTypes.AssetsWallet;
  }>;

  descriptionColumns = { xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 };
  assetsTableColumns: TableColumnConfig<BaseResourcesTypes.Assets>[];
  collectionsTableColumns: TableColumnConfig<BaseResourcesTypes.Collections>[];

  @ViewChild('assetsIdTpl', { static: true }) assetsIdTpl!: TemplateRef<{
    row: BaseResourcesTypes.Assets;
  }>;
  @ViewChild('assetsCollectionIdTpl', { static: true })
  assetsCollectionIdTpl!: TemplateRef<{
    row: BaseResourcesTypes.Assets;
  }>;
  @ViewChild('assetsOwnerTpl', { static: true }) assetsOwnerTpl!: TemplateRef<{
    row: BaseResourcesTypes.Assets;
  }>;
  @ViewChild('assetsSenderTpl', { static: true })
  assetsSenderTpl!: TemplateRef<{
    row: BaseResourcesTypes.Assets;
  }>;
  @ViewChild('assetsActionsTpl', { static: true })
  assetsActionsTpl!: TemplateRef<{
    row: BaseResourcesTypes.Assets;
  }>;

  @ViewChild('collectionsIdTpl', { static: true })
  collectionsIdTpl!: TemplateRef<{
    row: BaseResourcesTypes.Collections;
  }>;
  @ViewChild('collectionsNameTpl', { static: true })
  collectionsNameTpl!: TemplateRef<{
    row: BaseResourcesTypes.Collections;
  }>;
  @ViewChild('collectionsDescriptionTpl', { static: true })
  collectionsDescriptionTpl!: TemplateRef<{
    row: BaseResourcesTypes.Collections;
  }>;
  @ViewChild('collectionsMaxSupplyTpl', { static: true })
  collectionsMaxSupplyTpl!: TemplateRef<{
    row: BaseResourcesTypes.Collections;
  }>;

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

    this.assetsTableColumns = [
      {
        propertyName: 'id',
        headerName: 'Id',
        columnTransformTpl: this.assetsIdTpl,
      },
      {
        propertyName: 'collectionId',
        headerName: 'Collection',
        columnTransformTpl: this.assetsCollectionIdTpl,
      },
      {
        propertyName: 'ownerPublicKey',
        headerName: 'Owner',
        columnTransformTpl: this.assetsOwnerTpl,
      },
      {
        propertyName: 'senderPublicKey',
        headerName: 'Sender',
        columnTransformTpl: this.assetsSenderTpl,
      },
      {
        headerName: 'Actions',
        columnTransformTpl: this.assetsActionsTpl,
      },
    ];

    this.collectionsTableColumns = [
      {
        headerName: 'Id',
        columnTransformTpl: this.collectionsIdTpl,
      },
      {
        headerName: 'Name',
        columnTransformTpl: this.collectionsNameTpl,
      },
      {
        headerName: 'Description',
        columnTransformTpl: this.collectionsDescriptionTpl,
      },
      {
        // @ts-ignore
        propertyName: 'currentSupply',
        headerName: 'Current Supply',
      },
      {
        headerName: 'Max Supply',
        columnTransformTpl: this.collectionsMaxSupplyTpl,
      },
    ];
  }

  ngOnDestroy(): void {}

  getAssets(assetsIds: string[]) {
    if (!assetsIds || !assetsIds.length) {
      return of([]);
    }

    assetsIds.forEach((aId) => this.store.dispatch(new LoadAsset(aId)));

    return this.store.select(AssetsState.getAssetsByIds(assetsIds)).pipe(
      filter((assets) => !!assets),
      filter((assets) => {
        if (!assets.length) {
          return true;
        }
        return assets.every((a) => !!a);
      })
    );
  }

  onWalletDetailsClick(addressOrPublicKey: string, assetId: string) {
    this.router.navigate(['/dashboard/wallets', addressOrPublicKey], {
      queryParams: {
        assetId,
      },
    });
  }

  toAssetDetails(event: MouseEvent, asset: BaseResourcesTypes.Assets) {
    event.preventDefault();

    this.router.navigate(['/dashboard/assets', asset.id]);
  }
}
