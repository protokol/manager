import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngxs/store';
import { SetCoreManagerPort } from '@core/store/network/networks.actions';
import { untilDestroyed } from '@core/until-destroyed';
import { switchMap, tap } from 'rxjs/operators';
import { NodeManagerService } from '@core/services/node-manager.service';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { UpdateMyNode } from '@core/store/nodes/nodes.actions';
import { NodeManagerLoginSettingsEnum } from '../../interfaces/node.types';
import { DEFAULT_CORE_MANAGER_PORT } from '@core/constants/node.constants';
import { NodesState } from '@core/store/nodes/nodes.state';
import { ManagerAuthenticationSet } from '@core/store/manager-authentication/manager-authentication.actions';

@Component({
  selector: 'app-node-manager-settings-modal',
  templateUrl: './node-manager-settings-modal.component.html',
  styleUrls: ['./node-manager-settings-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeManagerSettingsModalComponent implements OnInit, OnDestroy {
  NodeManagerLoginSettingsEnum = NodeManagerLoginSettingsEnum;

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
    this.registerFormListeners();
  }

  ngOnInit(): void {}

  private createForm() {
    this.managerSettingsForm = this.formBuilder.group({
      loginType: [NodeManagerLoginSettingsEnum.None, [Validators.required]],
      port: [
        DEFAULT_CORE_MANAGER_PORT,
        [Validators.required, Validators.min(1), Validators.max(65535)],
      ],
      secretToken: [''],
      loginUsername: [''],
      loginPassword: [''],
    });
  }

  c(controlName: string): AbstractControl {
    return this.managerSettingsForm.controls[controlName];
  }

  private registerFormListeners() {
    this.c('loginType')
      .valueChanges.pipe(
        untilDestroyed(this),
        tap((networkType: NodeManagerLoginSettingsEnum) => {
          if (networkType === NodeManagerLoginSettingsEnum.None) {
            this.c('secretToken').clearValidators();
            this.c('loginUsername').clearValidators();
            this.c('loginPassword').clearValidators();
          } else if (networkType === NodeManagerLoginSettingsEnum.Token) {
            this.c('secretToken').setValidators(Validators.required);
            this.c('loginUsername').clearValidators();
            this.c('loginPassword').clearValidators();
          } else if (networkType === NodeManagerLoginSettingsEnum.Basic) {
            this.c('secretToken').clearValidators();
            this.c('loginUsername').setValidators(Validators.required);
            this.c('loginPassword').setValidators(Validators.required);
          }
          this.c('secretToken').updateValueAndValidity();
          this.c('loginUsername').updateValueAndValidity();
          this.c('loginPassword').updateValueAndValidity();
        })
      )
      .subscribe();
  }

  onManagerSettingsFormSubmit(event: MouseEvent) {
    event.preventDefault();

    if (this.isLoading$.getValue()) {
      return;
    }

    const {
      port,
      secretToken,
      loginUsername,
      loginPassword,
      loginType,
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
      .infoCoreVersion(this.managerUrl, nodeManagerAuthentication)
      .pipe(
        untilDestroyed(this),
        switchMap(() =>
          this.store.dispatch(
            new ManagerAuthenticationSet(nodeManagerAuthentication)
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
            this.router.navigate(['/dashboard/nodes/manager', this.managerUrl]);
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
