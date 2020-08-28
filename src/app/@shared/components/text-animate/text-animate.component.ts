import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  transition,
  trigger,
  animate,
  state,
  style,
} from '@angular/animations';

@Component({
  selector: 'app-text-animate',
  templateUrl: './text-animate.component.html',
  styleUrls: ['./text-animate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('animate', [
      state(
        'on',
        style({
          color: '#429ef5',
        })
      ),
      state(
        'off',
        style({
          color: 'rgba(0, 0, 0, 0.65)',
        })
      ),
      transition('on => off', [animate('750ms')]),
      transition('off => on', [animate('1ms')]),
    ]),
  ],
})
export class TextAnimateComponent {
  value: string | number = '';

  @Input('value')
  set _value(value: string | number) {
    if (this.value !== value) {
      this.animate$.next(true);
      this.value = value;
    }
  }

  animate$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {}

  onAnimationEnd() {
    setTimeout(() => {
      this.animate$.next(false);
    });
  }
}
