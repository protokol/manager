import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { CollectionViewModalComponent } from '@app/dashboard/pages/collections/components/collection-view-modal/collection-view-modal.component';
import { SharedModule } from '@shared/shared.module';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JsonSchemaFormModule } from '@ajsf/core';
import { AjsfWidgetLibraryModule } from '@app/ajsf-widget-library/ajsf-widget-library.module';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CollectionsViewModalComponent', () => {
  let modalService: NzModalService;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [
          NoopAnimationsModule,
          NzModalModule,
          AjsfWidgetLibraryModule,
          SharedModule,
          NgJsonEditorModule,
          JsonSchemaFormModule,
        ],
        declarations: [CollectionViewModalComponent],
      }).compileComponents();
    })
  );

  beforeEach(inject([NzModalService], (m: NzModalService) => {
    modalService = m;
  }));

  it('should create', () => {
    const modalRef = modalService.create({ nzContent: CollectionViewModalComponent });
    modalRef.close();
  });
});
