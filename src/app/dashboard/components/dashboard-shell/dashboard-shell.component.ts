import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ClearPinsAction } from '@core/store/pins/pins.actions';
import { Router } from '@angular/router';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { ProfileWithId } from '@core/interfaces/profiles.types';
import { NetworksState } from '@core/store/network/networks.state';

@Component({
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
})
export class DashboardShellComponent implements OnInit {
  @Select(ProfilesState.getSelectedProfile) selectedProfile$: Observable<
    ProfileWithId
  >;
  @Select(NetworksState.hasNftPluginsLoaded) hasNftPluginsLoaded$: Observable<
    ReturnType<typeof NetworksState.hasNftPluginsLoaded>
  >;
  isCollapsed = false;

  constructor(private store: Store, private router: Router) {}

  ngOnInit(): void {}

  onSignOut(event: MouseEvent) {
    event.preventDefault();

    this.store.dispatch(new ClearPinsAction());
    this.router.navigate(['/auth']);
  }

  goToNodeConfiguration(event: MouseEvent) {
    event.preventDefault();

    const baseUrl = this.store.selectSnapshot(NetworksState.getBaseUrl);
    this.router.navigate(['/dashboard/nodes', baseUrl]);
  }
}
