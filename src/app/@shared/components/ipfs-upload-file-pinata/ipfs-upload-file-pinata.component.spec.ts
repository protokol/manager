import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpfsUploadFilePinataComponent } from './ipfs-upload-file-pinata.component';

describe('IpfsUploadFilePinataComponent', () => {
  let component: IpfsUploadFilePinataComponent;
  let fixture: ComponentFixture<IpfsUploadFilePinataComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IpfsUploadFilePinataComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpfsUploadFilePinataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
