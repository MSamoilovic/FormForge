import { Component, computed, input, output } from '@angular/core';
import {
  AvailableField,
  FieldComponentInputs,
  FieldType,
  FormField,
  FormRule,
  RuleActionType,
  RuleCondition,
  RuleConditionGroup,
  RuleConditionOperator,
} from '@form-forge/models';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgComponentOutlet } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideLayoutGrid, lucideHand, lucideArrowLeft, lucideGripVertical, lucideCopy, lucideTrash2, lucideEye, lucideZap } from '@ng-icons/lucide';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardDescriptionComponent, CardContentComponent } from '../../../../shared/ui/card';
import { FieldComponentType } from '@form-forge/ui-kit';

@Component({
  selector: 'app-form-builder-canvas',
  imports: [
    CdkDropList,
    NgComponentOutlet,
    CardComponent,
    CardHeaderComponent,
    CardTitleComponent,
    CardDescriptionComponent,
    CardContentComponent,
    NgIconComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideLayoutGrid,
      lucideHand,
      lucideArrowLeft,
      lucideGripVertical,
      lucideCopy,
      lucideTrash2,
      lucideEye,
      lucideZap,
    }),
  ],
  templateUrl: './form-builder-canvas.html',
  styleUrl: './form-builder-canvas.scss',
  standalone: true,
})
export class FormBuilderCanvas {
  canvasFields = input<FormField[]>([]);
  selectedField = input<FormField | null>(null);
  componentMap = input.required<Record<FieldType, FieldComponentType>>();

  form = input.required<FormGroup>();

  /**
   * Per-field indikatori uslovne logike za prikaz na canvasu.
   * `isTarget` — ponašanje polja kontroliše neko pravilo (meta akcije).
   * `isTrigger` — promena ovog polja pokreće pravila (izvor uslova).
   */
  readonly ruleIndicators = computed<Record<string, RuleIndicator>>(() => {
    const fields = this.canvasFields();
    const labelOf = (id: string) =>
      fields.find((f) => f.id === id)?.label || id;
    const allRules: FormRule[] = fields.flatMap((f) => f.rules ?? []);

    const result: Record<string, RuleIndicator> = {};
    for (const field of fields) {
      const targetingRules = allRules.filter((r) =>
        r.actions?.some((a) => a.targetFieldId === field.id)
      );
      const triggeredRules = field.rules ?? [];

      const targets = new Set<string>();
      for (const rule of triggeredRules) {
        for (const action of rule.actions ?? []) {
          targets.add(labelOf(action.targetFieldId));
        }
      }

      result[field.id] = {
        isTarget: targetingRules.length > 0,
        isTrigger: triggeredRules.length > 0,
        targetSummary: targetingRules
          .map((r) => this.describeRuleForTarget(r, field.id, labelOf))
          .join('\n'),
        triggerSummary: targets.size
          ? `Affects: ${[...targets].join(', ')}`
          : '',
      };
    }
    return result;
  });

  fieldDropped = output<CdkDragDrop<FormField[], AvailableField[], FieldType>>();
  fieldSelected = output<FormField>();
  fieldDuplicated = output<string>();
  fieldRemoved = output<string>();

  onDrop(event: CdkDragDrop<FormField[], AvailableField[], FieldType>): void {
    this.fieldDropped.emit(event);
  }

  onSelectField(field: FormField): void {
    this.fieldSelected.emit(field);
  }

  onDuplicateField(fieldId: string, event: Event): void {
    event.stopPropagation();
    this.fieldDuplicated.emit(fieldId);
  }

  onRemoveField(fieldId: string, event: Event): void {
    event.stopPropagation();
    this.fieldRemoved.emit(fieldId);
  }

  getComponent(fieldType: FieldType): FieldComponentType | null {
    const component = this.componentMap()[fieldType];
    return component || null;
  }

  getComponentInputs(field: FormField): FieldComponentInputs {
    const control = this.form().get(field.id);

    const inputs: FieldComponentInputs = {
      label: field.label,
      placeholder: field.placeholder,
      formControl: control ?? undefined,
    };

    if (
      field.type === FieldType.Select ||
      field.type === FieldType.Radio ||
      field.type === FieldType.MultiSelect ||
      field.type === FieldType.LikertScale
    ) {
      (inputs as { options?: typeof field.options }).options = field.options;
    }

    if (field.type === FieldType.ColorPicker && field.colorFormat) {
      (inputs as { colorFormat?: typeof field.colorFormat }).colorFormat =
        field.colorFormat;
    }

    if (field.type === FieldType.Phone) {
      (inputs as { defaultCountry?: string }).defaultCountry =
        field.defaultCountry || 'RS';
      (inputs as { showCountrySelector?: boolean }).showCountrySelector =
        field.showCountrySelector !== false;
    }

    return inputs;
  }

  // ── Rule visualization helpers ───────────────────────────────────────────

  private describeRuleForTarget(
    rule: FormRule,
    targetFieldId: string,
    labelOf: (id: string) => string
  ): string {
    const action = rule.actions?.find((a) => a.targetFieldId === targetFieldId);
    const verb = action ? ACTION_VERB[action.type] : 'Changes';
    const cond = this.summarizeConditions(
      rule.conditions,
      rule.conditionLogic ?? 'and',
      labelOf
    );
    return cond ? `${verb} if: ${cond}` : verb;
  }

  private summarizeConditions(
    conditions: (RuleCondition | RuleConditionGroup)[] | undefined,
    logic: 'and' | 'or',
    labelOf: (id: string) => string
  ): string {
    if (!conditions?.length) return '';
    const joiner = logic === 'or' ? ' OR ' : ' AND ';
    return conditions
      .map((c) => {
        if ('conditions' in c) {
          return `(${this.summarizeConditions(c.conditions, c.operator, labelOf)})`;
        }
        const op = OPERATOR_SYMBOL[c.operator] ?? c.operator;
        if (NO_VALUE_OPERATORS.has(c.operator)) {
          return `${labelOf(c.fieldId)} ${op}`;
        }
        return `${labelOf(c.fieldId)} ${op} ${formatConditionValue(c.value)}`;
      })
      .join(joiner);
  }
}

interface RuleIndicator {
  isTarget: boolean;
  isTrigger: boolean;
  targetSummary: string;
  triggerSummary: string;
}

const ACTION_VERB: Record<RuleActionType, string> = {
  [RuleActionType.Show]: 'Shown',
  [RuleActionType.Hide]: 'Hidden',
  [RuleActionType.Enable]: 'Enabled',
  [RuleActionType.Disable]: 'Disabled',
  [RuleActionType.SetRequired]: 'Required',
  [RuleActionType.SetValue]: 'Set value',
  [RuleActionType.ClearValue]: 'Clear value',
};

const OPERATOR_SYMBOL: Record<RuleConditionOperator, string> = {
  [RuleConditionOperator.Equals]: '=',
  [RuleConditionOperator.NotEquals]: '≠',
  [RuleConditionOperator.GreaterThan]: '>',
  [RuleConditionOperator.GreaterThanOrEqual]: '≥',
  [RuleConditionOperator.LessThan]: '<',
  [RuleConditionOperator.LessThanOrEqual]: '≤',
  [RuleConditionOperator.Between]: 'between',
  [RuleConditionOperator.Contains]: 'contains',
  [RuleConditionOperator.NotContains]: 'does not contain',
  [RuleConditionOperator.StartsWith]: 'starts with',
  [RuleConditionOperator.EndsWith]: 'ends with',
  [RuleConditionOperator.Regex]: 'matches regex',
  [RuleConditionOperator.IsEmpty]: 'is empty',
  [RuleConditionOperator.IsNotEmpty]: 'is not empty',
  [RuleConditionOperator.In]: 'is one of',
  [RuleConditionOperator.NotIn]: 'is not one of',
};

const NO_VALUE_OPERATORS = new Set<RuleConditionOperator>([
  RuleConditionOperator.IsEmpty,
  RuleConditionOperator.IsNotEmpty,
]);

function formatConditionValue(value: RuleCondition['value']): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && 'min' in value && 'max' in value) {
    return `${value.min}–${value.max}`;
  }
  return `"${value}"`;
}
