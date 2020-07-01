import { NgModule } from '@angular/core';
import { CollectionsRoutingModule } from './collections-routing.module';
import { CollectionsComponent } from './collections.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { CollectionsViewModalComponent } from './components/collections-view-modal/collections-view-modal.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { NzGridModule, NzModalModule } from 'ng-zorro-antd';
import { JsonSchemaFormModule } from '@ajsf/core';

@NgModule({
  imports: [
    CollectionsRoutingModule,
    CommonModule,
    SharedModule,
    NgJsonEditorModule,
    NzModalModule,
    NzGridModule,
    JsonSchemaFormModule,
  ],
  declarations: [CollectionsComponent, CollectionsViewModalComponent],
  exports: [],
})
export class CollectionsModule {}
