import { NgModule } from '@angular/core';
import { AssetsRoutingModule } from './assets-routing.module';
import { AssetsComponent } from './assets.component';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd';
import { AssetsState } from '@app/dashboard/pages/assets/state/collections/assets.state';

@NgModule({
	imports: [
		AssetsRoutingModule,
		NgxsModule.forFeature([AssetsState]),
		CommonModule,
		SharedModule,
		NzModalModule,
	],
	declarations: [AssetsComponent],
	exports: [AssetsComponent],
})
export class AssetsModule {}
