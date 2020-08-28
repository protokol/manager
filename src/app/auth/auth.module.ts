import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
  NzAlertModule,
  NzButtonModule,
  NzCheckboxModule,
  NzFormModule,
  NzIconModule,
  NzInputModule,
  NzRadioModule,
  NzSelectModule,
  NzSpinModule,
  NzStepsModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { RegisterComponent } from '@app/auth/pages/register/register.component';
import { NgLetModule } from '@core/directives/ngLet.module';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzCheckboxModule,
    NzTypographyModule,
    NzAlertModule,
    NzSpinModule,
    NzSelectModule,
    NzStepsModule,
    NzRadioModule,
    NzIconModule,
    NgLetModule,
  ],
})
export class AuthModule {}
