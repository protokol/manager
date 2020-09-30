import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { AuctionsRoutingModule } from './auctions-routing.module';
import { AuctionsState } from '@app/dashboard/pages/auctions/state/auctions/auctions.state';
import { AuctionsComponent } from './auctions.component';
import { AuctionBidsTableComponent } from './components/auction-bids-table/auction-bids-table.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@NgModule({
  imports: [
    AuctionsRoutingModule,
    NgxsModule.forFeature([AuctionsState]),
    CommonModule,
    SharedModule,
    NzSpinModule,
    NzSpaceModule,
    NzSwitchModule,
    FormsModule,
    NzTypographyModule,
    NgLetModule,
  ],
  providers: [],
  declarations: [AuctionsComponent, AuctionBidsTableComponent],
  exports: [],
})
export class AuctionsModule {}
