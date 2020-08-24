import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { WidgetConfigService } from '@app/ajsf-widget-library/services/widget-config.service';
import { environment } from '@env/environment';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Logger } from '@core/services/logger.service';
import { CryptoService } from '@app/@core/services/crypto.service';
import { FormUtils } from '@core/utils/form-utils';
import { BehaviorSubject } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import { NzModalRef, NzNotificationService } from 'ng-zorro-antd';
import { untilDestroyed } from '@core/until-destroyed';
import { CreateCollectionResponseInterface } from '@app/dashboard/pages/collections/interfaces/create-collection-response.interface';

@Component({
  selector: 'app-collection-create-modal',
  templateUrl: './collection-create-modal.component.html',
  styleUrls: ['./collection-create-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionCreateModalComponent implements OnDestroy {
  readonly log = new Logger(this.constructor.name);
  readonly editorOptions: JsonEditorOptions;

  collectionForm!: FormGroup;
  framework = WidgetConfigService.getFramework();
  isProduction = environment.production;

  isLoading$ = new BehaviorSubject(false);

  constructor(
    private formBuilder: FormBuilder,
    private cryptoService: CryptoService,
    private nzNotificationService: NzNotificationService,
    private modalRef: NzModalRef<
      CollectionCreateModalComponent,
      CreateCollectionResponseInterface
    >
  ) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';

    this.createForm();
  }

  private createForm() {
    this.collectionForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      maximumSupply: [
        '',
        [Validators.min(0), Validators.max(Number.MAX_SAFE_INTEGER)],
      ],
      jsonSchema: ['', Validators.required],
    });
  }

  c(controlName: string) {
    return this.collectionForm.controls[controlName];
  }

  async createCollection(event: any) {
    event.preventDefault();

    if (this.isLoading$.getValue()) {
      return;
    }

    if (!this.collectionForm.valid) {
      FormUtils.markFormGroupTouched(this.collectionForm);
      return;
    }

    this.isLoading$.next(true);

    this.cryptoService
      .registerCollection(this.collectionForm.value)
      .pipe(
        tap(
          () => {
            this.modalRef.destroy({ refresh: true });
          },
          (err) => {
            this.nzNotificationService.create(
              'error',
              'Register collection failed!',
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

  onCancel(event: MouseEvent) {
    event.preventDefault();

    this.modalRef.destroy();
  }

  ngOnDestroy(): void {}
}
