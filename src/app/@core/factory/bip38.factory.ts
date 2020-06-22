import { environment } from '@env/environment';
import { Bip38WorkerService } from '@core/services/bip38-worker.service';
import { Bip38ServiceInterface } from '@core/interfaces/bip38-service.interface';
import { Bip38Service } from '@core/services/bip38.service';

/**
	* Provide bip38 service as worker, or as main thread blocking service
	* The issue is that hot reload breaks worker service in develop mode
	*/
export const bip38Factory = (): Bip38ServiceInterface => {
	if (environment.production) {
		return new Bip38WorkerService();
	}
	return new Bip38Service();
};
