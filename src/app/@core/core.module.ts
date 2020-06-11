import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconsProviderModule } from './icons-provider.module';
import { NgxsModule } from '@ngxs/store';
import { ProfilesState } from './store/profiles/profiles.state';
import { environment } from '@env/environment';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		IconsProviderModule,
		NgxsModule.forRoot([ProfilesState], {
			developmentMode: !environment.production,
		}),
		NgxsStoragePluginModule.forRoot({
			key: [ProfilesState],
		}),
	],
})
export class CoreModule {
	constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
		// Import guard
		if (parentModule) {
			throw new Error(
				`${parentModule} has already been loaded. Import Core module in the AppModule only.`
			);
		}
	}
}
