import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { BehaviorSubject, Observable } from 'rxjs';
import { ClearPinsAction } from '@core/store/pins/pins.actions';
import { Router } from '@angular/router';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { ProfileWithId } from '@core/interfaces/profiles.types';
import { NetworksState } from '@core/store/network/networks.state';
import { untilDestroyed } from '@core/until-destroyed';
import { take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-shell',
  templateUrl: './dashboard-shell.component.html',
  styleUrls: ['./dashboard-shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShellComponent implements OnInit, OnDestroy {
  @Select(ProfilesState.getSelectedProfile) selectedProfile$: Observable<
    ProfileWithId
  >;
  @Select(NetworksState.hasNftPluginsLoaded) hasNftPluginsLoaded$: Observable<
    ReturnType<typeof NetworksState.hasNftPluginsLoaded>
  >;
  isCollapsed$ = new BehaviorSubject(false);

  constructor(
    private store: Store,
    private router: Router,
    private actions$: Actions
  ) {}

  ngOnInit(): void {}

  onSignOut(event: MouseEvent) {
    event.preventDefault();

    this.actions$
      .pipe(
        untilDestroyed(this),
        ofActionSuccessful(ClearPinsAction),
        take(1),
        tap(() => this.router.navigate(['/auth']))
      )
      .subscribe();

    this.store.dispatch(new ClearPinsAction());
  }

  ngOnDestroy(): void {}

  toggleCollapsed() {
    this.isCollapsed$.next(!this.isCollapsed$.getValue());
  }
}
