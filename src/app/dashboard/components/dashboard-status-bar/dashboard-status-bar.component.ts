import {
  ChangeDetectionStrategy,
  Component, OnDestroy, OnInit
} from '@angular/core';
import { Select } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { ProfileWithId } from '@core/interfaces/profiles.types';
import { NetworksState } from '@core/store/network/networks.state';
import { Router } from '@angular/router';
import { ProfileSelectModalComponent } from '@shared/components/profile-select-modal/profile-select-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { environment } from '@env/environment';
import { exhaustMap, tap } from 'rxjs/operators';
import { BlockchainService } from '@core/services/blockchain.service';
import { untilDestroyed } from '@core/until-destroyed';

const { shell } = window.require('electron');

@Component({
  selector: 'app-dashboard-status-bar',
  templateUrl: './dashboard-status-bar.component.html',
  styleUrls: ['./dashboard-status-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardStatusBarComponent implements OnInit, OnDestroy {
  @Select(ProfilesState.getProfiles) profiles$: Observable<ProfileWithId[]>;
  @Select(NetworksState.getBaseUrl) getBaseUrl$: Observable<string>;
  @Select(ProfilesState.getSelectedProfile) selectedProfile$: Observable<ProfileWithId>;

  timer1$;
  lastBlockHeight$ = new BehaviorSubject<number | null>(null);

  constructor(private router: Router, private nzModalService: NzModalService, private blockchainService: BlockchainService) {
  }

  ngOnInit(): void {
    this.timer1$ = timer(0, 8000)
      .pipe(
        untilDestroyed(this),
        exhaustMap(() =>
          this.blockchainService
            .getLastBlock()
            .pipe(
              untilDestroyed(this),
              tap(({ height }) => this.lastBlockHeight$.next(height))
            )
        )
      )
      .subscribe();
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
    this.timer1$.unsubscribe();
  }
}
