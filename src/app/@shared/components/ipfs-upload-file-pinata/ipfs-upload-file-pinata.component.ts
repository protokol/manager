import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  NzMessageService,
  NzModalRef,
  NzNotificationService,
  NzUploadFile,
} from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PinataService } from '@core/services/pinata.service';
import { FormUtils } from '@core/utils/form-utils';
import { finalize, tap } from 'rxjs/operators';
import { untilDestroyed } from '@core/until-destroyed';
import { Logger } from '@core/services/logger.service';
import {
  PinataModalStepper,
  PinFileToIPFSResponseInterface,
} from '@core/interfaces/pinata.interface';
import { TextUtils } from '@app/@core/utils/text-utils';

@Component({
  selector: 'app-ipfs-upload-file-pinata',
  templateUrl: './ipfs-upload-file-pinata.component.html',
  styleUrls: ['./ipfs-upload-file-pinata.component.scss'],
})
export class IpfsUploadFilePinataComponent implements OnInit, OnDestroy {
  TextUtils = TextUtils;
  PinataModalStepper = PinataModalStepper;
  PinataGatewayUrl = PinataService.PINATA_GATEWAY_BASE_URL;

  private readonly log = new Logger(this.constructor.name);

  authenticationForm!: FormGroup;
  uploadForm!: FormGroup;

  isAuthLoading$ = new BehaviorSubject(false);
  isUploading$ = new BehaviorSubject(false);
  fileList$ = new BehaviorSubject<NzUploadFile[]>([]);
  step$ = new BehaviorSubject<PinataModalStepper>(
    PinataModalStepper.Authenticate
  );
  ipfsUploadResponse$ = new BehaviorSubject<PinFileToIPFSResponseInterface | null>(
    null
  );

  constructor(
    private modalRef: NzModalRef,
    private formBuilder: FormBuilder,
    private pinataService: PinataService,
    private messageService: NzMessageService,
    private notificationService: NzNotificationService
  ) {
    this.createForms();
  }

  ngOnInit(): void {}

  createForms() {
    this.authenticationForm = this.formBuilder.group({
      apiKey: ['', Validators.required],
      secretApiKey: ['', Validators.required],
    });

    this.uploadForm = this.formBuilder.group({
      name: [''],
      file: [null, Validators.required],
    });
  }

  onCancel(event: MouseEvent) {
    event.preventDefault();
    this.modalRef.destroy();
  }

  authenticatePinata(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
    }

    if (this.isAuthLoading$.getValue()) {
      return;
    }

    if (!this.authenticationForm.valid) {
      FormUtils.markFormGroupTouched(this.authenticationForm);
      return;
    }

    this.isAuthLoading$.next(true);

    this.pinataService
      .testAuthentication(this.authenticationForm.value)
      .pipe(
        tap(
          () => {
            this.step$.next(PinataModalStepper.Upload);
            this.messageService.success('Authentication success!');
          },
          (err) => {
            this.log.error(err);
            this.notificationService.create(
              'error',
              'Register asset failed!',
              err
            );
          }
        ),
        finalize(() => {
          this.isAuthLoading$.next(false);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  ngOnDestroy() {}

  onBack(event: MouseEvent) {
    event.preventDefault();

    this.step$.next(PinataModalStepper.Authenticate);
  }

  beforeUpload = (file: NzUploadFile): boolean => {
    this.uploadForm.controls.file.setValue(file);
    this.fileList$.next([file]);
    return false;
    // tslint:disable-next-line:semicolon
  };

  uploadFile(event?: MouseEvent) {
    if (event) {
      event.preventDefault();
    }

    if (this.isUploading$.getValue()) {
      return;
    }

    if (!this.uploadForm.valid) {
      FormUtils.markFormGroupTouched(this.uploadForm);
      return;
    }

    this.isUploading$.next(true);

    this.pinataService
      .pinFileToIPFS(this.uploadForm.value, this.authenticationForm.value)
      .pipe(
        tap(
          (response) => {
            this.ipfsUploadResponse$.next(response);
            this.messageService.success('Upload successful!');
            this.step$.next(PinataModalStepper.Result);
          },
          (err) => {
            this.log.error(err);
            this.notificationService.create('error', 'Upload failed!', err);
          }
        ),
        finalize(() => {
          this.isUploading$.next(false);
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }
}
