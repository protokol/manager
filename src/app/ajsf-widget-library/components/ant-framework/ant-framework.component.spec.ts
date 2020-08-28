import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntFrameworkComponent } from './ant-framework.component';

describe('AntFrameworkComponent', () => {
  let component: AntFrameworkComponent;
  let fixture: ComponentFixture<AntFrameworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AntFrameworkComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AntFrameworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
