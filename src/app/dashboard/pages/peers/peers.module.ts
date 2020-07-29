import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import {
  NzButtonModule,
  NzCheckboxModule,
  NzGridModule,
  NzModalModule,
} from 'ng-zorro-antd';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { PeersState } from '@app/dashboard/pages/peers/state/peers/peers.state';
import { PeersRoutingModule } from '@app/dashboard/pages/peers/peers-routing.module';
import { PeersComponent } from '@app/dashboard/pages/peers/peers.component';
import { FormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';

@NgModule({
  imports: [
    PeersRoutingModule,
    NgxsModule.forFeature([PeersState]),
    CommonModule,
    SharedModule,
    NzModalModule,
    NgJsonEditorModule,
    NzGridModule,
    NzCheckboxModule,
    FormsModule,
    NgLetModule,
    NzButtonModule,
  ],
  providers: [],
  declarations: [PeersComponent],
  exports: [],
})
export class PeersModule {}
