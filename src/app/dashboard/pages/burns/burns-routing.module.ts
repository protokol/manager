import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BurnsComponent } from './burns.component';

const routes: Routes = [
  {
    path: '',
    component: BurnsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BurnsRoutingModule {}
