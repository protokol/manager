import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntInputComponent } from './ant-input.component';

describe('AntInputComponent', () => {
  let component: AntInputComponent;
  let fixture: ComponentFixture<AntInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AntInputComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AntInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
