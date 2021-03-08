import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-schema-container-item',
  templateUrl: './schema-container-item.component.html',
  styleUrls: ['./schema-container-item.component.scss'],
})
export class SchemaContainerItemComponent {
  constructor() {}

  @Input() editor;
  @Input() form;

  isEditor() {
    return this.editor === true || this.editor === '';
  }

  isForm() {
    return this.form === true || this.form === '';
  }
}
