import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionBidsTableComponent } from './auction-bids-table.component';

describe('AuctionBidsTableComponent', () => {
  let component: AuctionBidsTableComponent;
  let fixture: ComponentFixture<AuctionBidsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AuctionBidsTableComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AuctionBidsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
