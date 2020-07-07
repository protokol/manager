import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsProviderModule } from './icons-provider.module';
import { NgxsModule } from '@ngxs/store';
import { ProfilesState } from './store/profiles/profiles.state';
import { environment } from '@env/environment';
import { NgxsStoragePluginModule, StorageOption } from '@ngxs/storage-plugin';
import { WalletService } from './services/wallet.service';
import { NodeClientService } from './services/node-client.service';
import { NetworksState } from '@core/store/network/networks.state';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { HasProfileGuard } from '@core/guards/has-profile.guard';
import { PinsState } from '@core/store/pins/pins.state';
import { Bip38Service } from '@core/services/bip38.service';
import { bip38Factory } from '@core/factory/bip38.factory';
import { CollectionsState } from '@core/store/collections/collections.state';
import { AssetsService } from '@core/services/assets.service';
import { CollectionsService } from '@core/services/collections.service';
import { AjsfWidgetLibraryModule } from '@app/ajsf-widget-library/ajsf-widget-library.module';
import { TransfersService } from '@core/services/transfers.service';
import { BurnsService } from '@core/services/burns.service';
import { WalletsService } from '@core/services/wallets.service';
import { WalletsState } from '@core/store/wallets/wallets.state';

@NgModule({
  declarations: [],
  imports: [
    NgxsModule.forRoot(
      [ProfilesState, NetworksState, PinsState, CollectionsState, WalletsState],
      {
        developmentMode: !environment.production,
      }
    ),
    NgxsStoragePluginModule.forRoot({
      key: [
        ProfilesState,
        NetworksState,
        // Preserve pins for development
        ...(environment.production ? [] : [PinsState]),
      ],
      storage: StorageOption.LocalStorage,
    }),
    CommonModule,
    IconsProviderModule,
    AjsfWidgetLibraryModule,
  ],
  providers: [
    NodeClientService,
    AssetsService,
    CollectionsService,
    TransfersService,
    BurnsService,
    WalletsService,
    WalletService,
    StoreUtilsService,
    HasProfileGuard,
    {
      provide: Bip38Service,
      useFactory: bip38Factory,
      deps: [],
    },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    // Import guard
    if (parentModule) {
      throw new Error(
        `${parentModule} has already been loaded. Import Core module in the AppModule only.`
      );
    }
  }
}
