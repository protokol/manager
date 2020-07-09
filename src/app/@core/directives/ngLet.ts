import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
} from '@angular/core';

export class NgLetContext {
  $implicit: any = null;
  ngLet: any = null;
}

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ngLet]',
})
export class NgLetDirective implements OnInit {
  private context = new NgLetContext();

  @Input()
  set ngLet(value: any) {
    this.context.$implicit = this.context.ngLet = value;
  }

  constructor(
    private vcr: ViewContainerRef,
    private templateRef: TemplateRef<NgLetContext>
  ) {}

  ngOnInit() {
    this.vcr.createEmbeddedView(this.templateRef, this.context);
  }
}
