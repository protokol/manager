import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { PeersState } from '@app/dashboard/pages/peers/state/peers/peers.state';
import { PeersRoutingModule } from '@app/dashboard/pages/peers/peers-routing.module';
import { PeersComponent } from '@app/dashboard/pages/peers/peers.component';
import { FormsModule } from '@angular/forms';
import { NgLetModule } from '@core/directives/ngLet.module';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpaceModule } from 'ng-zorro-antd/space';

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
    NzDropDownModule,
    NzIconModule,
    NzTypographyModule,
    NzSpaceModule
  ],
  providers: [],
  declarations: [PeersComponent],
  exports: [],
})
export class PeersModule {}
