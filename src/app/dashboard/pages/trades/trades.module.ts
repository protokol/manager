import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NzSpinModule } from 'ng-zorro-antd';
import { TradesState } from '@app/dashboard/pages/trades/state/trades/trades.state';
import { TradesComponent } from './trades.component';
import { TradesRoutingModule } from '@app/dashboard/pages/trades/trades-routing.module';

@NgModule({
  imports: [
    TradesRoutingModule,
    NgxsModule.forFeature([TradesState]),
    CommonModule,
    SharedModule,
    NzSpinModule,
  ],
  providers: [],
  declarations: [TradesComponent],
  exports: [],
})
export class TradesModule {}
