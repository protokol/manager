import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NzGridModule, NzModalModule } from 'ng-zorro-antd';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { WalletsRoutingModule } from '@app/dashboard/pages/wallets/wallets-routing.module';
import { WalletsComponent } from '@app/dashboard/pages/wallets/wallets.component';
import { WalletsState } from '@app/dashboard/pages/wallets/state/wallets/wallets.state';

@NgModule({
  imports: [
    WalletsRoutingModule,
    NgxsModule.forFeature([WalletsState]),
    CommonModule,
    SharedModule,
    NzModalModule,
    NgJsonEditorModule,
    NzGridModule,
  ],
  providers: [],
  declarations: [WalletsComponent],
  exports: [],
})
export class WalletsModule {}
