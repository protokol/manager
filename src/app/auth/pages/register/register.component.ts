import { Component, OnDestroy } from '@angular/core';
import {
	AbstractControl,
	FormBuilder,
	FormControl,
	FormGroup,
	ValidationErrors,
	Validators,
} from '@angular/forms';
import {
	ProfilesState,
	ProfileWithId,
} from '@core/store/profiles/profiles.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { finalize, first, map } from 'rxjs/operators';
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

@Component({
	selector: 'app-register',
	templateUrl: './register.component.html',
	styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnDestroy {
	profileForm!: FormGroup;
	error?: string;
	isLoading: boolean;
	isFormDirty = false;

	@Select(ProfilesState.getProfiles) profiles$: Observable<ProfileWithId[]>;
	@Select(NetworksState.getNodeCryptoConfig)
	cryptoConfig$: Observable<NodeCryptoConfiguration | null>;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private store: Store,
		private walletService: WalletService
	) {
		this.createForm();
	}

	addProfile(networkConfig: NodeCryptoConfiguration['network']) {
		this.isFormDirty = false;

		if (!this.profileForm.valid) {
			this.profileForm.markAllAsTouched();
			this.isFormDirty = true;
			return;
		}

		const profileId = uuid();
		const { profileName, passphrase, pin } = this.profileForm.value;

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
					profileName,
					passphrase,
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
				profiles.length
					? profiles.some((p) => p.profileName === control.value)
					: false
			),
			map((isProfileNameDuplicated) => {
				if (isProfileNameDuplicated) {
					return { error: true, duplicated: true };
				}
				return null;
			})
		);

	pinValidator = (control: FormControl): ValidationErrors | null => {
		if (!control.value) {
			return { required: true };
		} else if (control.value !== this.c('pin').value) {
			return { confirm: true, error: true };
		}
		return null;
	};

	private createForm() {
		this.profileForm = this.formBuilder.group({
			profileName: ['', [Validators.required], [this.profileNameAsyncValidator]],
			passphrase: ['', Validators.required],
			address: [{ value: '', disabled: true }, Validators.required],
			pin: ['', Validators.required],
			pinConfirm: ['', [Validators.required, this.pinValidator]],
			agree: [false, Validators.required],
		});
	}

	c(controlName: string): AbstractControl {
		return this.profileForm.controls[controlName];
	}

	ngOnDestroy() {}

	onGenerateClick(event: MouseEvent, publicKeyHash: any) {
		event.preventDefault();
		const { passphrase, address } = this.walletService.generate(
			publicKeyHash,
			MnemonicGenerateLanguage.ENGLISH
		);

		this.c('passphrase').setValue(passphrase);
		this.c('address').setValue(address);
	}
}
