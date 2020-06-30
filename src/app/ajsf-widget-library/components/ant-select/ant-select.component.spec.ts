import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntSelectComponent } from './ant-select.component';

describe('AntSelectComponent', () => {
	let component: AntSelectComponent;
	let fixture: ComponentFixture<AntSelectComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AntSelectComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AntSelectComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
