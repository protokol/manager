export const PINS_TYPE_NAME = 'pins';

export class AddPinAction {
	static type = `[${PINS_TYPE_NAME}] AddPin`;

	constructor(
		public profileId: string,
		public pin: string
	) {}
}
