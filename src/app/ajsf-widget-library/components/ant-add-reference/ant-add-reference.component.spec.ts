import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AntAddReferenceComponent } from './ant-add-reference.component';

describe('AntAddReferenceComponent', () => {
  let component: AntAddReferenceComponent;
  let fixture: ComponentFixture<AntAddReferenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AntAddReferenceComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AntAddReferenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
