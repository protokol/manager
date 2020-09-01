import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';
import { WidgetConfigService } from '@app/ajsf-widget-library/services/widget-config.service';
import { environment } from '@env/environment';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Logger } from '@core/services/logger.service';
import { CryptoService } from '@app/@core/services/crypto.service';
import { FormUtils } from '@core/utils/form-utils';
import { BehaviorSubject } from 'rxjs';
import { finalize, tap } from 'rxjs/operators';
import {
  NzMessageService,
  NzModalRef,
  NzNotificationService,
} from 'ng-zorro-antd';
import { untilDestroyed } from '@core/until-destroyed';
import { CreateModalResponseInterface } from '@core/interfaces/create-modal-response.interface';
import { Store } from '@ngxs/store';
import { NetworksState } from '@core/store/network/networks.state';
import { BaseResourcesTypes } from '@protokol/nft-client';
import { MemoryUtils } from '@core/utils/memory-utils';

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

  cryptoDefaults!: BaseResourcesTypes.BaseConfigurations['crypto']['defaults'];

  constructor(
    private formBuilder: FormBuilder,
    private cryptoService: CryptoService,
    private nzNotificationService: NzNotificationService,
    private modalRef: NzModalRef<
      CollectionCreateModalComponent,
      CreateModalResponseInterface
    >,
    private messageService: NzMessageService,
    private store: Store
  ) {
    this.editorOptions = new JsonEditorOptions();
    this.editorOptions.mode = 'code';

    this.cryptoDefaults = this.store.selectSnapshot(
      NetworksState.getCryptoDefaults()
    );
    this.createForm();
  }

  get nameMinLength() {
    const {
      nftCollectionName: { minLength },
    } = this.cryptoDefaults;
    return minLength;
  }

  get nameMaxLength() {
    const {
      nftCollectionName: { maxLength },
    } = this.cryptoDefaults;
    return maxLength;
  }

  get descriptionMinLength() {
    const {
      nftCollectionDescription: { minLength },
    } = this.cryptoDefaults;
    return minLength;
  }

  get descriptionMaxLength() {
    const {
      nftCollectionDescription: { maxLength },
    } = this.cryptoDefaults;
    return maxLength;
  }

  get schemaMaxSize() {
    const { nftCollectionJsonSchemaByteSize } = this.cryptoDefaults;
    return nftCollectionJsonSchemaByteSize;
  }

  get maximumSupplyMin() {
    return 0;
  }

  get maximumSupplyMax() {
    return Number.MAX_SAFE_INTEGER;
  }

  schemaSizeValidator = (control: FormControl): ValidationErrors | null => {
    if (
      control.value &&
      MemoryUtils.getBytesFromString(control.value) > this.schemaMaxSize
    ) {
      return { maxSize: true, error: true };
    }

    return null;
    // tslint:disable-next-line:semicolon
  };

  private createForm() {
    this.collectionForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.min(this.nameMinLength),
          Validators.max(this.nameMaxLength),
        ],
      ],
      description: [
        '',
        [
          Validators.required,
          Validators.min(this.descriptionMinLength),
          Validators.max(this.descriptionMaxLength),
        ],
      ],
      maximumSupply: [
        '',
        [
          Validators.min(this.maximumSupplyMin),
          Validators.max(this.maximumSupplyMax),
        ],
      ],
      jsonSchema: ['', [Validators.required, this.schemaSizeValidator]],
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
            this.messageService.success('Collection registered!');
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

  ngOnDestroy(): void {}
}
