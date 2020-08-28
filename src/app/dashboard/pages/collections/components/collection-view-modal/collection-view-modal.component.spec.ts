import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionViewModalComponent } from '@app/dashboard/pages/collections/components/collection-view-modal/collection-view-modal.component';

describe('CollectionsViewModalComponent', () => {
  let component: CollectionViewModalComponent;
  let fixture: ComponentFixture<CollectionViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionViewModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
