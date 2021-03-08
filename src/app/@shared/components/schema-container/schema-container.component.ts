import {
  AfterContentInit,
  Component,
  ContentChildren,
  HostBinding,
  QueryList,
} from '@angular/core';
import { SchemaContainerItemComponent } from '@shared/components/schema-container-item/schema-container-item.component';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-schema-container',
  templateUrl: './schema-container.component.html',
  styleUrls: ['./schema-container.component.scss'],
})
export class SchemaContainerComponent implements AfterContentInit {
  @ContentChildren(SchemaContainerItemComponent)
  items!: QueryList<SchemaContainerItemComponent>;

  @HostBinding('class.single-item') singleItemClass = false;

  showEditor$ = new BehaviorSubject(true);
  showForm$ = new BehaviorSubject(true);

  constructor() {}

  get colSpan() {
    return 24 / this.items.length;
  }

  ngAfterContentInit(): void {
    this.singleItemClass = this.items.length === 1;

    const editor = this.items.find((i) => i.isEditor());
    const form = this.items.find((i) => i.isForm());

    this.showEditor$.next(!!editor);
    this.showForm$.next(!!form);
  }
}
