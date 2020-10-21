import { Injectable } from '@angular/core';
import { BehaviorSubject, defer, Observable, of, OperatorFunction, Subject } from 'rxjs';
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

  isLoadingConnectionManager = false;
  connectionManagerSource = new Subject<ConnectionManager>();
  connectionManager$ = this.connectionManagerSource.asObservable();

  connectionManagerState$ = new BehaviorSubject<{
    connectionUrl: string
    connectionManager: ConnectionManager,
  }>({
    connectionUrl: null,
    connectionManager: null
  });

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

  getProtokolConnection(url: string, timeout: number = 5000) {
    return new ProtokolConnection(`${url}/api`).withOptions({
      timeout
    });
  }

  getRandomConnection(url: string, timeout: number = 5000): Observable<ConnectionManager> {
    const { connectionManager, connectionUrl } = this.connectionManagerState$.getValue();

    if (connectionUrl === connectionUrl && connectionManager !== null) {
      return of(connectionManager);
    } else if (this.isLoadingConnectionManager) {
      return new Observable(observer => {
        this.connectionManager$.subscribe((manager) => {
          observer.next(manager);
          observer.complete();
        });
      });
    } else {
      this.isLoadingConnectionManager = true;

      return of(new ConnectionManager(this.getProtokolConnection(url, timeout)))
        .pipe(
          switchMap(c => defer(() => c.findRandomPeers())),
          tap((manager) => {
            this.isLoadingConnectionManager = false;
            this.connectionManagerState$.next({
              connectionUrl: url,
              connectionManager: manager
            });
            this.connectionManagerSource.next(manager);
          })
        );
    }
  }

  getConnection(
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

    if (!getRandomizedPeer()) {
      return of(this.getProtokolConnection(url, timeout));
    }

    return this.getRandomConnection(url, timeout)
      .pipe(
        map(c => c.getRandomConnection())
      );
  }
}
