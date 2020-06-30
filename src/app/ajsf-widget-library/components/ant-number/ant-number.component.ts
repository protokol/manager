import { Component, Input, OnInit } from '@angular/core';
import { JsonSchemaFormService } from '@ajsf/core';
import { AbstractControl } from '@angular/forms';

@Component({
	selector: 'app-ant-number',
	templateUrl: './ant-number.component.html',
	styleUrls: ['./ant-number.component.scss'],
})
export class AntNumberComponent implements OnInit {
	formControl: AbstractControl;
	controlName: string;
	controlValue: any;
	controlDisabled = false;
	boundControl = false;
	options: any;
	allowNegative = true;
	allowDecimal = true;
	allowExponents = false;
	lastValidNumber = '';
	@Input() layoutNode: any;
	@Input() layoutIndex: number[];
	@Input() dataIndex: number[];

	constructor(private jsf: JsonSchemaFormService) {}

	ngOnInit() {
		this.options = this.layoutNode.options || {};
		this.jsf.initializeControl(this);
		if (this.layoutNode.dataType === 'integer') {
			this.allowDecimal = false;
		}
	}

	updateValue(event) {
		this.jsf.updateValue(this, event.target.value);
	}
}
