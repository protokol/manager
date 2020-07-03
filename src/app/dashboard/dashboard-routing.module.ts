import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardShell } from './dashboard.service';

const routes: Routes = [
  DashboardShell.childRoutes([
    { path: '', pathMatch: 'full', redirectTo: 'collections' },
    {
      path: 'collections',
      loadChildren: () =>
        import('./pages/collections/collections.module').then(
          (m) => m.CollectionsModule
        ),
    },
    {
      path: 'assets',
      loadChildren: () =>
        import('./pages/assets/assets.module').then((m) => m.AssetsModule),
    },
    {
      path: 'transfers',
      loadChildren: () =>
        import('./pages/transfers/transfers.module').then(
          (m) => m.TransfersModule
        ),
    },
    {
      path: 'burns',
      loadChildren: () =>
        import('./pages/burns/burns.module').then((m) => m.BurnsModule),
    },
    { path: '**', redirectTo: 'collections' },
  ]),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class DashboardRoutingModule {}
