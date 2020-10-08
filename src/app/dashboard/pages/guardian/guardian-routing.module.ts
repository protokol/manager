import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GroupsComponent } from './pages/groups/groups.component';
import { UsersComponent } from '@app/dashboard/pages/guardian/pages/users/users.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: 'groups',
      component: GroupsComponent,
    },
    {
      path: 'users',
      component: UsersComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GuardianRoutingModule {}
