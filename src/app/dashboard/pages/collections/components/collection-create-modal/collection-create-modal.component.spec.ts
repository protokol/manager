import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionCreateModalComponent } from '@app/dashboard/pages/collections/components/collection-create-modal/collection-create-modal.component';

describe('CollectionsViewModalComponent', () => {
  let component: CollectionCreateModalComponent;
  let fixture: ComponentFixture<CollectionCreateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CollectionCreateModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
