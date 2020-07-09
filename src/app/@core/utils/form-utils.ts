import { FormGroup } from '@angular/forms';

export abstract class FormUtils {
  static markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsTouched();

      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
