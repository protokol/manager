import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WalletsComponent } from '@app/dashboard/pages/wallets/wallets.component';

const routes: Routes = [
  {
    path: '',
    component: WalletsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WalletsRoutingModule {}
