import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardShell } from './dashboard.service';

const routes: Routes = [
	DashboardShell.childRoutes([
		{ path: '', pathMatch: 'full', redirectTo: 'welcome' },
		{
			path: 'welcome',
			loadChildren: () =>
				import('./pages/welcome/welcome.module').then((m) => m.WelcomeModule),
		},
		{ path: '**', redirectTo: 'welcome' },
	]),
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
	providers: [],
})
export class DashboardRoutingModule {}
