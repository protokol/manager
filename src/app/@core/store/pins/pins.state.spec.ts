import { TestBed } from '@angular/core/testing';
import { Store, NgxsModule } from '@ngxs/store';
import { PinsState } from './pins.state';
import { AddPinAction, ClearPinsAction } from './pins.actions';
import { v4 as uuid } from 'uuid';

describe('Pins', () => {
	let store: Store;
	const profileIdFixture = uuid();
	const pin1Fixture = '0000';
	const pin2Fixture = '1111';

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [NgxsModule.forRoot([PinsState])]
		});

		store = TestBed.inject(Store);
	});

	it('should add pin', () => {
		store.dispatch(new AddPinAction(profileIdFixture, pin1Fixture));

		const pins = store.selectSnapshot(state => state.pins.pins);
		expect(pins).toEqual({ [profileIdFixture]: pin1Fixture });
	});

	it('should clear pins', () => {
		const pinsStateFixture = {
			pins: {
				[uuid()]: pin1Fixture,
				[uuid()]: pin2Fixture,
			}
		};

		store.reset({
			pins: { ...pinsStateFixture }
		});

		const pins = store.selectSnapshot(state => state.pins);
		expect(pins).toEqual(pinsStateFixture);

		store.dispatch(new ClearPinsAction());
		const pinsEmpty = store.selectSnapshot(state => state.pins.pins);
		expect(pinsEmpty).toEqual({});
	});

	it('should select pin', () => {
		store.reset({
			pins: {
				pins: { [profileIdFixture]: pin1Fixture }
			}
		});

		const profilePin = store.selectSnapshot(PinsState.getPinByProfileId(profileIdFixture));
		expect(profilePin).toEqual(pin1Fixture);
	});
});

