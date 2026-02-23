export enum RuleConditionOperator {
  Equals = 'equals',
  NotEquals = 'notEquals',
  GreaterThan = 'greaterThan',
  GreaterThanOrEqual = 'greaterThanOrEqual',
  LessThan = 'lessThan',
  LessThanOrEqual = 'lessThanOrEqual',
  Between = 'between',
  Contains = 'contains',
  NotContains = 'notContains',
  StartsWith = 'startsWith',
  EndsWith = 'endsWith',
  Regex = 'regex',
  IsEmpty = 'isEmpty',
  IsNotEmpty = 'isNotEmpty',
  In = 'in',
  NotIn = 'notIn',
}

export enum RuleActionType {
  Show = 'show',
  Hide = 'hide',
  Enable = 'enable',
  Disable = 'disable',
  SetRequired = 'setRequired',
  SetValue = 'setValue',
  ClearValue = 'clearValue',
}

export type RuleConditionValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | { min: number; max: number };

export interface RuleCondition {
  fieldId: string;
  operator: RuleConditionOperator;
  value: RuleConditionValue;
}

export interface RuleConditionGroup {
  operator: 'and' | 'or';
  conditions: (RuleCondition | RuleConditionGroup)[];
}

export interface RuleAction {
  targetFieldId: string;
  type: RuleActionType;
  value?: string | number | boolean | null;
}

export interface FormRule {
  id: string;
  description?: string;
  conditionLogic?: 'and' | 'or';
  conditions: (RuleCondition | RuleConditionGroup)[];
  actions: RuleAction[];
}
