import { Routes, Route } from '@angular/router';
import { DashboardShellComponent } from './components/dashboard-shell/dashboard-shell.component';

/**
 * Provides helper methods to create routes.
 */
export class DashboardShell {
  /**
   * Creates routes using the shell component and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutes(routes: Routes): Route {
    return {
      path: '',
      component: DashboardShellComponent,
      children: routes,
      // Reuse ShellComponent instance when navigating between child views
      data: { reuse: true },
    };
  }
}
