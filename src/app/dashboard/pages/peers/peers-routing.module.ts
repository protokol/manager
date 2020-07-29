import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PeersComponent } from '@app/dashboard/pages/peers/peers.component';

const routes: Routes = [
  {
    path: '',
    component: PeersComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeersRoutingModule {}
