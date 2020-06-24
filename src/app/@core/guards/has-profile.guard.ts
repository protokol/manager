import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Store } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { map, switchMap, first } from 'rxjs/operators';
import { PinsState } from '@core/store/pins/pins.state';

@Injectable()
export class HasProfileGuard implements CanLoad {
	constructor(private store: Store, private router: Router) {}

	canLoad(): Observable<boolean> {
		return this.store.selectOnce(ProfilesState.getSelectedProfile).pipe(
			switchMap((selectedProfile) => {
				if (!selectedProfile) {
					this.router.navigateByUrl('/auth');
					return of(false);
				} else {
					return this.store
						.selectOnce(PinsState.getPinByProfileId(selectedProfile.id))
						.pipe(
							first((pin) => !!pin),
							map((pinAvailable) => {
								if (!pinAvailable) {
									this.router.navigateByUrl('/auth');
								}
								return !!pinAvailable;
							})
						);
				}
			})
		);
	}
}
