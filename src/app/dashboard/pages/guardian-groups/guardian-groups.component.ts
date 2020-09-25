import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Actions, ofActionDispatched, Select, Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import {
  defaultIfEmpty,
  delay,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import {
  PaginationMeta,
  TableColumnConfig,
} from '@app/@shared/interfaces/table.types';
import { Logger } from '@app/@core/services/logger.service';
import { GuardianResourcesTypes } from '@protokol/client';
import { StoreUtilsService } from '@core/store/store-utils.service';
import {
  NzMessageService,
  NzModalService,
  NzNotificationService,
  NzSwitchComponent,
  NzTableQueryParams,
} from 'ng-zorro-antd';
import { GuardianGroupsState } from '@app/dashboard/pages/guardian-groups/state/guardian-groups/guardian-groups.state';
import {
  LoadGuardianGroup,
  LoadGuardianGroups,
} from '@app/dashboard/pages/guardian-groups/state/guardian-groups/guardian-groups.actions';
import { CryptoService } from '@core/services/crypto.service';
import { ModalUtils } from '@core/utils/modal-utils';
import { GuardianGroupModalComponent } from './components/guardian-group-modal/guardian-group-modal.component';
import { CreateModalResponse } from '@core/interfaces/create-modal.response';

@Component({
  selector: 'app-guardian-groups',
  templateUrl: './guardian-groups.component.html',
  styleUrls: ['./guardian-groups.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuardianGroupsComponent implements OnInit, OnDestroy {
  readonly log = new Logger(this.constructor.name);

  @Select(GuardianGroupsState.getGuardianGroupIds)
  guardianGroupIds$: Observable<string[]>;
  @Select(GuardianGroupsState.getMeta) meta$: Observable<PaginationMeta>;

  isLoading$ = new BehaviorSubject(false);
  searchTerm$ = new BehaviorSubject('');
  rowsLoading$: BehaviorSubject<{
    [name: string]: boolean;
  }> = new BehaviorSubject({});

  getBaseUrl$: Observable<string>;
  rows$: Observable<GuardianResourcesTypes.Group[]> = of([]);
  tableColumns: TableColumnConfig<GuardianResourcesTypes.Group>[];

  @ViewChild('permissionsTpl', { static: true }) permissionsTpl!: TemplateRef<{
    row: GuardianResourcesTypes.Group;
  }>;
  @ViewChild('defaultTpl', { static: true }) defaultTpl!: TemplateRef<{
    row: GuardianResourcesTypes.Group;
  }>;
  @ViewChild('activeTpl', { static: true }) activeTpl!: TemplateRef<{
    row: GuardianResourcesTypes.Group;
  }>;

  constructor(
    private store: Store,
    private storeUtilsService: StoreUtilsService,
    private cryptoService: CryptoService,
    private nzMessageService: NzMessageService,
    private nzNotificationService: NzNotificationService,
    private cd: ChangeDetectorRef,
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
        propertyName: 'name',
        headerName: 'Group Name',
        sortBy: true,
      },
      {
        propertyName: 'priority',
        headerName: 'Priority',
        sortBy: true,
      },
      {
        headerName: 'Default',
        columnTransformTpl: this.defaultTpl,
      },
      {
        headerName: 'Active',
        columnTransformTpl: this.activeTpl,
      },
      {
        headerName: 'Permissions',
        columnTransformTpl: this.permissionsTpl,
      },
    ];

    this.rows$ = this.guardianGroupIds$.pipe(
      distinctUntilChanged(),
      switchMap((guardianGroupIds) =>
        this.store.select(
          GuardianGroupsState.getGuardianGroupsByIds(guardianGroupIds)
        )
      ),
      tap(() => this.isLoading$.next(false))
    );

    this.getBaseUrl$ = this.store.select(NetworksState.getBaseUrl).pipe(
      filter((baseUrl) => !!baseUrl),
      tap(() => this.isLoading$.next(true)),
      tap(() => this.store.dispatch(new LoadGuardianGroups()))
    );
  }

  paginationChange(params: NzTableQueryParams) {
    this.log.info(params);
    this.store.dispatch(new LoadGuardianGroups());
  }

  ngOnDestroy() {}

  showAddGroupModal(event: MouseEvent) {
    event.preventDefault();

    const createGroupModalRef = this.nzModalService.create<
      GuardianGroupModalComponent,
      CreateModalResponse
    >({
      nzContent: GuardianGroupModalComponent,
      ...ModalUtils.getCreateModalDefaultConfig(),
    });

    createGroupModalRef.afterClose
      .pipe(
        takeUntil(this.actions$.pipe(ofActionDispatched(LoadGuardianGroups))),
        delay(8000),
        tap((response) => {
          const refresh = (response && response.refresh) || false;
          if (refresh) {
            this.store.dispatch(new LoadGuardianGroups());
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  onPermissionsChange(event: MouseEvent, group: GuardianResourcesTypes.Group) {
    event.preventDefault();

    this.nzModalService.create({
      nzContent: GuardianGroupModalComponent,
      nzComponentParams: {
        group,
      },
      ...ModalUtils.getCreateModalDefaultConfig(),
    });
  }

  onSetRowLoading(
    name: string,
    isLoading: boolean,
    switchCmp?: NzSwitchComponent
  ) {
    this.rowsLoading$.next({
      ...this.rowsLoading$.getValue(),
      [name]: isLoading,
    });
    if (switchCmp) {
      switchCmp.nzLoading = isLoading;
    }
    this.cd.markForCheck();
  }

  onGetRowLoading(groupName: string): Observable<boolean> {
    return this.rowsLoading$.asObservable().pipe(
      map((rowsLoading) => {
        return rowsLoading[groupName] || false;
      })
    );
  }

  onGroupDefaultUpdate(
    isDefault: boolean,
    group: GuardianResourcesTypes.Group,
    defaultSwitchCmp: NzSwitchComponent,
    isLoading: boolean
  ) {
    const { name } = group;
    if (isLoading) {
      this.nzMessageService.warning(
        `Group “${name}” update in progress, please wait!`
      );
      return;
    }

    this.onSetRowLoading(name, true, defaultSwitchCmp);

    this.cryptoService
      .setGuardianGroupPermissions({
        ...group,
        default: isDefault,
      })
      .pipe(
        tap(
          () => {
            this.nzMessageService.success(`Group “${name}” updated!`);

            EMPTY.pipe(
              defaultIfEmpty(),
              delay(8000),
              switchMap(() =>
                this.store.dispatch(new LoadGuardianGroup(name)).pipe(
                  finalize(() => {
                    this.onSetRowLoading(name, false, defaultSwitchCmp);
                  })
                )
              ),
              untilDestroyed(this)
            ).subscribe();
          },
          (err) => {
            this.nzNotificationService.create(
              'error',
              `Group “${name}” failed to update!`,
              err
            );
            this.onSetRowLoading(name, false, defaultSwitchCmp);
          }
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }

  onGroupActiveUpdate(
    active: boolean,
    group: GuardianResourcesTypes.Group,
    activeSwitchCmp: NzSwitchComponent,
    isLoading: boolean
  ) {
    const { name } = group;
    if (isLoading) {
      this.nzMessageService.warning(
        `Group “${name}” update in progress, please wait!`
      );
      return;
    }

    this.onSetRowLoading(name, true, activeSwitchCmp);

    this.cryptoService
      .setGuardianGroupPermissions({
        ...group,
        active,
      })
      .pipe(
        tap(
          () => {
            this.nzMessageService.success(`Group “${name}” updated!`);

            EMPTY.pipe(
              defaultIfEmpty(),
              delay(8000),
              switchMap(() =>
                this.store.dispatch(new LoadGuardianGroup(name)).pipe(
                  finalize(() => {
                    this.onSetRowLoading(name, false, activeSwitchCmp);
                  })
                )
              ),
              untilDestroyed(this)
            ).subscribe();
          },
          (err) => {
            this.nzNotificationService.create(
              'error',
              `Group “${name}” failed to update!`,
              err
            );
            this.onSetRowLoading(name, false, activeSwitchCmp);
          }
        ),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
