import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntButtonComponent } from './ant-button.component';

describe('AntButtonComponent', () => {
  let component: AntButtonComponent;
  let fixture: ComponentFixture<AntButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AntButtonComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AntButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
