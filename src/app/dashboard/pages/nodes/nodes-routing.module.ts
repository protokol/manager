import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NodeDetailsComponent } from './components/node-details/node-details.component';
import { NodeManagerDetailsComponent } from './components/node-manager-details/node-manager-details.component';

const routes: Routes = [
  {
    path: 'manager/:url',
    component: NodeManagerDetailsComponent,
  },
  {
    path: ':url',
    component: NodeDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NodesRoutingModule {}
