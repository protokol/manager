import { TestBed } from '@angular/core/testing';

import { HasProfileGuard } from './has-profile.guard';

describe('HasProfileGuard', () => {
	let guard: HasProfileGuard;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		guard = TestBed.inject(HasProfileGuard);
	});

	it('should be created', () => {
		expect(guard).toBeTruthy();
	});
});
