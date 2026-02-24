import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  FormField,
  RuleActionType,
  RuleConditionOperator,
} from '@form-forge/models';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideTrash2,
  lucidePlus,
  lucideMinusCircle,
} from '@ng-icons/lucide';

const OPERATOR_LABELS: Record<RuleConditionOperator, string> = {
  [RuleConditionOperator.Equals]: 'Equals',
  [RuleConditionOperator.NotEquals]: 'Not Equals',
  [RuleConditionOperator.GreaterThan]: 'Greater Than',
  [RuleConditionOperator.GreaterThanOrEqual]: 'Greater Than Or Equal',
  [RuleConditionOperator.LessThan]: 'Less Than',
  [RuleConditionOperator.LessThanOrEqual]: 'Less Than Or Equal',
  [RuleConditionOperator.Between]: 'Between',
  [RuleConditionOperator.Contains]: 'Contains',
  [RuleConditionOperator.NotContains]: 'Not Contains',
  [RuleConditionOperator.StartsWith]: 'Starts With',
  [RuleConditionOperator.EndsWith]: 'Ends With',
  [RuleConditionOperator.Regex]: 'Matches Regex',
  [RuleConditionOperator.IsEmpty]: 'Is Empty',
  [RuleConditionOperator.IsNotEmpty]: 'Is Not Empty',
  [RuleConditionOperator.In]: 'Is One Of',
  [RuleConditionOperator.NotIn]: 'Is Not One Of',
};

const ACTION_LABELS: Record<RuleActionType, string> = {
  [RuleActionType.Show]: 'Show',
  [RuleActionType.Hide]: 'Hide',
  [RuleActionType.Enable]: 'Enable',
  [RuleActionType.Disable]: 'Disable',
  [RuleActionType.SetRequired]: 'Set Required',
  [RuleActionType.SetValue]: 'Set Value',
  [RuleActionType.ClearValue]: 'Clear Value',
};

const NO_VALUE_OPERATORS = new Set<RuleConditionOperator>([
  RuleConditionOperator.IsEmpty,
  RuleConditionOperator.IsNotEmpty,
]);

@Component({
  selector: 'app-field-rules',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIconComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideTrash2,
      lucidePlus,
      lucideMinusCircle,
    }),
  ],
  templateUrl: './form-builder-field-rules.component.html',
  styleUrl: './form-builder-field-rules.component.scss',
})
export class FormBuilderFieldRulesComponent {
  private fb = inject(FormBuilder);

  rulesFormArray = input.required<FormArray<FormGroup>>();
  allFormFields = input.required<FormField[]>();
  parentForm = input.required<FormGroup>();

  readonly conditionOperators = Object.values(RuleConditionOperator);
  readonly actionTypes = Object.values(RuleActionType);

  getOperatorLabel(op: RuleConditionOperator): string {
    return OPERATOR_LABELS[op] ?? op;
  }

  getActionLabel(type: RuleActionType): string {
    return ACTION_LABELS[type] ?? type;
  }

  needsValueInput(op: RuleConditionOperator): boolean {
    return !NO_VALUE_OPERATORS.has(op);
  }

  getValuePlaceholder(op: RuleConditionOperator): string {
    if (op === RuleConditionOperator.Between) return 'min,max  (e.g. 10,50)';
    if (op === RuleConditionOperator.In || op === RuleConditionOperator.NotIn) {
      return 'val1,val2,val3';
    }
    return 'Value';
  }

  needsActionValue(type: RuleActionType): boolean {
    return type === RuleActionType.SetValue;
  }

  addRule(): void {
    const ruleGroup = this.fb.group({
      id: [crypto.randomUUID()],
      description: [''],
      conditionLogic: ['and'],
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
      value: [''],
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
