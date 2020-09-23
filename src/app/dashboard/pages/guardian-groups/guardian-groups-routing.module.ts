import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuardianGroupsComponent } from './guardian-groups.component';

const routes: Routes = [
  {
    path: '',
    component: GuardianGroupsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuardianGroupsRoutingModule {}
