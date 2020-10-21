import { TestBed } from '@angular/core/testing';
import { NodeClientService } from './node-client.service';
import { BaseService } from '@core/services/base.service';
import { NgxsModule } from '@ngxs/store';
import { ProfilesState } from '@core/store/profiles/profiles.state';
import { ArkCryptoService } from '@core/services/ark-crypto.service';
import { Bip38Service } from '@core/services/bip38.service';

describe('NodeClientService', () => {
  let service: NodeClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([ProfilesState])],
      providers: [
        ArkCryptoService,
        Bip38Service,
        BaseService,
        NodeClientService
      ],
    });
    service = TestBed.inject(NodeClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
