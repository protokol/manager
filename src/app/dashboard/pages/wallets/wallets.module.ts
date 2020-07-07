import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import {
  NzDescriptionsModule,
  NzDividerModule,
  NzGridModule,
  NzModalModule,
  NzSpinModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { WalletsRoutingModule } from '@app/dashboard/pages/wallets/wallets-routing.module';
import { WalletsComponent } from '@app/dashboard/pages/wallets/wallets.component';
import { WalletsState } from '@app/dashboard/pages/wallets/state/wallets/wallets.state';
import { WalletDetailsComponent } from './components/wallet-details/wallet-details.component';

@NgModule({
  imports: [
    WalletsRoutingModule,
    NgxsModule.forFeature([WalletsState]),
    CommonModule,
    SharedModule,
    NzModalModule,
    NgJsonEditorModule,
    NzGridModule,
    NzDescriptionsModule,
    NzSpinModule,
    NzTypographyModule,
    NzDividerModule,
  ],
  providers: [],
  declarations: [WalletsComponent, WalletDetailsComponent],
  exports: [],
})
export class WalletsModule {}
