import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NodeManagerService } from '@core/services/node-manager.service';
import { untilDestroyed } from '@core/until-destroyed';
import { Select } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import { Observable, of } from 'rxjs';
import { CoreManagerVersionResponse } from '@core/interfaces/core-manager.types';

@Component({
  selector: 'app-node-manager-details',
  templateUrl: './node-manager-details.component.html',
  styleUrls: ['./node-manager-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeManagerDetailsComponent implements OnInit, OnDestroy {
  descriptionColumns = { xxl: 2, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 };

  @Select(NetworksState.getNodeManagerUrl()) nodeManagerUrl$;

  infoCoreVersion$: Observable<CoreManagerVersionResponse['result']> = of(null);

  constructor(private nodeManagerService: NodeManagerService) {
    this.infoCoreVersion$ = this.nodeManagerService
      .infoCoreVersion()
      .pipe(untilDestroyed(this));
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
