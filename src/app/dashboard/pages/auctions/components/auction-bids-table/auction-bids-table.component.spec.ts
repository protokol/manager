import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AuctionBidsTableComponent } from './bids-table.component';

describe('BidsTableComponent', () => {
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
