import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { finalize, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable } from 'rxjs';
import { TableColumnConfig } from '@app/@shared/interfaces/table.types';
import { Logger } from '@app/@core/services/logger.service';
import { Router } from '@angular/router';
import { PeerUtils } from '@app/dashboard/pages/peers/utils/peer-utils';
import { NodesState } from '@core/store/nodes/nodes.state';
import { NetworkUtils } from '@core/utils/network-utils';
import { RemoveMyNodeByUrl } from '@core/store/nodes/nodes.actions';
import { NodeManagerSettingsModalComponent } from '@app/dashboard/pages/nodes/components/node-manager-settings-modal/node-manager-settings-modal.component';
import { NodeManagerService } from '@core/services/node-manager.service';
import { MyNode } from '@core/interfaces/node.types';
import { MyNodesCreateModalComponent } from '@app/@shared/components/my-nodes-create-modal/my-nodes-create-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-my-nodes',
  templateUrl: './my-nodes.component.html',
  styleUrls: ['./my-nodes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyNodesComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  PeerUtils = PeerUtils;

  @Select(NodesState.getNodes) myNodes$: Observable<MyNode[]>;

  @ViewChild('ipTpl', { static: true }) ipTpl!: TemplateRef<{
    row: MyNode;
  }>;
  @ViewChild('actionsTpl', { static: true }) actionsTpl!: TemplateRef<{
    row: MyNode;
  }>;

  isLoading$ = new BehaviorSubject(false);
  isLoadingNodeManager$ = new BehaviorSubject(false);

  tableColumns: TableColumnConfig<MyNode>[];

  constructor(
    private store: Store,
    private router: Router,
    private nzMessageService: NzMessageService,
    private nodeManagerService: NodeManagerService,
    private nzModalService: NzModalService
  ) {}

  ngOnInit() {
    this.tableColumns = [
      {
        propertyName: 'nodeUrl',
        headerName: 'Ip',
        columnTransformTpl: this.ipTpl,
        width: '150px',
      },
      {
        headerName: 'Actions',
        columnTransformTpl: this.actionsTpl,
        width: '150px',
      },
    ];
  }

  showConfig(event: MouseEvent, { nodeUrl }: MyNode) {
    event.preventDefault();

    this.router.navigate(['/dashboard/nodes', nodeUrl]);
  }

  ngOnDestroy() {}

  removeMyNode(event: MouseEvent, { nodeUrl }: MyNode) {
    event.preventDefault();

    this.store.dispatch(new RemoveMyNodeByUrl(nodeUrl));
  }

  private getPeerManagerUrl(nodeUrl: string): string {
    return (
      this.store.selectSnapshot(NodesState.getNodeManagerUrl(nodeUrl)) ||
      NetworkUtils.buildNodeManagerUrl(nodeUrl)
    );
  }

  managePeer(event: MouseEvent, { nodeUrl }: MyNode) {
    event.preventDefault();

    if (this.isLoadingNodeManager$.getValue()) {
      return;
    }

    const managerUrl = this.getPeerManagerUrl(nodeUrl);

    this.isLoadingNodeManager$.next(true);
    this.nodeManagerService
      .infoCoreVersion(managerUrl)
      .pipe(
        untilDestroyed(this),
        tap(
          () => {
            this.router.navigate(['/dashboard/nodes/manager', managerUrl]);
          },
          () => {
            this.nzMessageService.error('Core manager not available!');

            this.nzModalService.create({
              nzContent: NodeManagerSettingsModalComponent,
              nzComponentParams: {
                managerUrl,
                nodeUrl,
              },
              nzFooter: null,
            });
          }
        ),
        finalize(() => this.isLoadingNodeManager$.next(false))
      )
      .subscribe();
  }

  paginationChange(params: NzTableQueryParams) {
    this.log.info(params);
  }

  addMyNode(event: MouseEvent) {
    event.preventDefault();

    this.nzModalService.create({
      nzContent: MyNodesCreateModalComponent,
      nzFooter: null,
    });
  }
}
