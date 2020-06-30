import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntNumberComponent } from './ant-number.component';

describe('AntNumberComponent', () => {
	let component: AntNumberComponent;
	let fixture: ComponentFixture<AntNumberComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AntNumberComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AntNumberComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
