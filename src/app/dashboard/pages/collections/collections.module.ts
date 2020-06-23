import { NgModule } from '@angular/core';
import { CollectionsRoutingModule } from './collections-routing.module';
import { CollectionsComponent } from './collections.component';
import { NgxsModule } from '@ngxs/store';
import { CollectionsState } from '@app/dashboard/pages/collections/state/collections/collections.state';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { CollectionsViewModalComponent } from './components/collections-view-modal/collections-view-modal.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NzModalModule } from 'ng-zorro-antd';

@NgModule({
	imports: [
		CollectionsRoutingModule,
		NgxsModule.forFeature([CollectionsState]),
		CommonModule,
		SharedModule,
		NgJsonEditorModule,
		NzModalModule,
	],
	declarations: [CollectionsComponent, CollectionsViewModalComponent],
	exports: [CollectionsComponent],
})
export class CollectionsModule {}