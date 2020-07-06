import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AssetViewModalComponent } from '@app/dashboard/pages/assets/components/asset-view-modal/asset-view-modal.component';

describe('AssetViewModalComponent', () => {
  let component: AssetViewModalComponent;
  let fixture: ComponentFixture<AssetViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssetViewModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
