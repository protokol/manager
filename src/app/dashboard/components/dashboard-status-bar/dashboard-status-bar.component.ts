import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { Select } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { Observable } from 'rxjs';
import { ProfileWithId } from '@core/interfaces/profiles.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Router } from '@angular/router';
import { ProfileSelectModalComponent } from '@shared/components/profile-select-modal/profile-select-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-dashboard-status-bar',
  templateUrl: './dashboard-status-bar.component.html',
  styleUrls: ['./dashboard-status-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardStatusBarComponent {
  @Select(ProfilesState.getProfiles) profiles$: Observable<ProfileWithId[]>;
  @Select(NetworksState.getBaseUrl) getBaseUrl$: Observable<string>;
  @Select(ProfilesState.getSelectedProfile) selectedProfile$: Observable<
    ProfileWithId
  >;

  constructor(private router: Router, private nzModalService: NzModalService) {}

  onProfileSelect(event: MouseEvent, profileId: string) {
    event.preventDefault();

    this.nzModalService.create({
      nzContent: ProfileSelectModalComponent,
      nzComponentParams: {
        profileId,
      },
      nzFooter: null,
    });
  }

  manageNode(event: MouseEvent, baseUrl: string) {
    event.preventDefault();

    this.router.navigate(['/dashboard/nodes', baseUrl]);
  }
}
