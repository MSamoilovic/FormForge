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
  lucideCopy,
  lucideChevronUp,
  lucideChevronDown,
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

type RawConditionValue =
  | { fieldId: string; operator: string; value: string }
  | { operator: string; conditions: RawConditionValue[] };

type RawActionValue = { targetFieldId: string; type: string; value: string | null };

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
      lucideCopy,
      lucideChevronUp,
      lucideChevronDown,
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

  // ── Labels & placeholders ─────────────────────────────────────────────────

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

  // ── Value format validation ───────────────────────────────────────────────

  getValueError(ruleIndex: number, conditionIndex: number): string | null {
    const group = this.conditions(ruleIndex).at(conditionIndex) as FormGroup;
    return this.checkValueFormat(group);
  }

  getNestedValueError(ruleIndex: number, groupIndex: number, conditionIndex: number): string | null {
    const group = this.nestedConditions(ruleIndex, groupIndex).at(conditionIndex) as FormGroup;
    return this.checkValueFormat(group);
  }

  private checkValueFormat(conditionGroup: FormGroup): string | null {
    const op: RuleConditionOperator = conditionGroup.get('operator')?.value;
    const val: string = conditionGroup.get('value')?.value ?? '';

    if (!val.trim()) return null;

    if (op === RuleConditionOperator.Between) {
      const parts = val.split(',');
      if (
        parts.length !== 2 ||
        isNaN(Number(parts[0]?.trim())) ||
        isNaN(Number(parts[1]?.trim()))
      ) {
        return 'Expected format: min,max (e.g. 10,50)';
      }
      if (Number(parts[0].trim()) > Number(parts[1].trim())) {
        return 'Min must be less than or equal to max';
      }
    }

    if (
      op === RuleConditionOperator.In ||
      op === RuleConditionOperator.NotIn
    ) {
      const parts = val.split(',').filter((p) => p.trim() !== '');
      if (parts.length < 2) {
        return 'Provide at least 2 comma-separated values';
      }
    }

    return null;
  }

  // ── Rules ─────────────────────────────────────────────────────────────────

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

  moveRuleUp(ruleIndex: number): void {
    if (ruleIndex === 0) return;
    const rules = this.rulesFormArray();
    const current = rules.at(ruleIndex);
    rules.removeAt(ruleIndex, { emitEvent: false });
    rules.insert(ruleIndex - 1, current);
  }

  moveRuleDown(ruleIndex: number): void {
    const rules = this.rulesFormArray();
    if (ruleIndex >= rules.length - 1) return;
    const current = rules.at(ruleIndex);
    rules.removeAt(ruleIndex, { emitEvent: false });
    rules.insert(ruleIndex + 1, current);
  }

  duplicateRule(ruleIndex: number): void {
    const source = this.rulesFormArray().at(ruleIndex).getRawValue();
    const duplicate = this.fb.group({
      id: [crypto.randomUUID()],
      description: [source.description ? `${source.description} (copy)` : ''],
      conditionLogic: [source.conditionLogic],
      conditions: this.fb.array(
        (source.conditions as RawConditionValue[]).map((c) => this.createConditionFormGroup(c))
      ),
      actions: this.fb.array(
        (source.actions as RawActionValue[]).map((a) => this.fb.group(a))
      ),
    });
    this.rulesFormArray().insert(ruleIndex + 1, duplicate);
  }

  // ── Simple conditions ─────────────────────────────────────────────────────

  conditions(ruleIndex: number): FormArray {
    return this.rulesFormArray().at(ruleIndex).get('conditions') as FormArray;
  }

  addCondition(ruleIndex: number): void {
    this.conditions(ruleIndex).push(this.createSimpleConditionFormGroup());
  }

  removeCondition(ruleIndex: number, conditionIndex: number): void {
    this.conditions(ruleIndex).removeAt(conditionIndex);
  }

  // ── Condition groups ──────────────────────────────────────────────────────

  isConditionGroup(ruleIndex: number, conditionIndex: number): boolean {
    const ctrl = this.conditions(ruleIndex).at(conditionIndex) as FormGroup;
    return ctrl.get('conditions') !== null;
  }

  addConditionGroup(ruleIndex: number): void {
    const group = this.fb.group({
      operator: ['and'],
      conditions: this.fb.array([this.createSimpleConditionFormGroup()]),
    });
    this.conditions(ruleIndex).push(group);
  }

  nestedConditions(ruleIndex: number, groupIndex: number): FormArray {
    return this.conditions(ruleIndex).at(groupIndex).get('conditions') as FormArray;
  }

  addConditionToGroup(ruleIndex: number, groupIndex: number): void {
    this.nestedConditions(ruleIndex, groupIndex).push(
      this.createSimpleConditionFormGroup()
    );
  }

  removeConditionFromGroup(ruleIndex: number, groupIndex: number, conditionIndex: number): void {
    this.nestedConditions(ruleIndex, groupIndex).removeAt(conditionIndex);
  }

  // ── Actions ───────────────────────────────────────────────────────────────

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

  // ── Helpers ───────────────────────────────────────────────────────────────

  private createSimpleConditionFormGroup(): FormGroup {
    return this.fb.group({
      fieldId: ['', Validators.required],
      operator: [RuleConditionOperator.Equals, Validators.required],
      value: [''],
    });
  }

  private createConditionFormGroup(value: RawConditionValue): FormGroup {
    if ('conditions' in value) {
      return this.fb.group({
        operator: [value.operator],
        conditions: this.fb.array(
          value.conditions.map((c) => this.createConditionFormGroup(c))
        ),
      });
    }
    return this.fb.group({
      fieldId: [value.fieldId, Validators.required],
      operator: [value.operator, Validators.required],
      value: [value.value],
    });
  }
}
