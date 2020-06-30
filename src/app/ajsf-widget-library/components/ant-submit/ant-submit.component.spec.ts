import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntSubmitComponent } from './ant-submit.component';

describe('AntSubmitComponent', () => {
	let component: AntSubmitComponent;
	let fixture: ComponentFixture<AntSubmitComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AntSubmitComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AntSubmitComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
