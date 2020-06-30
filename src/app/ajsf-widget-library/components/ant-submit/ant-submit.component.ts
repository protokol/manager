import { Component, Input, OnInit } from '@angular/core';
import { hasOwn, JsonSchemaFormService } from '@ajsf/core';
import { AbstractControl } from '@angular/forms';

@Component({
	selector: 'app-ant-submit',
	templateUrl: './ant-submit.component.html',
	styleUrls: ['./ant-submit.component.scss'],
})
export class AntSubmitComponent implements OnInit {
	formControl: AbstractControl;
	controlName: string;
	controlValue: any;
	controlDisabled = false;
	boundControl = false;
	options: any;
	@Input() layoutNode: any;
	@Input() layoutIndex: number[];
	@Input() dataIndex: number[];

	constructor(private jsf: JsonSchemaFormService) {}

	ngOnInit() {
		this.options = this.layoutNode.options || {};
		this.jsf.initializeControl(this);
		if (hasOwn(this.options, 'disabled')) {
			this.controlDisabled = this.options.disabled;
		} else if (this.jsf.formOptions.disableInvalidSubmit) {
			this.controlDisabled = !this.jsf.isValid;
			this.jsf.isValidChanges.subscribe(
				(isValid) => (this.controlDisabled = !isValid)
			);
		}
		if (this.controlValue === null || this.controlValue === undefined) {
			this.controlValue = this.options.title;
		}
	}

	updateValue(event) {
		if (typeof this.options.onClick === 'function') {
			this.options.onClick(event);
		} else {
			this.jsf.updateValue(this, event.target.value);
		}
	}
}
