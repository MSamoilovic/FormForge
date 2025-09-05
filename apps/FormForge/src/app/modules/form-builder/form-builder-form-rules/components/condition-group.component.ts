import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { SimpleConditionComponent } from './simple-condition.component';

@Component({
  selector: 'app-condition-group',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SimpleConditionComponent],
  template: `
    <div
      class="p-4 space-y-4 border-2 border-dashed rounded-lg border-blue-400 bg-blue-50"
    >
      <div [formGroup]="conditionGroupForm()">
        <div class="flex items-center gap-4 mb-4">
          <select
            formControlName="operator"
            class="p-2 font-bold text-blue-800 bg-white border-2 border-blue-300 rounded-md"
          >
            <option value="and">AND</option>
            <option value="or">OR</option>
          </select>
          <button
            type="button"
            (click)="addSimpleCondition()"
            class="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Condition
          </button>
        </div>

        <div class="space-y-2" formArrayName="conditions">
          @for (condition of conditionsArray.controls; let i = $index; track
          condition) {

          <div [formGroupName]="i" class="flex items-center gap-2">
            <app-simple-condition
              [conditionForm]="$cast(condition, FormGroup)"
              [allFormFields]="allFormFields()"
            ></app-simple-condition>

            <button
              type="button"
              (click)="removeCondition(i)"
              class="px-3 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
            >
              X
            </button>
          </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class ConditionGroupComponent {
  private fb = inject(FormBuilder);

  readonly conditionGroupForm = input.required<FormGroup>();

  allFormFields = input.required<string[]>();

  get conditionsArray(): FormArray {
    return this.conditionGroupForm().get('conditions') as FormArray;
  }

  addSimpleCondition(): void {
    const simpleConditionGroup = this.fb.group({
      field: new FormControl(''), // The form field to check
      comparisonOperator: new FormControl('equals'), // e.g., 'equals', 'greater_than'
      value: new FormControl(''), // The value to compare against
    });

    this.conditionsArray.push(simpleConditionGroup);
  }

  removeCondition(index: number): void {
    this.conditionsArray.removeAt(index);
  }

  $cast(control: any, target: any): FormGroup {
    return control as FormGroup;
  }

  protected readonly FormGroup = FormGroup;
}
