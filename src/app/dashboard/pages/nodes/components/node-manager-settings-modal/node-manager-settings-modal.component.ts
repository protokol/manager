import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngxs/store';
import { SetCoreManagerPort } from '@core/store/network/networks.actions';
import { untilDestroyed } from '@core/until-destroyed';
import { tap } from 'rxjs/operators';
import { NodeManagerService } from '@core/services/node-manager.service';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { UpdateMyNode } from '@core/store/nodes/nodes.actions';

@Component({
  selector: 'app-node-manager-settings-modal',
  templateUrl: './node-manager-settings-modal.component.html',
  styleUrls: ['./node-manager-settings-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NodeManagerSettingsModalComponent implements OnInit, OnDestroy {
  @Input() managerUrl: string = undefined;

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
      port: [
        '',
        [Validators.required, Validators.min(1), Validators.max(65535)],
      ],
    });
  }

  onManagerSettingsFormSubmit(event: MouseEvent) {
    event.preventDefault();

    if (this.isLoading$.getValue()) {
      return;
    }

    const { port } = this.managerSettingsForm.value;

    if (!this.managerUrl) {
      this.store.dispatch(new SetCoreManagerPort(port));
    } else {
      this.store.dispatch(
        new UpdateMyNode(
          { coreManagerPort: port },
          { nodeUrl: this.managerUrl }
        )
      );
    }

    this.isLoading$.next(true);
    this.nodeManagerService
      .infoCoreVersion()
      .pipe(
        untilDestroyed(this),
        tap(
          () => {
            this.router.navigate(['/dashboard/nodes/manager']);
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
