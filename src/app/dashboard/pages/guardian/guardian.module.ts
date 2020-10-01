import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { GuardianRoutingModule } from './guardian-routing.module';
import { GroupsComponent } from './pages/groups/groups.component';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { GuardianState } from '@app/dashboard/pages/guardian/state/guardian/guardian.state';
import { NgxsModule } from '@ngxs/store';
import { GuardianGroupModalComponent } from './components/guardian-group-modal/guardian-group-modal.component';
import { GuardianGroupPermissionsFormComponent } from '@app/dashboard/pages/guardian/components/guardian-group-permissions-form/guardian-group-permissions-form.component';
import { UsersComponent } from './pages/users/users.component';
import { GuardianUserModalComponent } from '@app/dashboard/pages/guardian/components/guardian-user-modal/guardian-user-modal.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';

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
    NzDropDownModule
  ],
  providers: [],
  declarations: [
    GroupsComponent,
    UsersComponent,
    GuardianGroupModalComponent,
    GuardianUserModalComponent,
    GuardianGroupPermissionsFormComponent,
  ],
  exports: [],
})
export class GuardianModule {}
