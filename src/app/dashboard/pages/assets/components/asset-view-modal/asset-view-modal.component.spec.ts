import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AssetViewModalComponent } from '@app/dashboard/pages/assets/components/asset-view-modal/asset-view-modal.component';
import { SharedModule } from '@shared/shared.module';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JsonSchemaFormModule } from '@ajsf/core';
import { AjsfWidgetLibraryModule } from '@app/ajsf-widget-library/ajsf-widget-library.module';

describe('AssetViewModalComponent', () => {
  let component: AssetViewModalComponent;
  let fixture: ComponentFixture<AssetViewModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AjsfWidgetLibraryModule,
        SharedModule,
        NgJsonEditorModule,
        JsonSchemaFormModule,
      ],
      declarations: [AssetViewModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
