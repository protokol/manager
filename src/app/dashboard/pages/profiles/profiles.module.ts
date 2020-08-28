import { NgModule } from '@angular/core';
import { ProfilesRoutingModule } from '@app/dashboard/pages/profiles/profiles-routing.module';
import { ProfilesComponent } from '@app/dashboard/pages/profiles/profiles.component';
import { NgLetModule } from '@core/directives/ngLet.module';
import { CommonModule } from '@angular/common';
import {
  NzButtonModule,
  NzDescriptionsModule,
  NzGridModule,
  NzIconModule,
  NzInputModule,
  NzListModule,
  NzTypographyModule,
} from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    ProfilesRoutingModule,
    NgLetModule,
    CommonModule,
    NzListModule,
    NzGridModule,
    NzTypographyModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzInputModule,
    FormsModule,
    NzIconModule,
  ],
  providers: [],
  declarations: [ProfilesComponent],
  exports: [],
})
export class ProfilesModule {}
