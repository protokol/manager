import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';
import { Logger } from '@core/services/logger.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	ngOnInit() {
		if (environment.production) {
			Logger.enableProductionMode();
		}
	}
}
