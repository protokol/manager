import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { GuardianRoutingModule } from './guardian-routing.module';
import { GuardianGroupsComponent } from './pages/groups/guardian-groups.component';
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
import { GuardianState } from '@app/dashboard/pages/guardian/state/guardian/guardian.state';
import { NgxsModule } from '@ngxs/store';
import { GuardianGroupModalComponent } from './components/guardian-group-modal/guardian-group-modal.component';
import { GuardianGroupPermissionsFormComponent } from '@app/dashboard/pages/guardian/components/guardian-group-permissions-form/guardian-group-permissions-form.component';

@NgModule({
  imports: [
    GuardianRoutingModule,
    NgxsModule.forFeature([GuardianState]),
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
export class GuardianModule {}
