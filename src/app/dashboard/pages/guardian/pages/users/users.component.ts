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
  distinctUntilChanged,
  filter, finalize,
  switchMap,
  takeUntil,
  tap
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
import { GuardianState } from '@app/dashboard/pages/guardian/state/guardian/guardian.state';
import {
  LoadGuardianGroup,
  LoadGuardianUser,
  LoadGuardianUsers
} from '@app/dashboard/pages/guardian/state/guardian/guardian.actions';
import { ModalUtils } from '@core/utils/modal-utils';
import { RefreshModalResponse } from '@core/interfaces/refresh-modal.response';
import { GuardianUserModalComponent } from '@app/dashboard/pages/guardian/components/guardian-user-modal/guardian-user-modal.component';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { GuardianGroupModalComponent } from '@app/dashboard/pages/guardian/components/guardian-group-modal/guardian-group-modal.component';

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
  onGroupLoading$ = new BehaviorSubject(false);
  searchTerm$ = new BehaviorSubject('');

  getBaseUrl$: Observable<string>;
  rows$: Observable<GuardianResourcesTypes.User[]> = of([]);
  tableColumns: TableColumnConfig<GuardianResourcesTypes.User>[];

  @ViewChild('actionTpl', { static: true }) actionTpl!: TemplateRef<{
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
        width: '500px'
      },
      {
        headerName: 'User groups',
        columnTransformTpl: this.groupsTpl,
        width: '500px'
      },
      {
        headerName: 'Actions',
        columnTransformTpl: this.actionTpl,
        width: '75px'
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

    const createUserModalRef = this.nzModalService.create<
      GuardianUserModalComponent,
      RefreshModalResponse
    >({
      nzContent: GuardianUserModalComponent,
      ...ModalUtils.getCreateModalDefaultConfig(),
    });

    createUserModalRef.afterClose
      .pipe(
        takeUntil(this.actions$.pipe(ofActionDispatched(LoadGuardianUsers))),
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

  onPermissionsChange(event: MouseEvent, user: GuardianResourcesTypes.User) {
    event.preventDefault();

    const editUserModalRef = this.nzModalService.create<GuardianUserModalComponent,
      RefreshModalResponse>({
      nzContent: GuardianUserModalComponent,
      nzComponentParams: {
        user
      },
      ...ModalUtils.getCreateModalDefaultConfig()
    });

    editUserModalRef.afterClose
      .pipe(
        tap((response) => {
          const refresh = (response && response.refresh) || false;
          if (refresh) {
            const { publicKey } = user;
            this.store.dispatch(new LoadGuardianUser(publicKey));
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  onEditGroup(event: MouseEvent, groupName: string) {
    event.preventDefault();

    this.onGroupLoading$.next(true);

    this.store.dispatch(new LoadGuardianGroup(groupName))
      .pipe(
        tap(() => {
          const groups = this.store.selectSnapshot(
            GuardianState.getGuardianGroupsByIds([groupName])
          );
          const [group] = groups;

          const editGroupModalRef = this.nzModalService.create<GuardianGroupModalComponent,
            RefreshModalResponse>({
            nzContent: GuardianGroupModalComponent,
            nzComponentParams: {
              group
            },
            ...ModalUtils.getCreateModalDefaultConfig()
          });

          editGroupModalRef.afterClose
            .pipe(
              tap((response) => {
                if (response?.refresh) {
                  this.onGroupLoading$.next(false);
                }
              }),
              tap((response) => {
                if (response?.refresh) {
                  const { name } = group;
                  this.store.dispatch(new LoadGuardianGroup(name))
                    .pipe(
                      finalize(() => this.onGroupLoading$.next(false)),
                      untilDestroyed(this)
                    ).subscribe();
                }
              }),
              untilDestroyed(this)
            )
            .subscribe();
        })
      )
      .subscribe();
  }
}
