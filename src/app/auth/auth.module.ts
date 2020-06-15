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
    NzInputModule, NzSpinModule,
    NzTypographyModule,
} from 'ng-zorro-antd';
import { RegisterComponent } from '@app/auth/pages/register/register.component';

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
    ],
})
export class AuthModule {}
