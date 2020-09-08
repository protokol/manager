import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectionsUtils } from '@app/dashboard/pages/collections/utils/collections-utils';
import { BehaviorSubject } from 'rxjs';
import { TextUtils } from '@core/utils/text-utils';
import {
  AttributeType,
  CreateAttributeModalResponse,
} from '@app/dashboard/pages/collections/interfaces/collection.types';
import { FormUtils } from '@core/utils/form-utils';
import { NzModalRef } from 'ng-zorro-antd';

@Component({
  selector: 'app-attribute-create-modal',
  templateUrl: './attribute-create-modal.component.html',
  styleUrls: ['./attribute-create-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttributeCreateModalComponent {
  TextUtils = TextUtils;
  AttributeType = AttributeType;
  AttributeTypes = CollectionsUtils.getAttributeTypes();
  attributeForm!: FormGroup;

  isLoading$ = new BehaviorSubject(false);

  constructor(
    private formBuilder: FormBuilder,
    private nzModalRef: NzModalRef<
      AttributeCreateModalComponent,
      CreateAttributeModalResponse
    >
  ) {
    this.createForm();
  }

  createForm() {
    this.attributeForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      required: [false],
      type: ['', [Validators.required]],
      attribute: [],
    });
  }

  c(controlName: string) {
    return this.attributeForm.controls[controlName];
  }

  addAttribute(event: MouseEvent) {
    event.preventDefault();

    if (!this.attributeForm.valid) {
      FormUtils.markFormGroupTouched(this.attributeForm);
      return;
    }
    this.nzModalRef.destroy({
      ...this.attributeForm.value,
    });
  }
}
