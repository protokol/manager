import {
  AfterContentInit,
  Component,
  ContentChildren,
  HostBinding,
  QueryList,
} from '@angular/core';
import { SchemaContainerItemComponent } from '@shared/components/schema-container-item/schema-container-item.component';

@Component({
  selector: 'app-schema-container',
  templateUrl: './schema-container.component.html',
  styleUrls: ['./schema-container.component.scss'],
})
export class SchemaContainerComponent implements AfterContentInit {
  @ContentChildren(SchemaContainerItemComponent) items!: QueryList<
    SchemaContainerItemComponent
  >;

  @HostBinding('class.single-item') singleItemClass = false;

  constructor() {}

  get colSpan() {
    return 24 / this.items.length;
  }

  ngAfterContentInit(): void {
    this.singleItemClass = this.items.length === 1;
  }
}
