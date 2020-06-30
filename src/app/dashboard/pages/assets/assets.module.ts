import { NgModule } from '@angular/core';
import { AssetsRoutingModule } from './assets-routing.module';
import { AssetsComponent } from './assets.component';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NzGridModule, NzModalModule } from 'ng-zorro-antd';
import { AssetsState } from '@app/dashboard/pages/assets/state/collections/assets.state';
import { AssetViewModalComponent } from '@app/dashboard/pages/assets/components/asset-view-modal/asset-view-modal.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JsonSchemaFormModule } from '@ajsf/core';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
	imports: [
		AssetsRoutingModule,
		NgxsModule.forFeature([AssetsState]),
		CommonModule,
		SharedModule,
		NzModalModule,
		NgJsonEditorModule,
		NzGridModule,
		JsonSchemaFormModule,
		ReactiveFormsModule
	],
	providers: [],
	declarations: [
		AssetsComponent,
		AssetViewModalComponent
	],
	exports: [],
})
export class AssetsModule {}
