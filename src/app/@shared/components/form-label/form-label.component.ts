import { Component, HostBinding, Input } from '@angular/core';

@Component({
  selector: 'app-form-label',
  templateUrl: './form-label.component.html',
  styleUrls: ['./form-label.component.scss']
})
export class FormLabelComponent {
  @HostBinding('class.full-width') fullWidth = true;

  @Input('fullWidth')
  set _fullWidth(fullWidth: boolean) {
    this.fullWidth = !!fullWidth;
  }

  constructor() {
  }
}
