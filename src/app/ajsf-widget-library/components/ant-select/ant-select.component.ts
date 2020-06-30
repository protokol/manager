import { Component, Input, OnInit } from '@angular/core';
import { buildTitleMap, JsonSchemaFormService } from '@ajsf/core';
import { AbstractControl } from '@angular/forms';

@Component({
	selector: 'app-ant-select',
	templateUrl: './ant-select.component.html',
	styleUrls: ['./ant-select.component.scss'],
})
export class AntSelectComponent implements OnInit {
	formControl: AbstractControl;
	controlName: string;
	controlValue: any;
	controlDisabled = false;
	boundControl = false;
	options: any;
	selectList: any[] = [];
	isArray = Array.isArray;
	@Input() layoutNode: any;
	@Input() layoutIndex: number[];
	@Input() dataIndex: number[];

	constructor(private jsf: JsonSchemaFormService) {}

	ngOnInit() {
		this.options = this.layoutNode.options || {};
		this.selectList = buildTitleMap(
			this.options.titleMap || this.options.enumNames,
			this.options.enum,
			!!this.options.required,
			!!this.options.flatList
		);
		this.jsf.initializeControl(this);
	}

	updateValue(value) {
		this.jsf.updateValue(this, value);
	}
}
