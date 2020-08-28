import { Injectable } from '@angular/core';
import { Logger } from '@core/services/logger.service';
import { HttpClient } from '@angular/common/http';
import {
  PinataAuthenticationInterface,
  PinFileToIPFSResponseInterface,
} from '@core/interfaces/pinata.interface';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

const routes = {
  testAuthentication: () =>
    `${PinataService.PINATA_ENDPOINT_BASE_URL}/data/testAuthentication`,
  pinFileToIPFS: () =>
    `${PinataService.PINATA_ENDPOINT_BASE_URL}/pinning/pinFileToIPFS`,
};

@Injectable()
export class PinataService {
  constructor(private http: HttpClient) {}

  static PINATA_ENDPOINT_BASE_URL = 'https://api.pinata.cloud';
  static PINATA_GATEWAY_BASE_URL = 'https://gateway.pinata.cloud/ipfs/';

  readonly log = new Logger(this.constructor.name);

  static getHeaders = ({
    apiKey,
    secretApiKey,
  }: PinataAuthenticationInterface) => ({
    headers: {
      pinata_api_key: apiKey,
      pinata_secret_api_key: secretApiKey,
    },
    // tslint:disable-next-line:semicolon
  });

  static getCustomPinPolicy = () => ({
    regions: [
      {
        id: 'FRA1',
        desiredReplicationCount: 1,
      },
      {
        id: 'NYC1',
        desiredReplicationCount: 1,
      },
    ],
    // tslint:disable-next-line:semicolon
  });

  testAuthentication(auth: PinataAuthenticationInterface) {
    return this.http
      .get(routes.testAuthentication(), {
        ...PinataService.getHeaders(auth),
      })
      .pipe(
        catchError((err) => {
          return throwError(
            err?.error?.error || err.message || JSON.stringify(err)
          );
        })
      );
  }

  pinFileToIPFS(
    { file, name }: { file: File; name?: string },
    auth: PinataAuthenticationInterface
  ) {
    const formData = new FormData();
    formData.append('file', file);

    if (name) {
      const metadata = JSON.stringify({
        name,
        // IPFS pin can contain JSON metadata
        /* keyvalues: {
          key: 'value'
        } */
      });
      formData.append('pinataMetadata', metadata);
    }

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
      customPinPolicy: {
        ...PinataService.getCustomPinPolicy(),
      },
    });
    formData.append('pinataOptions', pinataOptions);

    return this.http
      .post<PinFileToIPFSResponseInterface>(routes.pinFileToIPFS(), formData, {
        ...PinataService.getHeaders(auth),
      })
      .pipe(
        catchError((err) => {
          return throwError(
            err?.error?.error || err.message || JSON.stringify(err)
          );
        })
      );
  }
}
