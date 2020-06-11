import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './pages/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import {
	NzButtonModule,
	NzCheckboxModule,
	NzFormModule,
	NzInputModule,
	NzTypographyModule,
} from 'ng-zorro-antd';

@NgModule({
	declarations: [LoginComponent],
	imports: [
		CommonModule,
		AuthRoutingModule,
		ReactiveFormsModule,
		NzFormModule,
		NzInputModule,
		NzButtonModule,
		NzCheckboxModule,
		NzTypographyModule,
	],
})
export class AuthModule {}
