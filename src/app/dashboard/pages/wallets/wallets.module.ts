import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { WalletsRoutingModule } from '@app/dashboard/pages/wallets/wallets-routing.module';
import { WalletsComponent } from '@app/dashboard/pages/wallets/wallets.component';
import { WalletDetailsComponent } from './components/wallet-details/wallet-details.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';

@NgModule({
  imports: [
    WalletsRoutingModule,
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
