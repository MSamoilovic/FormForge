export enum RuleConditionOperator {
  Equals = 'equals',
  NotEquals = 'notEquals',
  GreaterThan = 'greaterThan',
  LessThan = 'lessThan',
  Contains = 'contains',
}

export enum RuleActionType {
  Show = 'show',
  Hide = 'hide',
  Enable = 'enable',
  Disable = 'disable',
  SetRequired = 'setRequired',
}

export interface RuleCondition {
  fieldId: string;
  operator: RuleConditionOperator;
  value: any;
}

export interface RuleAction {
  targetFieldId: string;
  type: RuleActionType;
  value?: any;
}

export interface FormRule {
  id: string;
  description?: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
}
