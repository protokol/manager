import { Component, ContentChildren, QueryList } from '@angular/core';
import { SchemaContainerItemComponent } from '@shared/components/schema-container-item/schema-container-item.component';

@Component({
  selector: 'app-schema-container',
  templateUrl: './schema-container.component.html',
  styleUrls: ['./schema-container.component.scss'],
})
export class SchemaContainerComponent {
  @ContentChildren(SchemaContainerItemComponent) items!: QueryList<
    SchemaContainerItemComponent
  >;

  constructor() {}

  get colSpan() {
    return 24 / this.items.length;
  }
}
