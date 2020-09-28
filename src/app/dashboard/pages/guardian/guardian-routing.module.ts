import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuardianGroupsComponent } from './pages/groups/guardian-groups.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'groups',
      component: GuardianGroupsComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuardianRoutingModule {}
