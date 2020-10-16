import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from './components/table/table.component';
import { TextClipperComponent } from './components/text-clipper/text-clipper.component';
import { ClipboardModule } from 'ngx-clipboard';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SchemaContainerComponent } from './components/schema-container/schema-container.component';
import { SchemaContainerItemComponent } from './components/schema-container-item/schema-container-item.component';
import { TextAnimateComponent } from './components/text-animate/text-animate.component';
import { NgLetModule } from '@core/directives/ngLet.module';
import { JsonViewModalComponent } from '@shared/components/json-view-modal/json-view-modal.component';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { AssetCreateModalComponent } from './components/asset-create-modal/asset-create-modal.component';
import { CollectionSelectComponent } from './components/collection-select/collection-select.component';
import { JsonSchemaFormModule } from '@ajsf/core';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { IpfsUploadFilePinataComponent } from './components/ipfs-upload-file-pinata/ipfs-upload-file-pinata.component';
import { DateFnsFormatPipe } from './pipes/date-fns-format.pipe';
import { ModalHeaderComponent } from './components/modal-header/modal-header.component';
import { PopoverHelperComponent } from './components/popover-helper/popover-helper.component';
import { FormLabelComponent } from './components/form-label/form-label.component';
import { ProfileSelectModalComponent } from '@shared/components/profile-select-modal/profile-select-modal.component';
import { NodeManagerFormComponent } from './components/node-manager-form/node-manager-form.component';
import { WalletSelectComponent } from '@shared/components/wallet-select/wallet-select.component';
import { AssetSelectComponent } from '@shared/components/asset-select/asset-select.component';
import { MyNodesCreateModalComponent } from '@shared/components/my-nodes-create-modal/my-nodes-create-modal.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { ModalFullscreenComponent } from '@shared/components/modal-fullscreen/modal-fullscreen.component';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

const declareAndExportComponents = [
  TableComponent,
  TextClipperComponent,
  SchemaContainerComponent,
  SchemaContainerItemComponent,
  TextAnimateComponent,
  JsonViewModalComponent,
  AssetCreateModalComponent,
  CollectionSelectComponent,
  IpfsUploadFilePinataComponent,
  DateFnsFormatPipe,
  ModalHeaderComponent,
  PopoverHelperComponent,
  FormLabelComponent,
  ProfileSelectModalComponent,
  WalletSelectComponent,
  AssetSelectComponent,
  MyNodesCreateModalComponent,
  PageHeaderComponent,
  NodeManagerFormComponent,
  ModalFullscreenComponent
];

@NgModule({
  imports: [
    CommonModule,
    NzTableModule,
    NzToolTipModule,
    NzTypographyModule,
    ClipboardModule,
    NzMessageModule,
    NzDropDownModule,
    NzIconModule,
    NzInputModule,
    FormsModule,
    NzButtonModule,
    NzGridModule,
    NgLetModule,
    NgJsonEditorModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSelectModule,
    NzDividerModule,
    NzSpinModule,
    JsonSchemaFormModule,
    NzNotificationModule,
    NzModalModule,
    NzSpaceModule,
    NzUploadModule,
    NzDescriptionsModule,
    NzAlertModule,
    NzPopoverModule,
    NzPopconfirmModule,
    NzRadioModule,
    NzCheckboxModule,
    NzInputNumberModule
  ],
  declarations: [...declareAndExportComponents],
  exports: [...declareAndExportComponents],
})
export class SharedModule {}
