import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  debounceTime,
  filter,
  finalize,
  first,
  map,
  tap,
} from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { AddProfileAction } from '@core/store/profiles/profiles.actions';
import { v4 as uuid } from 'uuid';
import { Router } from '@angular/router';
import {
  MnemonicGenerateLanguage,
  WalletService,
} from '@core/services/wallet.service';
import { NetworksState } from '@core/store/network/networks.state';
import { NodeCryptoConfiguration } from '@arkecosystem/client/dist/resourcesTypes/node';
import { PinsState } from '@core/store/pins/pins.state';
import { RegisterNetworkEnum } from '@app/auth/interfaces/register.types';
import { environment } from '@env/environment';
import { ClearNetwork, SetNetwork } from '@core/store/network/networks.actions';
import { FormUtils } from '@core/utils/form-utils';
import { ProfileWithId } from '@app/@core/interfaces/profiles.types';
import { TextUtils } from '@core/utils/text-utils';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  networks = environment.networks;
  RegisterNetworkEnum = RegisterNetworkEnum;

  currentStepIndex = 0;
  networkForm!: FormGroup;
  profileForm!: FormGroup;
  error?: string;
  isLoading: boolean;
  isProfileFormDirty = false;
  isNetworkFormDirty = false;

  @Select(ProfilesState.getProfiles) profiles$: Observable<ProfileWithId[]>;
  @Select(NetworksState.getNodeCryptoConfig)
  cryptoConfig$: Observable<NodeCryptoConfiguration | null>;
  @Select(NetworksState.getIsValidNetwork)
  validNetwork$: Observable<boolean | null>;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private store: Store,
    private walletService: WalletService
  ) {
    this.createForms();
    this.registerFormListeners();
  }

  ngOnInit(): void {
    this.store.dispatch(new ClearNetwork());
  }

  addProfile(networkConfig: NodeCryptoConfiguration['network']) {
    this.isProfileFormDirty = false;

    if (!this.profileForm.valid) {
      FormUtils.markFormGroupDirty(this.profileForm);
      this.isProfileFormDirty = true;
      return;
    }

    const profileId = uuid();
    const { profileName, passphrase, pin, address } = this.profileForm.value;

    this.store
      .select(PinsState.getPinByProfileId(profileId))
      .pipe(
        untilDestroyed(this),
        first((profile) => !!profile),
        finalize(() => {
          this.router.navigate(['/dashboard']);
        })
      )
      .subscribe();

    this.store.dispatch(
      new AddProfileAction(
        {
          name: profileName,
          passphrase,
          nodeBaseUrl: this.store.selectSnapshot(NetworksState.getBaseUrl),
          address,
        },
        pin,
        networkConfig,
        true,
        profileId
      )
    );
  }

  profileNameAsyncValidator = (
    control: FormControl
  ): Observable<ValidationErrors | null> =>
    this.profiles$.pipe(
      untilDestroyed(this),
      first(),
      map((profiles) =>
        profiles.length ? profiles.some((p) => p.name === control.value) : false
      ),
      map((isProfileNameDuplicated) => {
        if (isProfileNameDuplicated) {
          return { error: true, duplicated: true };
        }
        return null;
      })
      // tslint:disable-next-line:semicolon
    );

  pinValidator = (control: FormControl): ValidationErrors | null => {
    if (!control.value) {
      return { required: true };
    } else if (control.value !== this.pf('pin').value) {
      return { confirm: true, error: true };
    }
    return null;
    // tslint:disable-next-line:semicolon
  };

  private createForms() {
    this.networkForm = this.formBuilder.group({
      networkUrl: ['', [Validators.required]],
      customNetworkUrl: ['', []],
      customNetworkUrlProtocol: ['http://', []],
      networkType: [RegisterNetworkEnum.Predefined, [Validators.required]],
    });

    this.profileForm = this.formBuilder.group({
      profileName: [
        '',
        [Validators.required],
        [this.profileNameAsyncValidator],
      ],
      passphrase: [
        '',
        [
          Validators.required,
          Validators.pattern(TextUtils.getPassphraseRegex()),
        ],
      ],
      address: ['', Validators.required],
      pin: ['', Validators.required],
      pinConfirm: ['', [Validators.required, this.pinValidator]],
      agree: [false, Validators.required],
    });
  }

  private registerFormListeners() {
    this.nf('networkType')
      .valueChanges.pipe(
        untilDestroyed(this),
        tap((networkType: RegisterNetworkEnum) => {
          if (networkType === RegisterNetworkEnum.Custom) {
            this.nf('customNetworkUrl').setValidators(Validators.required);
            this.nf('networkUrl').clearValidators();
          } else if (networkType === RegisterNetworkEnum.Predefined) {
            this.nf('networkUrl').setValidators(Validators.required);
            this.nf('customNetworkUrl').clearValidators();
          }
          this.nf('networkUrl').updateValueAndValidity();
          this.nf('customNetworkUrl').updateValueAndValidity();
        })
      )
      .subscribe();

    this.pf('passphrase')
      .valueChanges.pipe(
        tap(() => this.pf('address').setValue('')),
        filter((passphrase) => TextUtils.getPassphraseRegex().test(passphrase)),
        debounceTime(500),
        tap((passphrase) => {
          const address = this.walletService.addressFromPassphrase(passphrase);
          this.pf('address').setValue(address);
        })
      )
      .subscribe();
  }

  nf(controlName: string): AbstractControl {
    return this.networkForm.controls[controlName];
  }

  pf(controlName: string): AbstractControl {
    return this.profileForm.controls[controlName];
  }

  ngOnDestroy() {}

  onGenerateClick(event: MouseEvent) {
    event.preventDefault();
    const passphrase = this.walletService.generate(
      MnemonicGenerateLanguage.ENGLISH
    );

    this.pf('passphrase').setValue(passphrase);
  }

  selectNetwork() {
    if (this.isLoading) {
      return;
    }

    this.isNetworkFormDirty = false;

    if (!this.networkForm.valid) {
      FormUtils.markFormGroupDirty(this.networkForm);
      this.isNetworkFormDirty = true;
      return;
    }

    this.store.dispatch(new ClearNetwork());
    this.isLoading = true;

    const getNetworkUrl = () => {
      const { networkType } = this.networkForm.value;
      switch (networkType) {
        case RegisterNetworkEnum.Predefined: {
          const { networkUrl } = this.networkForm.value;
          return networkUrl;
        }
        case RegisterNetworkEnum.Custom:
        default: {
          const {
            customNetworkUrl,
            customNetworkUrlProtocol,
          } = this.networkForm.value;
          return `${customNetworkUrlProtocol}${customNetworkUrl}`;
        }
      }
    };

    const nodeUrl = getNetworkUrl();

    this.store
      .select(NetworksState.getIsValidNetwork)
      .pipe(
        untilDestroyed(this),
        first(
          (isValidNetwork) =>
            isValidNetwork === true || isValidNetwork === false
        ),
        tap((isValidNetwork) => {
          if (isValidNetwork) {
            this.currentStepIndex = 1;
          }
          this.isLoading = false;
        })
      )
      .subscribe();

    this.store.dispatch(new SetNetwork(nodeUrl));
  }

  getNetworkLabel(network: typeof environment.networks[0]) {
    return `${network.label} (${network.value})`;
  }

  goToNetworkStep(event: MouseEvent) {
    event.preventDefault();

    this.store.dispatch(new ClearNetwork());
    this.currentStepIndex = 0;
  }

  get appVersion() {
    return environment.version;
  }
}
