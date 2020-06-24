import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { Logger } from '@core/services/logger.service';
import { Store } from '@ngxs/store';
import { SetNetwork } from '@core/store/network/networks.actions';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	constructor(private store: Store) {}

	ngOnInit() {
		if (environment.production) {
			Logger.enableProductionMode();
		}

		this.store.dispatch(new SetNetwork('http://nft.protokol.com:4003'));
	}
}
