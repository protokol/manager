import { TestBed } from '@angular/core/testing';

import { NodeClientService } from './node-client.service';

describe('NodeClientService', () => {
  let service: NodeClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
