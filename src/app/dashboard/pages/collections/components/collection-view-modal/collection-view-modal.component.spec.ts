import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CollectionViewModalComponent } from '@app/dashboard/pages/collections/components/collection-view-modal/collection-view-modal.component';
import { SharedModule } from '@shared/shared.module';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JsonSchemaFormModule } from '@ajsf/core';
import { AjsfWidgetLibraryModule } from '@app/ajsf-widget-library/ajsf-widget-library.module';

describe('CollectionsViewModalComponent', () => {
  let component: CollectionViewModalComponent;
  let fixture: ComponentFixture<CollectionViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AjsfWidgetLibraryModule,
        SharedModule,
        NgJsonEditorModule,
        JsonSchemaFormModule,
      ],
      declarations: [CollectionViewModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
