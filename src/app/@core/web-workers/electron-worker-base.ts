import { BehaviorSubject, Observable } from 'rxjs';
import { ElectronUtils } from '../utils/electron-utils';
import { Logger } from '../services/logger.service';
import * as childProcessType from 'child_process';
import * as pathType from 'path';
import * as electronType from 'electron';
import { ChildProcess } from 'child_process';
import { ElectronWorkers } from '@core/interfaces/electron-workers.enum';
import { filter, finalize, first, tap } from 'rxjs/operators';

export class ElectronWorkerBase<TInput = any, TOutput = any> {
	readonly log = new Logger(this.constructor.name);

	private readonly childProcess: typeof childProcessType;
	private readonly path: typeof pathType;
	private readonly electron: typeof electronType;

	private readonly worker: ChildProcess;
	private onMessage$ = new BehaviorSubject<TOutput>(null);
	private isStarted$ = new BehaviorSubject<boolean>(false);

	constructor(workerPath: ElectronWorkers) {
		if (ElectronUtils.isElectron()) {
			this.childProcess = window.require('child_process');
			this.path = window.require('path');
			this.electron = window.require('electron');
		}

		const path = this.path.resolve(this.electron.remote.app.getAppPath(), `./dist/electron-workers/${workerPath}.js`);
		this.worker = this.childProcess.fork(path);
		console.log('spawn worker');

		this.worker.on('message', (message) => {
			if (message.type === 'started') {
				this.isStarted$.next(true);
			} else {
				this.onMessage$.next(message);
			}
		});
	}

	send(data: TInput) {
		this.isStarted$.asObservable()
			.pipe(
				filter(isStarted => !!isStarted),
				tap(() => {
					this.worker.send(data);
				})).subscribe();
	}

	onMessage(): Observable<TOutput> {
		return this.onMessage$.asObservable()
			.pipe(
				first(value => value !== null), // Ignore first value
				finalize(() => this.terminate())
			);
	}

	terminate() {
		if (this.worker) {
			this.worker.send({
				type: 'exit'
			});
		}
	}
}
