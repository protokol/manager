import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { GuardianGroupsRoutingModule } from './guardian-groups-routing.module';
import { GuardianGroupsComponent } from './guardian-groups.component';
import {
  NzButtonModule,
  NzFormModule, NzInputModule,
  NzSpinModule,
  NzSwitchModule,
  NzTypographyModule
} from 'ng-zorro-antd';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { GuardianGroupsState } from '@app/dashboard/pages/guardian-groups/state/guardian-groups/guardian-groups.state';
import { NgxsModule } from '@ngxs/store';

@NgModule({
  imports: [
    GuardianGroupsRoutingModule,
    NgxsModule.forFeature([GuardianGroupsState]),
    CommonModule,
    SharedModule,
    NzSpinModule,
    NzSpaceModule,
    NzSwitchModule,
    FormsModule,
    NzTypographyModule,
    NgLetModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule
  ],
  providers: [],
  declarations: [GuardianGroupsComponent],
  exports: [],
})
export class GuardianGroupsModule {}
