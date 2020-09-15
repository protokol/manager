import { FormGroup } from '@angular/forms';

export abstract class FormUtils {
  static markFormGroupDirty(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control: FormGroup) => {
      control.markAsDirty();
      control.updateValueAndValidity();

      if (control.controls) {
        this.markFormGroupDirty(control);
      }
    });
  }
}
