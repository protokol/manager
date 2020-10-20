import { Injectable } from '@angular/core';
import { defer, Observable, of, OperatorFunction } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Logger } from '@core/services/logger.service';
import { ApiResponse, ApiResponseWithPagination } from '@arkecosystem/client';
import { ConnectionOptions } from '@core/interfaces/node.types';
import { ConnectionManager, ProtokolConnection } from '@protokol/client';
import { Store } from '@ngxs/store';
import { ProfilesStateModel } from '@core/store/profiles/profiles.state';

@Injectable()
export class BaseService {
  readonly log = new Logger(this.constructor.name);

  constructor(private store: Store) {}

  static genericErrorHandler(logger?: Logger) {
    const log = logger || new Logger('NodeClientService');

    return (
      tap((response: ApiResponse<any>) => {
        if (response.body.errors) {
          log.error('Response contains errors:', response.body.errors);
        }
      }),
      catchError((err) => {
        log.error(err);
        return of(undefined);
      })
    );
  }

  static genericListErrorHandler(logger?: Logger): OperatorFunction<any, any> {
    const log = logger || new Logger('NodeClientService');

    return (
      tap((response: ApiResponseWithPagination<any>) => {
        if (response.body.errors) {
          log.error('Response contains errors:', response.body.errors);
        }
      }),
      catchError((err) => {
        log.error(err);
        return of({
          data: [],
          meta: {
            pageCount: 0,
            totalCount: 0,
            count: 0,
            first: '',
            last: '',
            next: undefined,
            previous: undefined,
            self: '',
            totalCountIsEstimate: false,
          },
        });
      })
    );
  }

  getProtokolConnection(
    url: string = this.store.selectSnapshot(({ networks: { baseUrl } }) => baseUrl),
    { timeout }: ConnectionOptions = { timeout: 5000 },
    useRandomizedPeer: boolean = false
  ): Observable<ProtokolConnection> {
    const getRandomizedPeer = () => {
      if (useRandomizedPeer) {
        return true;
      }
      const { profiles, selectedProfileId }: ProfilesStateModel = this.store.selectSnapshot(({ profiles: p }) => p);
      return !!profiles[selectedProfileId]?.useRandomizedPeer;
    };

    const connection = new ProtokolConnection(`${url}/api`).withOptions({
      timeout: timeout || 5000
    });

    if (!getRandomizedPeer()) {
      return of(connection);
    }

    return of(new ConnectionManager(connection))
      .pipe(
        switchMap(c => defer(() => c.findRandomPeers())),
        map(c => c.getRandomConnection())
      );
  }
}
