import { Component, OnDestroy } from '@angular/core';
import {
	FormGroup,
	FormBuilder,
	Validators,
	FormControl,
	ValidationErrors,
} from '@angular/forms';
import { Profile, ProfilesState } from '@core/store/profiles/profiles.state';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { finalize, first, map } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { AddProfileAction } from '@core/store/profiles/profiles.actions';
import { v4 as uuid } from 'uuid';
import { Router } from '@angular/router';

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

	@Select(ProfilesState.getProfiles) profiles$: Observable<Profile[]>;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private store: Store
	) {
		this.createForm();
	}

	addProfile() {
		this.isFormDirty = false;

		if (!this.profileForm.valid) {
			this.profileForm.markAllAsTouched();
			this.isFormDirty = true;
			return;
		}

		const profileId = uuid();
		const { profileName, passphrase } = this.profileForm.value;

		this.store
			.select(ProfilesState.getProfileById)
			.pipe(
				untilDestroyed(this),
				map((getProfileById) => getProfileById(profileId)),
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

	private createForm() {
		this.profileForm = this.formBuilder.group({
			profileName: ['', [Validators.required], [this.profileNameAsyncValidator]],
			passphrase: ['', Validators.required],
		});
	}

	ngOnDestroy() {}
}
