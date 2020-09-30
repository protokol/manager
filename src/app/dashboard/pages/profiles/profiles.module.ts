import { NgModule } from '@angular/core';
import { ProfilesRoutingModule } from '@app/dashboard/pages/profiles/profiles-routing.module';
import { ProfilesComponent } from '@app/dashboard/pages/profiles/profiles.component';
import { NgLetModule } from '@core/directives/ngLet.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzGridModule } from 'ng-zorro-antd/grid';

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
