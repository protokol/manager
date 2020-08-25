import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { WidgetConfigService } from '@app/ajsf-widget-library/services/widget-config.service';
import { environment } from '@env/environment';
import { BehaviorSubject } from 'rxjs';
import {
  NzMessageService,
  NzModalRef,
  NzNotificationService,
} from 'ng-zorro-antd';
import { FormUtils } from '@core/utils/form-utils';
import { finalize, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { CryptoService } from '@core/services/crypto.service';
import { Logger } from '@core/services/logger.service';

@Component({
  selector: 'app-asset-create-modal',
  templateUrl: './asset-create-modal.component.html',
  styleUrls: ['./asset-create-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetCreateModalComponent implements OnDestroy {
  log: Logger = new Logger(this.constructor.name);

  readonly editorOptions: JsonEditorOptions;

  collectionForm!: FormGroup;
  assetForm!: FormGroup;

  framework = WidgetConfigService.getFramework();
  isProduction = environment.production;

  isLoading$ = new BehaviorSubject(false);
  isAssetValid$ = new BehaviorSubject(false);

  asset = {};

  constructor(
    private formBuilder: FormBuilder,
    private modalRef: NzModalRef,
    private cryptoService: CryptoService,
    private notificationService: NzNotificationService,
    private messageService: NzMessageService
  ) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'view';
    this.editorOptions.expandAll = true;

    this.createForm();
  }

  createForm() {
    this.collectionForm = this.formBuilder.group({
      collection: ['', Validators.required],
    });
  }

  c(controlName: string) {
    return this.collectionForm.controls[controlName];
  }

  get collection() {
    return this.c('collection').value;
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.modalRef.destroy();
  }

  createAsset(event: MouseEvent) {
    event.preventDefault();

    if (this.isLoading$.getValue() || !this.isAssetValid$.getValue()) {
      return;
    }

    if (!this.collectionForm.valid) {
      FormUtils.markFormGroupTouched(this.collectionForm);
      return;
    }

    this.isLoading$.next(true);

    const {
      collection: { id: collectionId },
    } = this.collectionForm.value;
    this.cryptoService
      .registerAsset({
        collectionId,
        attributes: this.asset,
      })
      .pipe(
        tap(
          () => {
            this.messageService.success('Token registered!');
            this.modalRef.destroy({ refresh: true });
          },
          (err) => {
            this.notificationService.create(
              'error',
              'Register asset failed!',
              err
            );
          }
        ),
        finalize(() => {
          this.isLoading$.next(false);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  isAssetValid(event: boolean) {
    this.isAssetValid$.next(event);
  }

  assetValidationErrors(event: any) {
    this.log.info(event);
  }

  ngOnDestroy() {}
}
