import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  FormRule,
  RuleAction,
  RuleActionType,
  RuleCondition,
  RuleConditionGroup,
  RuleConditionOperator,
} from '@form-forge/models';
import {
  asyncScheduler,
  debounceTime,
  observeOn,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RuleEngineService {
  public processRules(
    form: FormGroup,
    rules: FormRule[],
    destroy$: Subject<void>
  ): void {
    if (!rules || rules.length === 0) {
      return;
    }

    form.valueChanges
      .pipe(
        startWith(form.value),
        debounceTime(50),
        observeOn(asyncScheduler),
        takeUntil(destroy$)
      )
      .subscribe((formValue) => {
        rules.forEach((rule) => {
          const conditionResults = rule.conditions.map((condition) =>
            this.evaluateCondition(condition, formValue)
          );

          const logic = rule.conditionLogic ?? 'and';
          const conditionsMet =
            logic === 'and'
              ? conditionResults.every((r) => r)
              : conditionResults.some((r) => r);

          rule.actions.forEach((action) =>
            this.executeAction(action, form, conditionsMet)
          );
        });
      });
  }

  private evaluateCondition(
    condition: RuleCondition | RuleConditionGroup,
    formValue: Record<string, unknown>
  ): boolean {
    if ('operator' in condition && 'conditions' in condition) {
      const group = condition as RuleConditionGroup;
      const results = group.conditions.map((c) =>
        this.evaluateCondition(c, formValue)
      );
      return group.operator === 'and'
        ? results.every((r) => r)
        : results.some((r) => r);
    }

    const { fieldId, operator, value } = condition as RuleCondition;
    const fieldValue = formValue[fieldId];

    switch (operator) {
      case RuleConditionOperator.Equals:
        return fieldValue === value;
      case RuleConditionOperator.NotEquals:
        return fieldValue !== value;
      case RuleConditionOperator.GreaterThan:
        return (fieldValue as number) > (value as number);
      case RuleConditionOperator.GreaterThanOrEqual:
        return (fieldValue as number) >= (value as number);
      case RuleConditionOperator.LessThan:
        return (fieldValue as number) < (value as number);
      case RuleConditionOperator.LessThanOrEqual:
        return (fieldValue as number) <= (value as number);
      case RuleConditionOperator.Between: {
        let min: number, max: number;
        if (typeof value === 'object' && value !== null && 'min' in (value as object)) {
          const range = value as { min: number; max: number };
          min = range.min;
          max = range.max;
        } else {
          const parts = String(value).split(',');
          min = Number(parts[0]?.trim());
          max = Number(parts[1]?.trim());
        }
        const num = Number(fieldValue);
        return num >= min && num <= max;
      }

      // String
      case RuleConditionOperator.Contains:
        return String(fieldValue ?? '').includes(String(value));
      case RuleConditionOperator.NotContains:
        return !String(fieldValue ?? '').includes(String(value));
      case RuleConditionOperator.StartsWith:
        return String(fieldValue ?? '').startsWith(String(value));
      case RuleConditionOperator.EndsWith:
        return String(fieldValue ?? '').endsWith(String(value));
      case RuleConditionOperator.Regex:
        return new RegExp(String(value)).test(String(fieldValue ?? ''));

      // Prisustvo
      case RuleConditionOperator.IsEmpty:
        return this.isEmpty(fieldValue);
      case RuleConditionOperator.IsNotEmpty:
        return !this.isEmpty(fieldValue);

      // Lista
      case RuleConditionOperator.In: {
        const list = Array.isArray(value)
          ? value.map(String)
          : String(value).split(',').map((v) => v.trim());
        return list.includes(String(fieldValue));
      }
      case RuleConditionOperator.NotIn: {
        const list = Array.isArray(value)
          ? value.map(String)
          : String(value).split(',').map((v) => v.trim());
        return !list.includes(String(fieldValue));
      }

      default:
        return false;
    }
  }

  private isEmpty(value: unknown): boolean {
    return (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    );
  }

  private executeAction(
    action: RuleAction,
    form: FormGroup,
    conditionsMet: boolean
  ): void {
    const targetControl = form.get(action.targetFieldId);

    if (!targetControl) {
      if (typeof ngDevMode !== 'undefined' && ngDevMode) {
        console.warn(
          `[RuleEngine] Target field "${action.targetFieldId}" not found in form. ` +
            `Check rule action configuration.`
        );
      }
      return;
    }

    switch (action.type) {
      case RuleActionType.Show:
        if (conditionsMet) {
          targetControl.enable({ emitEvent: false });
        } else {
          targetControl.disable({ emitEvent: false });
        }
        break;
      case RuleActionType.Hide:
        if (conditionsMet) {
          targetControl.disable({ emitEvent: false });
        } else {
          targetControl.enable({ emitEvent: false });
        }
        break;
      case RuleActionType.Enable:
        if (conditionsMet) {
          targetControl.enable({ emitEvent: false });
        } else {
          targetControl.disable({ emitEvent: false });
        }
        break;
      case RuleActionType.Disable:
        if (conditionsMet) {
          targetControl.disable({ emitEvent: false });
        } else {
          targetControl.enable({ emitEvent: false });
        }
        break;
      case RuleActionType.SetRequired:
        this.toggleValidator(targetControl, Validators.required, conditionsMet);
        break;
      case RuleActionType.SetValue:
        if (conditionsMet) {
          targetControl.setValue(action.value ?? null, { emitEvent: false });
        }
        break;
      case RuleActionType.ClearValue:
        if (conditionsMet) {
          targetControl.setValue(null, { emitEvent: false });
        }
        break;
    }

    targetControl.updateValueAndValidity({ emitEvent: false });
  }

  private toggleValidator(
    control: AbstractControl,
    validator: ValidatorFn,
    add: boolean
  ): void {
    if (add) {
      control.addValidators(validator);
    } else {
      control.removeValidators(validator);
    }
  }
}
