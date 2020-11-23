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
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { BurnModalComponent } from '@app/dashboard/pages/burns/components/burn-modal/burn-modal.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';

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
    NzSpaceModule,
    NzTypographyModule,
    NzButtonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzSpinModule,
    NzPopconfirmModule
  ],
  providers: [],
  declarations: [BurnsComponent, BurnModalComponent],
  exports: [],
})
export class BurnsModule {}
