import {
  ChangeDetectionStrategy,
  Component,
  Input, OnDestroy,
  OnInit
} from '@angular/core';
import { BehaviorSubject, forkJoin, Observable, of, Subject, throwError, timer } from 'rxjs';
import { exhaustMap, map, takeUntil, tap, timeoutWith } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import addSeconds from 'date-fns/addSeconds';
import { TransactionsService } from '@core/services/transactions.service';
import { TransactionResult } from '@shared/interfaces/transaction-result.types';
import { NzModalRef } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-transaction-result-modal',
  templateUrl: './transaction-result-modal.component.html',
  styleUrls: ['./transaction-result-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionResultModalComponent implements OnInit, OnDestroy {
  private untilDestroyed$ = new Subject();
  transactionResults$ = new BehaviorSubject<TransactionResult[]>([]);
  isCompleted$ = new BehaviorSubject(false);

  @Input() transactionIds: string[] = [];

  constructor(private transactionsService: TransactionsService, private nzModalRef: NzModalRef) {
  }

  ngOnInit(): void {
    timer(0, 4000)
      .pipe(
        takeUntil(this.untilDestroyed$),
        timeoutWith(
          addSeconds(Date.now(), 80 /*Wait for 10 blocks*/),
          throwError('Transaction/s have not been confirmed within 10 blocks time!')
        ),
        exhaustMap(() => {
          return forkJoin(
            this.transactionIds.map(tId =>
              forkJoin([
                of(tId),
                this.transactionsService.getTransaction(tId)
              ])
            )
          ).pipe(
            tap((transactions) => {
              this.transactionResults$.next(
                transactions.map(([id, t]) => {
                  return {
                    id,
                    isConfirmed: !!t
                  };
                })
              );

              if (transactions.every(([, t])  => !!t)) {
                this.untilDestroyed$.next();
                this.untilDestroyed$.complete();

                this.isCompleted$.next(true);
              }
            })
          );
        }),
        untilDestroyed(this)
      ).subscribe();
  }

  get allTransactionConfirmed$(): Observable<boolean> {
    return this.transactionResults$.asObservable()
      .pipe(
        map(results => {
          if (!results.length) {
            return false;
          }

          return results.every(({ isConfirmed }) => !!isConfirmed);
        })
      );
  }

  onCloseModal(event: MouseEvent) {
    event.preventDefault();

    this.nzModalRef.close();
  }

  ngOnDestroy(): void {
  }
}
