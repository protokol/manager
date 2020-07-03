import { NgModule } from '@angular/core';
import { CollectionsRoutingModule } from './collections-routing.module';
import { CollectionsComponent } from './collections.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import {
  NzButtonModule,
  NzDividerModule,
  NzFormModule,
  NzGridModule,
  NzInputModule,
  NzModalModule,
} from 'ng-zorro-antd';
import { JsonSchemaFormModule } from '@ajsf/core';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { CollectionViewModalComponent } from './components/collection-view-modal/collection-view-modal.component';
import { CollectionCreateModalComponent } from './components/collection-create-modal/collection-create-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CollectionsRoutingModule,
    CommonModule,
    SharedModule,
    NgJsonEditorModule,
    NzModalModule,
    NzGridModule,
    JsonSchemaFormModule,
    NzButtonModule,
    NzSpaceModule,
    NzFormModule,
    ReactiveFormsModule,
    NzInputModule,
    NzDividerModule,
    FormsModule,
  ],
  declarations: [
    CollectionsComponent,
    CollectionViewModalComponent,
    CollectionCreateModalComponent,
  ],
  exports: [],
})
export class CollectionsModule {}
