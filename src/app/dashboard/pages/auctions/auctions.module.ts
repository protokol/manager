import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { AuctionsRoutingModule } from './auctions-routing.module';
import { AuctionsState } from '@app/dashboard/pages/auctions/state/auctions/auctions.state';
import { AuctionsComponent } from './auctions.component';
import { NzSpinModule } from 'ng-zorro-antd';
import { AuctionBidsTableComponent } from './components/auction-bids-table/auction-bids-table.component';

@NgModule({
  imports: [
    AuctionsRoutingModule,
    NgxsModule.forFeature([AuctionsState]),
    CommonModule,
    SharedModule,
    NzSpinModule,
  ],
  providers: [],
  declarations: [AuctionsComponent, AuctionBidsTableComponent],
  exports: [],
})
export class AuctionsModule {}
