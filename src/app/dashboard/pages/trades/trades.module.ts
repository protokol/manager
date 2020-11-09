import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { TradesState } from '@app/dashboard/pages/trades/state/trades/trades.state';
import { TradesComponent } from './trades.component';
import { TradesRoutingModule } from '@app/dashboard/pages/trades/trades-routing.module';
import { TradeDetailsComponent } from './components/trade-details/trade-details.component';
import { NgLetModule } from '@core/directives/ngLet.module';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@NgModule({
  imports: [
    TradesRoutingModule,
    NgxsModule.forFeature([TradesState]),
    CommonModule,
    SharedModule,
    NzSpinModule,
    NzDescriptionsModule,
    NzTypographyModule,
    NgLetModule,
    NzSpaceModule
  ],
  providers: [],
  declarations: [TradesComponent, TradeDetailsComponent],
  exports: [],
})
export class TradesModule {}
