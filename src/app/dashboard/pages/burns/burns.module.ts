import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { SharedModule } from '@shared/shared.module';
import { CommonModule } from '@angular/common';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { BurnsRoutingModule } from '@app/dashboard/pages/burns/burns-routing.module';
import { BurnsComponent } from '@app/dashboard/pages/burns/burns.component';
import { BurnsState } from '@app/dashboard/pages/burns/state/burns/burns.state';
import { NgLetModule } from '@core/directives/ngLet.module';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzGridModule } from 'ng-zorro-antd/grid';

@NgModule({
  imports: [
    BurnsRoutingModule,
    NgxsModule.forFeature([BurnsState]),
    CommonModule,
    SharedModule,
    NzModalModule,
    NgJsonEditorModule,
    NzGridModule,
    NgLetModule,
  ],
  providers: [],
  declarations: [BurnsComponent],
  exports: [],
})
export class BurnsModule {}
