import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { StoreUtilsService } from '@app/@core/store/store-utils.service';
import { NetworksState } from '@core/store/network/networks.state';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { distinctUntilChanged, finalize, map, tap } from 'rxjs/operators';
import { AddPinAction } from '@core/store/pins/pins.actions';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { ProfileWithId } from '@core/interfaces/profiles.types';
import { untilDestroyed } from '@core/until-destroyed';
import { ClearNetwork, SetNetwork } from '@core/store/network/networks.actions';
import { FormUtils } from '@core/utils/form-utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  error?: string;
  isLoading: boolean;
  isFormDirty = false;
  isPinInvalid = false;

  @Select(ProfilesState.getProfiles) profiles$: Observable<ProfileWithId[]>;
  @Select(NetworksState.getNodeCryptoConfig)
  cryptoConfig$: Observable<NodeCryptoConfiguration | null>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store,
    private storeUtilsService: StoreUtilsService
  ) {
    this.createForm();
    this.registerFormListeners();
  }

  ngOnInit(): void {
    this.store.dispatch(new ClearNetwork());
  }

  addProfile(cryptoConfig: NodeCryptoConfiguration) {
    this.isFormDirty = false;

    if (!this.profileForm.valid) {
      FormUtils.markFormGroupTouched(this.profileForm);
      this.isFormDirty = true;
      return;
    }

    this.isLoading = true;
    this.profileForm.disable();

    const { profileId, pin } = this.profileForm.value;

    this.storeUtilsService
      .isPinForProfileValid(profileId, pin, cryptoConfig.network)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.profileForm.enable();
        }),
        tap((isValidPin) => {
          if (isValidPin) {
            this.store.dispatch(new AddPinAction(profileId, pin));
            this.router.navigate(['/dashboard']);
          } else {
            this.isPinInvalid = true;
          }
        })
      )
      .subscribe();
  }

  private createForm() {
    this.profileForm = this.formBuilder.group({
      profileId: ['', Validators.required],
      pin: ['', Validators.required],
    });
  }

  private registerFormListeners() {
    this.profileForm.controls.profileId.valueChanges
      .pipe(
        untilDestroyed(this),
        map((profileId) => {
          const { nodeBaseUrl } = this.store.selectSnapshot(
            ProfilesState.getProfileById(profileId)
          );
          return nodeBaseUrl;
        }),
        distinctUntilChanged(),
        tap((baseUrl) => {
          this.store.dispatch(
            new SetNetwork(baseUrl || 'http://nft.protokol.com:4003')
          );
        })
      )
      .subscribe();
  }

  ngOnDestroy() {}
}
