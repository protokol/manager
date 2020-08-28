import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetCreateModalComponent } from './asset-create-modal.component';

describe('AssetCreateModalComponent', () => {
  let component: AssetCreateModalComponent;
  let fixture: ComponentFixture<AssetCreateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AssetCreateModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
