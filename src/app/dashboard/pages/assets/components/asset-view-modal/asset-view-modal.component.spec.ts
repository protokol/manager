import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionsViewModalComponent } from './collections-view-modal.component';

describe('CollectionsViewModalComponent', () => {
  let component: CollectionsViewModalComponent;
  let fixture: ComponentFixture<CollectionsViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionsViewModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionsViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
