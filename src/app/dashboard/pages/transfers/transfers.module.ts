import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { TransfersState } from '@app/dashboard/pages/transfers/state/transfers/transfers.state';
import { TransfersRoutingModule } from './transfers-routing.module';
import { TransfersComponent } from './transfers.component';
import { NgLetModule } from '@core/directives/ngLet.module';
import { TransferModalComponent } from './components/transfer-modal/transfer-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NftIdsFormComponent } from '@app/dashboard/pages/transfers/components/nft-ids-form/nft-ids-form.component';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzGridModule } from 'ng-zorro-antd/grid';

@NgModule({
  imports: [
    TransfersRoutingModule,
    NgxsModule.forFeature([TransfersState]),
    CommonModule,
    SharedModule,
    NzModalModule,
    NgJsonEditorModule,
    NzGridModule,
    NgLetModule,
    NzButtonModule,
    NzFormModule,
    ReactiveFormsModule,
    NzSpaceModule,
    NzTypographyModule,
    NzListModule,
    NzSpinModule,
  ],
  providers: [],
  declarations: [
    TransfersComponent,
    TransferModalComponent,
    NftIdsFormComponent,
  ],
  exports: [],
})
export class TransfersModule {}
