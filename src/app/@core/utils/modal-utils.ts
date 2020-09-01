import { ModalOptions } from 'ng-zorro-antd';

export abstract class ModalUtils {
  static getCreateModalDefaultConfig(): ModalOptions {
    return {
      nzKeyboard: false,
      nzMaskClosable: false,
    };
  }
}
