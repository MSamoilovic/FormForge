import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, RuleActionType, RuleConditionOperator } from '@form-forge/models';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-field-rules',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './form-builder-field-rules.component.html',
  styleUrl: './form-builder-field-rules.component.scss',
})
export class FormBuilderFieldRulesComponent {
  private fb = inject(FormBuilder);

  rulesFormArray = input.required<FormArray<FormGroup>>();
  allFormFields = input.required<FormField[]>();

  readonly conditionOperators = Object.values(RuleConditionOperator);
  readonly actionTypes = Object.values(RuleActionType);

  //
  parentForm = input.required<FormGroup>();

  addRule(): void {
    const ruleGroup = this.fb.group({
      id: [crypto.randomUUID()],
      description: [''],
      conditions: this.fb.array([]),
      actions: this.fb.array([]),
    });
    this.rulesFormArray().push(ruleGroup);
    this.addCondition(this.rulesFormArray().length - 1);
    this.addAction(this.rulesFormArray().length - 1);
  }

  removeRule(ruleIndex: number): void {
    this.rulesFormArray().removeAt(ruleIndex);
  }

  conditions(ruleIndex: number): FormArray {
    return this.rulesFormArray().at(ruleIndex).get('conditions') as FormArray;
  }

  addCondition(ruleIndex: number): void {
    const conditionGroup = this.fb.group({
      fieldId: ['', Validators.required],
      operator: [RuleConditionOperator.Equals, Validators.required],
      value: ['', Validators.required],
    });
    this.conditions(ruleIndex).push(conditionGroup);
  }

  removeCondition(ruleIndex: number, conditionIndex: number): void {
    this.conditions(ruleIndex).removeAt(conditionIndex);
  }

  actions(ruleIndex: number): FormArray {
    return this.rulesFormArray().at(ruleIndex).get('actions') as FormArray;
  }

  addAction(ruleIndex: number): void {
    const actionGroup = this.fb.group({
      targetFieldId: ['', Validators.required],
      type: [RuleActionType.Show, Validators.required],
      value: [null],
    });
    this.actions(ruleIndex).push(actionGroup);
  }

  removeAction(ruleIndex: number, actionIndex: number): void {
    this.actions(ruleIndex).removeAt(actionIndex);
  }
}
