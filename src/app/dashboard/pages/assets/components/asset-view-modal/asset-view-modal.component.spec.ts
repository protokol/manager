import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { AssetViewModalComponent } from '@app/dashboard/pages/assets/components/asset-view-modal/asset-view-modal.component';
import { SharedModule } from '@shared/shared.module';
import { NgJsonEditorModule } from 'ang-jsoneditor';
import { JsonSchemaFormModule } from '@ajsf/core';
import { AjsfWidgetLibraryModule } from '@app/ajsf-widget-library/ajsf-widget-library.module';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('AssetViewModalComponent', () => {
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
        declarations: [AssetViewModalComponent],
      }).compileComponents();
    })
  );

  beforeEach(inject([NzModalService], (m: NzModalService) => {
    modalService = m;
  }));

  it('should create', () => {
    const modalRef = modalService.create({ nzContent: AssetViewModalComponent });
    modalRef.close();
  });
});
