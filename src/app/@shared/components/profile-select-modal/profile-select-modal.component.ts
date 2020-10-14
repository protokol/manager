import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit, TemplateRef, ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { FormUtils } from '@core/utils/form-utils';
import { Logger } from '@core/services/logger.service';
import { Select, Store } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { ProfileWithId } from '@core/interfaces/profiles.types';
import { untilDestroyed } from '@core/until-destroyed';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs/operators';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { NetworkUtils } from '@core/utils/network-utils';
import { NodeClientService } from '@core/services/node-client.service';
import { SetSelectedProfile } from '@core/store/profiles/profiles.actions';
import { SetPinAction } from '@core/store/pins/pins.actions';
import { StoreUtilsService } from '@core/store/store-utils.service';
import { SetNetwork } from '@core/store/network/networks.actions';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-asset-create-modal',
  templateUrl: './profile-select-modal.component.html',
  styleUrls: ['./profile-select-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileSelectModalComponent implements OnInit, OnDestroy {
  log: Logger = new Logger(this.constructor.name);

  profileForm!: FormGroup;

  isLoading$ = new BehaviorSubject(false);
  isPinInvalid$ = new BehaviorSubject(false);

  @Select(ProfilesState.getProfiles) profiles$: Observable<ProfileWithId[]>;
  cryptoConfig$: Observable<NodeCryptoConfiguration | null> = of(null);

  @Input() profileId = '';

  @ViewChild('modalTitleTpl', { static: true })
  modalTitleTpl!: TemplateRef<{}>;

  constructor(
    private formBuilder: FormBuilder,
    private modalRef: NzModalRef,
    private store: Store,
    private nodeClientService: NodeClientService,
    private nzMessageService: NzMessageService,
    private storeUtilsService: StoreUtilsService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // TODO: ExpressionChangedAfterItHasBeenCheckedError thrown
    setTimeout(() => {
      this.modalRef.updateConfig({
        nzTitle: this.modalTitleTpl,
        nzWidth: '30vw',
      });
      this.cd.markForCheck();
    });

    this.createForm();
    this.registerFormListeners();
  }

  createForm() {
    this.profileForm = this.formBuilder.group({
      profileId: [this.profileId, Validators.required],
      pin: ['', Validators.required],
    });
  }

  c(controlName: string) {
    return this.profileForm.controls[controlName];
  }

  onCancel() {
    this.modalRef.destroy();
  }

  selectProfile(event: MouseEvent, cryptoConfig: NodeCryptoConfiguration) {
    event.preventDefault();

    if (this.isLoading$.getValue() || !cryptoConfig) {
      return;
    }

    if (!this.profileForm.valid) {
      FormUtils.markFormGroupDirty(this.profileForm);
      return;
    }

    this.isLoading$.next(true);
    this.profileForm.disable();

    const { profileId, pin } = this.profileForm.value;

    this.storeUtilsService
      .isPinForProfileValid(profileId, pin, cryptoConfig.network)
      .pipe(
        untilDestroyed(this),
        finalize(() => {
          this.profileForm.enable();
          this.isLoading$.next(false);
        }),
        tap((isValidPin) => {
          if (isValidPin) {
            this.store.dispatch(new SetSelectedProfile(profileId));
            this.store.dispatch(new SetPinAction(profileId, pin));
            const nodeBaseUrl = this.store.selectSnapshot(
              ProfilesState.getProfileById(profileId)
            ).nodeBaseUrl;
            this.store.dispatch(new SetNetwork(nodeBaseUrl));
            this.modalRef.destroy();
          } else {
            this.isPinInvalid$.next(true);
          }
        })
      )
      .subscribe();
  }

  private registerFormListeners() {
    this.cryptoConfig$ = this.c('profileId').valueChanges.pipe(
      untilDestroyed(this),
      startWith(this.profileId),
      map((profileId) => {
        return this.store.selectSnapshot(
          ProfilesState.getProfileById(profileId)
        )?.nodeBaseUrl;
      }),
      distinctUntilChanged(),
      switchMap((baseUrl) => {
        if (!baseUrl) {
          return of(null);
        }

        return this.nodeClientService.getNodeCryptoConfiguration(baseUrl).pipe(
          map((nodeCryptoConfiguration) => {
            if (
              NetworkUtils.isNodeCryptoConfiguration(nodeCryptoConfiguration)
            ) {
              return nodeCryptoConfiguration;
            }
            return null;
          }),
          catchError((err) => {
            this.log.error(err);
            this.nzMessageService.error(
              'Node for selected profile is unresponsive!'
            );
            return of(null);
          })
        );
      })
    );
  }

  ngOnDestroy() {}
}
