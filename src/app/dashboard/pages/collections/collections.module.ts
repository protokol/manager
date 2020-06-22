import { NgModule } from '@angular/core';
import { CollectionsRoutingModule } from './collections-routing.module';
import { CollectionsComponent } from './collections.component';
import { NgxsModule } from '@ngxs/store';
import { CollectionsState } from '@app/dashboard/pages/collections/state/collections/collections.state';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';

@NgModule({
	imports: [
		CollectionsRoutingModule,
		NgxsModule.forFeature([CollectionsState]),
		CommonModule,
		SharedModule
	],
	declarations: [CollectionsComponent],
	exports: [CollectionsComponent],
})
export class CollectionsModule {}
