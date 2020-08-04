import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Logger } from '@core/services/logger.service';
import {
  BehaviorSubject,
  combineLatest,
  Observable,
  of,
  throwError,
} from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { FormUtils } from '@core/utils/form-utils';
import { NodesState } from '@core/store/nodes/nodes.state';
import { MyNode } from '@core/interfaces/node.types';
import { Router } from '@angular/router';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { DEFAULT_CORE_MANAGER_PORT } from '@core/constants/node.constants';
import { untilDestroyed } from '@core/until-destroyed';
import { catchError, finalize, first, map, switchMap } from 'rxjs/operators';
import { NetworkUtils } from '@core/utils/network-utils';
import { NodeClientService } from '@core/services/node-client.service';
import { AddMyNode } from '@core/store/nodes/nodes.actions';

@Component({
  selector: 'app-my-nodes-update-modal',
  templateUrl: './my-nodes-update-modal.component.html',
  styleUrls: ['./my-nodes-update-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyNodesUpdateModalComponent implements OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Input()
  set managerUrl(managerUrl: string) {
    this.selectedNodeUrl$.next(managerUrl);
  }

  isSelectMyNodeFormDirty$ = new BehaviorSubject(false);
  selectMyNodeForm!: FormGroup;
  addMyNodeForm!: FormGroup;

  isLoading$ = new BehaviorSubject(false);

  @Select(NodesState.getNodes) myNodes$: Observable<MyNode[]>;
  selectedNodeUrl$ = new BehaviorSubject('');

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private modalRef: NzModalRef,
    private nodeClientService: NodeClientService,
    private messageService: NzMessageService,
    private store: Store
  ) {
    this.createSelectMyNodeForm();
    this.createAddMyNodeForm();
  }

  private createSelectMyNodeForm() {
    this.selectMyNodeForm = this.formBuilder.group({
      nodeUrl: [this.managerUrl, Validators.required],
    });
  }

  nodeAsyncValidator = (
    control: FormControl
  ): Observable<ValidationErrors | null> =>
    combineLatest([
      this.store.select(NodesState.getNodeByUrl(`http://${control.value}`)),
      this.store.select(NodesState.getNodeByUrl(`https://${control.value}`)),
    ]).pipe(
      untilDestroyed(this),
      first(),
      map(([node1, node2]) => {
        if (node1 || node2) {
          return { error: true, duplicated: true };
        }
        return null;
      })
      // tslint:disable-next-line:semicolon
    );

  private createAddMyNodeForm() {
    this.addMyNodeForm = this.formBuilder.group({
      nodeUrl: ['', [Validators.required], [this.nodeAsyncValidator]],
      nodeUrlProtocol: ['http://', Validators.required],
      port: [
        DEFAULT_CORE_MANAGER_PORT,
        [Validators.required, Validators.min(1), Validators.max(65535)],
      ],
    });
  }

  n(controlName: string) {
    return this.selectMyNodeForm.controls[controlName];
  }

  an(controlName: string) {
    return this.addMyNodeForm.controls[controlName];
  }

  selectNode(event) {
    if (event) {
      event.preventDefault();
    }

    if (!this.selectMyNodeForm.valid) {
      FormUtils.markFormGroupTouched(this.selectMyNodeForm);
      this.isSelectMyNodeFormDirty$.next(true);
      return;
    }

    this.modalRef.close();

    const { nodeUrl } = this.selectMyNodeForm.value;

    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => this.router.navigate(['/dashboard/nodes', nodeUrl]));
  }

  ngOnDestroy(): void {}

  addNode(event) {
    if (event) {
      event.preventDefault();
    }

    if (this.isLoading$.getValue()) {
      return;
    }

    if (!this.addMyNodeForm.valid) {
      FormUtils.markFormGroupTouched(this.addMyNodeForm);
      return;
    }

    this.isLoading$.next(true);

    const { nodeUrl, nodeUrlProtocol, port } = this.addMyNodeForm.value;
    const nodeBaseUrl = `${nodeUrlProtocol}${nodeUrl}`;

    this.nodeClientService
      .getNodeCryptoConfiguration(nodeBaseUrl)
      .pipe(
        switchMap((cryptoConfig) => {
          if (!NetworkUtils.isNodeCryptoConfiguration(cryptoConfig)) {
            return throwError(
              'Invalid node crypto configuration, check if node is online!'
            );
          }

          this.store.dispatch(
            new AddMyNode({ nodeUrl: nodeBaseUrl, coreManagerPort: port })
          );
          this.an('nodeUrl').reset();
          this.an('port').reset(DEFAULT_CORE_MANAGER_PORT);

          return of(cryptoConfig);
        }),
        catchError((err) => {
          this.log.error(err);
          this.messageService.error(err);
          return of(null);
        }),
        finalize(() => this.isLoading$.next(false)),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
