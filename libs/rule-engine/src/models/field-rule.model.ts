export type Operator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

export type ActionType =
  | 'show'
  | 'hide'
  | 'enable'
  | 'disable'
  | 'setValue'
  | 'markAsRequired'
  | 'clearValue';

export interface Condition {
  fieldId: string;
  operator: Operator;
  value: any;
}

export interface ConditionGroup {
  operator: 'and' | 'or';
  not?: boolean;
  conditions: (Condition | ConditionGroup)[];
}

export interface Action {
  type: ActionType;
  value?: any;
  reason?: string;
}

export interface FieldRule {
  id?: string;
  condition: Condition | ConditionGroup;
  targetedFieldId: string;
  actions: Action[];
  description?: string;
}
