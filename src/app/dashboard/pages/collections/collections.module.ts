import { NgModule } from '@angular/core';
import { CollectionsRoutingModule } from './collections-routing.module';
import { CollectionsComponent } from './collections.component';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JsonSchemaFormModule } from '@ajsf/core';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { CollectionViewModalComponent } from './components/collection-view-modal/collection-view-modal.component';
import { CollectionCreateModalComponent } from './components/collection-create-modal/collection-create-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { AttributeCreateModalComponent } from './components/attribute-create-modal/attribute-create-modal.component';
import { AttributeStringFormComponent } from '@app/dashboard/pages/collections/components/attribute-string-form/attribute-string-form.component';
import { AttributeNumberFormComponent } from '@app/dashboard/pages/collections/components/attribute-number-form/attribute-number-form.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { PublicKeysFormComponent } from './components/public-keys-form/public-keys-form.component';
import { NzListModule } from 'ng-zorro-antd/list';

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
    NzListModule
  ],
  declarations: [
    CollectionsComponent,
    CollectionViewModalComponent,
    CollectionCreateModalComponent,
    AttributeCreateModalComponent,
    AttributeStringFormComponent,
    AttributeNumberFormComponent,
    PublicKeysFormComponent
  ],
  exports: [],
})
export class CollectionsModule {}
