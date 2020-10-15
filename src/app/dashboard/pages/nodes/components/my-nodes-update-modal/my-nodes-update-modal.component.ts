import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  Input,
  OnDestroy, OnInit, TemplateRef, ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Logger } from '@core/services/logger.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { NodesState } from '@core/store/nodes/nodes.state';
import { MyNode } from '@core/interfaces/node.types';
import { Router } from '@angular/router';
import { MyNodesCreateModalComponent } from '@app/@shared/components/my-nodes-create-modal/my-nodes-create-modal.component';
import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-my-nodes-update-modal',
  templateUrl: './my-nodes-update-modal.component.html',
  styleUrls: ['./my-nodes-update-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyNodesUpdateModalComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Input()
  set managerUrl(managerUrl: string) {
    this.selectedNodeUrl$.next(managerUrl);
  }

  selectMyNodeForm!: FormGroup;
  addMyNodeForm!: FormGroup;

  isLoading$ = new BehaviorSubject(false);

  @Select(NodesState.getNodes) myNodes$: Observable<MyNode[]>;
  selectedNodeUrl$ = new BehaviorSubject('');

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private modalRef: NzModalRef,
    private nzModalService: NzModalService,
    private cd: ChangeDetectorRef
  ) {
    this.createSelectMyNodeForm();
  }

  ngOnInit(): void {
    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.modalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzWidth: '35vw',
      });
      this.cd.markForCheck();
    });
  }

  private createSelectMyNodeForm() {
    this.selectMyNodeForm = this.formBuilder.group({
      nodeUrl: ['', Validators.required],
    });
  }

  n(controlName: string) {
    return this.selectMyNodeForm.controls[controlName];
  }

  selectNode(event) {
    if (event) {
      event.preventDefault();
    }

    this.modalRef.close();

    const { nodeUrl } = this.selectMyNodeForm.value;

    this.router
      .navigateByUrl('/dashboard', { skipLocationChange: true })
      .then(() => this.router.navigate(['/dashboard/nodes', nodeUrl]));
  }

  ngOnDestroy(): void {}

  addNewNode(event: MouseEvent) {
    event.preventDefault();

    this.nzModalService.create({
      nzContent: MyNodesCreateModalComponent,
      nzFooter: null,
    });
  }
}
