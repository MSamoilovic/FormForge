export interface ConditionGroup {
  operator: 'and' | 'or';
  conditions: (Condition | ConditionGroup)[];
}

export interface Action {
  type: 'show' | 'hide' | 'enable' | 'disable' | 'setValue';
  value?: any; //Action added for setValue
}

export interface Condition {
  fieldId: string;
  operator: 'eq' | 'neq' | 'gt' | 'lt';
  value: any;
}

export interface FieldRule {
  condition: Condition | ConditionGroup;
  targetedFieldId: string;
  action: Action;
}
