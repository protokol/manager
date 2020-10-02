import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { GuardianResourcesTypes } from '@protokol/client';
import { untilDestroyed } from '@core/until-destroyed';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Store } from '@ngxs/store';
import { NzModalRef } from 'ng-zorro-antd/modal';
import {
  LoadGuardianGroupUsers
} from '@app/dashboard/pages/guardian/state/guardian/guardian.actions';
import { GuardianState } from '@app/dashboard/pages/guardian/state/guardian/guardian.state';
import { TableColumnConfig } from '@shared/interfaces/table.types';

@Component({
  selector: 'app-guardian-group-users-modal',
  templateUrl: './guardian-group-users-modal.component.html',
  styleUrls: ['./guardian-group-users-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuardianGroupUsersModalComponent implements OnInit, OnDestroy {
  isViewReady$ = new BehaviorSubject(false);
  group$ = new BehaviorSubject<GuardianResourcesTypes.Group | null>(null);
  rows$: Observable<GuardianResourcesTypes.User[]> = of([]);
  tableColumns: TableColumnConfig<GuardianResourcesTypes.User>[];

  group?: GuardianResourcesTypes.Group;

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;
  @ViewChild('publicKeyTpl', { static: true }) publicKeyTpl!: TemplateRef<{
    row: GuardianResourcesTypes.User;
  }>;
  @ViewChild('groupsTpl', { static: true }) groupsTpl!: TemplateRef<{
    row: GuardianResourcesTypes.User;
  }>;

  constructor(
    private nzModalRef: NzModalRef,
    private cd: ChangeDetectorRef,
    private store: Store
  ) {
  }

  ngOnInit(): void {
    this.group$.next(this.group);

    this.tableColumns = [
      {
        propertyName: 'publicKey',
        headerName: 'Public Key',
        columnTransformTpl: this.publicKeyTpl
      },
      {
        headerName: 'User groups',
        columnTransformTpl: this.groupsTpl,
      },
    ];

    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.nzModalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzFooter: null,
        nzWidth: '50vw'
      });
      this.cd.markForCheck();
    });

    const { name } = this.group;

    this.rows$ = this.store
      .select(GuardianState.getGuardianGroupUsersByGroupName(name))
      .pipe(
        filter(users => !!users),
        switchMap((guardianUserPubKeys) =>
          this.store.select(
            GuardianState.getGuardianUsersByPubKeys(guardianUserPubKeys)
          )
        ),
        filter(users => users.every(u => u !== null)),
        tap(() => {
          if (!this.isViewReady$.getValue()) {
            this.isViewReady$.next(true);
          }
        }),
        untilDestroyed(this)
      );

    this.store.dispatch(new LoadGuardianGroupUsers(name));
  }

  ngOnDestroy(): void {}
}
