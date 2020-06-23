import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextClipperComponent } from './text-clipper.component';

describe('TextClipperComponent', () => {
	let component: TextClipperComponent;
	let fixture: ComponentFixture<TextClipperComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [TextClipperComponent],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(TextClipperComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
