import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { GuardianGroupsRoutingModule } from './guardian-groups-routing.module';
import { GuardianGroupsComponent } from './guardian-groups.component';
import {
  NzButtonModule,
  NzFormModule,
  NzIconModule,
  NzInputModule,
  NzInputNumberModule,
  NzModalModule,
  NzSpinModule,
  NzSwitchModule,
  NzTableModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { GuardianGroupsState } from '@app/dashboard/pages/guardian-groups/state/guardian-groups/guardian-groups.state';
import { NgxsModule } from '@ngxs/store';
import { GuardianGroupModalComponent } from './components/guardian-group-modal/guardian-group-modal.component';
import { GuardianGroupPermissionsFormComponent } from '@app/dashboard/pages/guardian-groups/components/guardian-group-permissions-form/guardian-group-permissions-form.component';

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
    NzButtonModule,
    NzModalModule,
    ReactiveFormsModule,
    NzInputNumberModule,
    NzTableModule,
    NzIconModule,
  ],
  providers: [],
  declarations: [
    GuardianGroupsComponent,
    GuardianGroupModalComponent,
    GuardianGroupPermissionsFormComponent,
  ],
  exports: [],
})
export class GuardianGroupsModule {}
