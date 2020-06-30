import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardShellComponent } from './dashboard-shell.component';

describe('DashboardShellComponent', () => {
  let component: DashboardShellComponent;
  let fixture: ComponentFixture<DashboardShellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardShellComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
