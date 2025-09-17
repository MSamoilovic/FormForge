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
import { asyncScheduler, observeOn, startWith, Subject, takeUntil } from 'rxjs';

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
        observeOn(asyncScheduler),
        takeUntil(destroy$)
      )
      .subscribe((formValue) => {
        rules.forEach((rule) => {
          const conditionResults = rule.conditions.map((condition) =>
            this.evaluateCondition(condition, formValue)
          );

          const conditionsMet = conditionResults.every((result) => result);

          rule.actions.forEach((action) =>
            this.executeAction(action, form, conditionsMet)
          );
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
      return group.operator === 'and'
        ? results.every((r) => r)
        : results.some((r) => r);
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

  /**
   * Izvršava ili "poništava" akciju na osnovu toga da li su uslovi ispunjeni.
   */
  private executeAction(
    action: RuleAction,
    form: FormGroup,
    conditionsMet: boolean
  ): void {
    const targetControl = form.get(action.targetFieldId);
    if (!targetControl) return;

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
