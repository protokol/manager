import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import {
  NzSpinModule,
  NzSwitchModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FormsModule } from '@angular/forms';
import { BidsRoutingModule } from '@app/dashboard/pages/bids/bids-routing.module';
import { BidsComponent } from '@app/dashboard/pages/bids/bids.component';
import { BidsState } from '@app/dashboard/pages/bids/state/bids/bids.state';
import { NgLetModule } from '@core/directives/ngLet.module';

@NgModule({
  imports: [
    BidsRoutingModule,
    NgxsModule.forFeature([BidsState]),
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
  declarations: [BidsComponent],
  exports: [],
})
export class BidsModule {}
