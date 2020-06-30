import { Component, Input, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
import { AbstractControl } from '@angular/forms';
import { Logger } from '@core/services/logger.service';

@Component({
	selector: 'app-ant-input',
	templateUrl: './ant-input.component.html',
	styleUrls: ['./ant-input.component.scss']
})
export class AntInputComponent implements OnInit {
	readonly log = new Logger(this.constructor.name);

	formControl: AbstractControl;
	controlName: string;
	controlValue: string;
	controlDisabled = false;
	boundControl = false;
	options: any;
	autoCompleteList: string[] = [];
	@Input() layoutNode: any;
	@Input() layoutIndex: number[];
	@Input() dataIndex: number[];

	constructor(
		private jsf: JsonSchemaFormService
	) {
	}

	ngOnInit() {
		this.options = this.layoutNode.options || {};
		this.jsf.initializeControl(this);
	}

	updateValue(event) {
		this.jsf.updateValue(this, event.target.value);
	}
}
