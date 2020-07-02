import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TransfersComponent } from './transfers.component';

const routes: Routes = [
  {
    path: '',
    component: TransfersComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TransfersRoutingModule {}
