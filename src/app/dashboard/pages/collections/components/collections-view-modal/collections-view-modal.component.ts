import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { JsonEditorOptions } from 'ang-jsoneditor';

@Component({
	selector: 'app-collections-view-modal',
	templateUrl: './collections-view-modal.component.html',
	styleUrls: ['./collections-view-modal.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionsViewModalComponent {
	readonly editorOptions: JsonEditorOptions;

	@Input() jsonSchema: object;

	constructor() {
		this.editorOptions = new JsonEditorOptions();
		this.editorOptions.mode = 'code';
	}
}
