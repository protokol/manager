import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import {
  delay,
  distinctUntilChanged,
  filter,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@shared/interfaces/table.types';
import { Logger } from '@core/services/logger.service';
import { GuardianResourcesTypes } from '@protokol/client';
import { StoreUtilsService } from '@core/store/store-utils.service';
import {
  NzModalService,
  NzTableQueryParams,
} from 'ng-zorro-antd';
import { GuardianState } from '@app/dashboard/pages/guardian/state/guardian/guardian.state';
import {
  LoadGuardianUsers
} from '@app/dashboard/pages/guardian/state/guardian/guardian.actions';
import { ModalUtils } from '@core/utils/modal-utils';
import { CreateModalResponse } from '@core/interfaces/create-modal.response';
import { GuardianUserModalComponent } from '@app/dashboard/pages/guardian/components/guardian-user-modal/guardian-user-modal.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Select(GuardianState.getGuardianUserPubKeys)
  guardianUserPubKeys$: Observable<string[]>;
  @Select(GuardianState.getGuardianUsersMeta) meta$: Observable<PaginationMeta>;

  isLoading$ = new BehaviorSubject(false);
  searchTerm$ = new BehaviorSubject('');

  getBaseUrl$: Observable<string>;
  rows$: Observable<GuardianResourcesTypes.User[]> = of([]);
  tableColumns: TableColumnConfig<GuardianResourcesTypes.User>[];

  @ViewChild('permissionsTpl', { static: true }) permissionsTpl!: TemplateRef<{
    row: GuardianResourcesTypes.User;
  }>;
  @ViewChild('publicKeyTpl', { static: true }) publicKeyTpl!: TemplateRef<{
    row: GuardianResourcesTypes.User;
  }>;
  @ViewChild('groupsTpl', { static: true }) groupsTpl!: TemplateRef<{
    row: GuardianResourcesTypes.User;
  }>;

  constructor(
    private store: Store,
    private storeUtilsService: StoreUtilsService,
    private nzModalService: NzModalService,
    private actions$: Actions
  ) {
    this.storeUtilsService
      .nftConfigurationGuard()
      .pipe(untilDestroyed(this))
      .subscribe();
  }

  ngOnInit() {
    this.tableColumns = [
      {
        propertyName: 'publicKey',
        headerName: 'Public Key',
        columnTransformTpl: this.publicKeyTpl,
        sortBy: true,
      },
      {
        headerName: 'User groups',
        columnTransformTpl: this.groupsTpl,
      },
      {
        headerName: 'Permissions',
        columnTransformTpl: this.permissionsTpl,
      },
    ];

    this.rows$ = this.guardianUserPubKeys$.pipe(
      distinctUntilChanged(),
      switchMap((guardianUserPubKeys) =>
        this.store.select(
          GuardianState.getGuardianUsersByPubKeys(guardianUserPubKeys)
        )
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.getBaseUrl$ = this.store.select(NetworksState.getBaseUrl).pipe(
      filter((baseUrl) => !!baseUrl),
      tap(() => this.isLoading$.next(true)),
      tap(() => this.store.dispatch(new LoadGuardianUsers()))
    );
  }

  paginationChange(params: NzTableQueryParams) {
    this.log.info(params);
    this.store.dispatch(new LoadGuardianUsers());
  }

  ngOnDestroy() {}

  showAddUserPermissionsModal(event: MouseEvent) {
    event.preventDefault();

    const createGroupModalRef = this.nzModalService.create<
      GuardianUserModalComponent,
      CreateModalResponse
    >({
      nzContent: GuardianUserModalComponent,
      ...ModalUtils.getCreateModalDefaultConfig(),
    });

    createGroupModalRef.afterClose
      .pipe(
        takeUntil(this.actions$.pipe(ofActionDispatched(LoadGuardianUsers))),
        delay(8000),
        tap((response) => {
          const refresh = (response && response.refresh) || false;
          if (refresh) {
            this.store.dispatch(new LoadGuardianUsers());
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  onPermissionsChange(event: MouseEvent, group: GuardianResourcesTypes.Group) {
    event.preventDefault();

    this.nzModalService.create({
      nzContent: GuardianUserModalComponent,
      nzComponentParams: {
        group,
      },
      ...ModalUtils.getCreateModalDefaultConfig(),
    });
  }

  onEditGroup(event: MouseEvent, groupName: string) {
    event.preventDefault();

    this.log.info('groupName', groupName);
  }
}
