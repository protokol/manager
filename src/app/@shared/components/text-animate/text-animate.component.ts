import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
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
      transition('on => off', [animate('1s')]),
      transition('off => on', [animate('0.01s')]),
    ]),
  ],
})
export class TextAnimateComponent implements OnChanges {
  @Input() value;

  animate: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.value.currentValue !== changes.value.previousValue) {
      this.animate.next(true);
    }
  }

  onAnimationEnd() {
    this.animate.next(false);
  }
}
