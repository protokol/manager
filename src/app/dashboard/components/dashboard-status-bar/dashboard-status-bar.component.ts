import {
  ChangeDetectionStrategy,
  Component, OnDestroy, OnInit
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { Observable } from 'rxjs';
import { ProfileWithId } from '@core/interfaces/profiles.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Router } from '@angular/router';
import { ProfileSelectModalComponent } from '@shared/components/profile-select-modal/profile-select-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { environment } from '@env/environment';
import { LastBlockStartPooling, LastBlockStopPooling } from '@core/store/network/networks.actions';

const { shell } = window.require('electron');

@Component({
  selector: 'app-dashboard-status-bar',
  templateUrl: './dashboard-status-bar.component.html',
  styleUrls: ['./dashboard-status-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardStatusBarComponent implements OnInit, OnDestroy {
  @Select(ProfilesState.getProfiles) profiles$: Observable<ProfileWithId[]>;
  @Select(ProfilesState.getSelectedProfile) selectedProfile$: Observable<ProfileWithId>;
  @Select(NetworksState.getBaseUrl) getBaseUrl$: Observable<string>;
  @Select(NetworksState.getLastBlockHeight) lastBlockHeight$: Observable<number | null>;

  constructor(
    private router: Router,
    private nzModalService: NzModalService,
    private store: Store) {
  }

  ngOnInit(): void {
    this.store.dispatch(new LastBlockStartPooling());
  }

  onProfileSelect(event: MouseEvent, profileId: string) {
    event.preventDefault();

    this.nzModalService.create({
      nzContent: ProfileSelectModalComponent,
      nzComponentParams: {
        profileId
      },
      nzFooter: null
    });
  }

  manageNode(event: MouseEvent, baseUrl: string) {
    event.preventDefault();

    this.router.navigate(['/dashboard/nodes', baseUrl]);
  }

  get appVersion() {
    return environment.version;
  }

  onNavigateToReleases(event: MouseEvent) {
    event.preventDefault();

    const releasesUrl = environment.links
      .find(({ key }) => key === 'PROTOKOL-MANAGER-RELEASES')?.url;
    shell.openExternal(releasesUrl);
  }

  ngOnDestroy(): void {
    this.store.dispatch(new LastBlockStopPooling());
  }
}
