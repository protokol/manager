import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngxs/store';
import { SetCoreManagerPort } from '@core/store/network/networks.actions';
import { untilDestroyed } from '@core/until-destroyed';
import { switchMap, tap } from 'rxjs/operators';
import { NodeManagerService } from '@core/services/node-manager.service';
import { Router } from '@angular/router';
import { UpdateMyNode } from '@core/store/nodes/nodes.actions';
import { NodeManagerLoginSettingsEnum } from '../../interfaces/node.types';
import { NodesState } from '@core/store/nodes/nodes.state';
import { ManagerCurrSet } from '@core/store/manager-authentication/manager-authentication.actions';
import { NodeManagerFormInterface } from '@app/@shared/interfaces/node-shared.types';
import { DEFAULT_CORE_MANAGER_PORT } from '@core/constants/node.constants';
import { NetworkUtils } from '@core/utils/network-utils';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-node-manager-settings-modal',
  templateUrl: './node-manager-settings-modal.component.html',
  styleUrls: ['./node-manager-settings-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeManagerSettingsModalComponent implements OnInit, OnDestroy {
  @Input() managerUrl: string = undefined;
  @Input() nodeUrl: string = undefined;

  managerSettingsForm!: FormGroup;

  isLoading$ = new BehaviorSubject(false);

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private nodeManagerService: NodeManagerService,
    private nzModalRef: NzModalRef,
    private router: Router,
    private nzMessageService: NzMessageService
  ) {
    this.createForm();
  }

  ngOnInit(): void {}

  private createForm() {
    this.managerSettingsForm = this.formBuilder.group({
      coreManagerAuth: [],
    });
    this.c('coreManagerAuth').setValue({
      loginType: NodeManagerLoginSettingsEnum.None,
      port: DEFAULT_CORE_MANAGER_PORT,
      loginPassword: '',
      loginUsername: '',
      secretToken: '',
    } as NodeManagerFormInterface);
  }

  c(controlName: string): AbstractControl {
    return this.managerSettingsForm.controls[controlName];
  }

  onManagerSettingsFormSubmit(event: MouseEvent) {
    event.preventDefault();

    if (this.isLoading$.getValue()) {
      return;
    }

    const {
      coreManagerAuth: {
        port,
        secretToken,
        loginUsername,
        loginPassword,
        loginType,
      },
    } = this.managerSettingsForm.value;

    this.isLoading$.next(true);

    const nodeManagerAuthentication = {
      ...(loginType === NodeManagerLoginSettingsEnum.Token
        ? { token: secretToken }
        : {}),
      ...(loginType === NodeManagerLoginSettingsEnum.Basic
        ? {
            basic: {
              username: loginUsername,
              password: loginPassword,
            },
          }
        : {}),
    };

    this.nodeManagerService
      .infoCoreVersion(
        NetworkUtils.buildNodeManagerUrl(this.managerUrl, port),
        nodeManagerAuthentication
      )
      .pipe(
        untilDestroyed(this),
        switchMap(() =>
          this.store.dispatch(
            new ManagerCurrSet(nodeManagerAuthentication, port)
          )
        ),
        tap(() => {
          const node = this.store.selectSnapshot(
            NodesState.getNodeByUrl(this.nodeUrl)
          );
          if (!node) {
            this.store.dispatch(new SetCoreManagerPort(port));
          } else {
            this.store.dispatch(
              new UpdateMyNode(
                {
                  coreManagerAuth: nodeManagerAuthentication,
                  coreManagerPort: port,
                },
                { nodeUrl: this.nodeUrl }
              )
            );
          }
        }),
        tap(
          () => {
            this.router.navigate([
              '/dashboard/nodes/manager',
              NetworkUtils.buildNodeManagerUrl(this.managerUrl, port),
            ]);
            this.nzMessageService.success('Core manager connected!');
            this.nzModalRef.destroy();
          },
          () => {
            this.nzMessageService.error(
              `Core manager not available on port:"${port}"!`
            );
            this.isLoading$.next(false);
          }
        )
      )
      .subscribe();
  }

  ngOnDestroy(): void {}
}
