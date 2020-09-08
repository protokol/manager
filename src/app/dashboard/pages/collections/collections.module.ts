import { NgModule } from '@angular/core';
import { CollectionsRoutingModule } from './collections-routing.module';
import { CollectionsComponent } from './collections.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import {
  NzButtonModule,
  NzCheckboxModule,
  NzDividerModule,
  NzFormModule,
  NzGridModule,
  NzIconModule,
  NzInputModule,
  NzInputNumberModule,
  NzModalModule,
  NzNotificationModule,
  NzSelectModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { JsonSchemaFormModule } from '@ajsf/core';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { CollectionViewModalComponent } from './components/collection-view-modal/collection-view-modal.component';
import { CollectionCreateModalComponent } from './components/collection-create-modal/collection-create-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { AttributeCreateModalComponent } from './components/attribute-create-modal/attribute-create-modal.component';
import { AttributeStringFormComponent } from '@app/dashboard/pages/collections/components/attribute-string-form/attribute-string-form.component';
import { AttributeNumberFormComponent } from '@app/dashboard/pages/collections/components/attribute-number-form/attribute-number-form.component';

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
    NgLetModule,
    NzNotificationModule,
    NzTypographyModule,
    NzInputNumberModule,
    NzIconModule,
    NzSelectModule,
    NzCheckboxModule,
  ],
  declarations: [
    CollectionsComponent,
    CollectionViewModalComponent,
    CollectionCreateModalComponent,
    AttributeCreateModalComponent,
    AttributeStringFormComponent,
    AttributeNumberFormComponent,
  ],
  exports: [],
})
export class CollectionsModule {}
