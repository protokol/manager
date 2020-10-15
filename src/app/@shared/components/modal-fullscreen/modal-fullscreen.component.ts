import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { NzModalRef } from 'ng-zorro-antd/modal';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'button[app-modal-fullscreen]',
  templateUrl: './modal-fullscreen.component.html',
  styleUrls: ['./modal-fullscreen.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalFullscreenComponent implements OnInit {
  @HostBinding('class.app-modal-fullscreen') fullscreen = true;
  isExpanded$ = new BehaviorSubject(false);

  @Input() modalRef: NzModalRef = null;

  constructor(private cd: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    this.isExpanded$.asObservable()
      .pipe(tap((isExpanded) => {
          const nzClassName = isExpanded ? 'app-modal-expanded' : '';

          setTimeout(() => {
            this.modalRef.updateConfig({
              nzClassName
            });
            this.cd.markForCheck();
          });
        }
      ))
      .subscribe();
  }
}
