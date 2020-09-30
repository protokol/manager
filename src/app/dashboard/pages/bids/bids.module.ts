import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FormsModule } from '@angular/forms';
import { BidsRoutingModule } from '@app/dashboard/pages/bids/bids-routing.module';
import { BidsComponent } from '@app/dashboard/pages/bids/bids.component';
import { BidsState } from '@app/dashboard/pages/bids/state/bids/bids.state';
import { NgLetModule } from '@core/directives/ngLet.module';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSpinModule } from 'ng-zorro-antd/spin';

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
