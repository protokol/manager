import { Component, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import {
  ProfilesState,
  ProfileWithId,
} from '@core/store/profiles/profiles.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { StoreUtilsService } from '@app/@core/store/store-utils.service';
import { NetworksState } from '@core/store/network/networks.state';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { finalize, tap } from 'rxjs/operators';
import { AddPinAction } from '@core/store/pins/pins.actions';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnDestroy {
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
  }

  addProfile(cryptoConfig: NodeCryptoConfiguration) {
    this.isFormDirty = false;

    if (!this.profileForm.valid) {
      this.profileForm.markAllAsTouched();
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

  ngOnDestroy() {}
}
