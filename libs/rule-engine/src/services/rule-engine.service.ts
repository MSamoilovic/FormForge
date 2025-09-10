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

import { startWith, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RuleEngineService {
  /**
   * Glavna javna metoda servisa.
   */
  public processRules(
    form: FormGroup,
    rules: FormRule[],
    destroy$: Subject<void>
  ): void {
    if (!rules || rules.length === 0) {
      return;
    }

    form.valueChanges
      .pipe(startWith(form.value), takeUntil(destroy$))
      .subscribe((formValue) => {
        rules.forEach((rule) => {
          const conditionResults = rule.conditions.map((condition) =>
            this.evaluateCondition(condition, formValue)
          );

          const conditionsMet = conditionResults.every((result) => result);

          if (conditionsMet) {
            rule.actions.forEach((action) => this.executeAction(action, form));
          }
        });
      });
  }

  private evaluateCondition(
    condition: RuleCondition | RuleConditionGroup,
    formValue: any
  ): boolean {
    if ('operator' in condition && 'conditions' in condition) {
      const group = condition as RuleConditionGroup;
      const results = group.conditions.map((c) =>
        this.evaluateCondition(c, formValue)
      );

      if (group.operator === 'and') {
        return results.every((result) => result);
      } else {
        // 'or'
        return results.some((result) => result);
      }
    } else {
      const singleCondition = condition as RuleCondition;
      const fieldValue = formValue[singleCondition.fieldId];

      switch (singleCondition.operator) {
        case RuleConditionOperator.Equals:
          return fieldValue == singleCondition.value;
        case RuleConditionOperator.NotEquals:
          return fieldValue != singleCondition.value;
        case RuleConditionOperator.GreaterThan:
          return fieldValue > singleCondition.value;
        case RuleConditionOperator.LessThan:
          return fieldValue < singleCondition.value;
        case RuleConditionOperator.Contains:
          return fieldValue?.includes(singleCondition.value);
        default:
          return false;
      }
    }
  }

  private executeAction(action: RuleAction, form: FormGroup): void {
    const targetControl = form.get(action.targetFieldId);
    if (!targetControl) return;

    switch (action.type) {
      case RuleActionType.Show:
        targetControl.enable({ emitEvent: false });
        break;
      case RuleActionType.Hide:
        targetControl.disable({ emitEvent: false });
        break;
      case RuleActionType.Enable:
        targetControl.enable({ emitEvent: false });
        break;
      case RuleActionType.Disable:
        targetControl.disable({ emitEvent: false });
        break;
      case RuleActionType.SetRequired:
        this.toggleValidator(targetControl, Validators.required, true);
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
