import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-field-rules',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-builder-field-rules.component.html',
  styleUrl: './form-builder-field-rules.component.scss',
})
export class FormBuilderFieldRulesComponent {
  readonly rulesFormArray = input.required<FormArray<FormGroup>>();
  readonly allFormFields = input.required<string[]>();

  get parentFormGroup(): FormGroup {
    const parent = this.rulesFormArray().parent;
    if (!parent || !(parent instanceof FormGroup)) {
      throw new Error('rulesFormArray parent is not a FormGroup');
    }
    return parent;
  }

  addRule() {
    const newRuleGroup = new FormGroup({
      condition: new FormGroup({
        fieldId: new FormControl(''),
        operator: new FormControl('eq'),
        value: new FormControl(''),
      }),
      action: new FormGroup({
        type: new FormControl('show'),
        value: new FormControl(null),
      }),
      targetFieldId: new FormControl(''),
    });
    this.rulesFormArray().push(newRuleGroup);
  }

  removeRule(index: number) {
    this.rulesFormArray().removeAt(index);
  }

  getConditionForm(ruleGroup: FormGroup): FormGroup | FormArray {
    const condition = ruleGroup.get('condition');
    if (condition instanceof FormGroup) {
      return condition;
    }
    throw new Error('Condition form control is not a FormGroup');
  }

  protected readonly FormGroup = FormGroup;
}
