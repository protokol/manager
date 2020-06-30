import { ElectronWorkerBase } from '@core/web-workers/electron-worker-base';
import {
  WebWorkerWalletPost,
  WebWorkerWalletReceive,
} from '@core/interfaces/electron-worker-wallet.types';
import { ElectronWorkers } from '../interfaces/electron-workers.enum';

export class ElectronWorkerWallet extends ElectronWorkerBase<
  WebWorkerWalletPost,
  WebWorkerWalletReceive
> {
  constructor() {
    super(ElectronWorkers.wallet);
  }
}
