import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MyNodesComponent } from '@app/dashboard/pages/my-nodes/my-nodes.component';

const routes: Routes = [
  {
    path: '',
    component: MyNodesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MyNodesRoutingModule {}
