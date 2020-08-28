import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NzGridModule, NzModalModule } from 'ng-zorro-antd';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { TransfersState } from '@app/dashboard/pages/transfers/state/transfers/transfers.state';
import { TransfersRoutingModule } from './transfers-routing.module';
import { TransfersComponent } from './transfers.component';
import { NgLetModule } from '@core/directives/ngLet.module';

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
  ],
  providers: [],
  declarations: [TransfersComponent],
  exports: [],
})
export class TransfersModule {}
