import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-simple-condition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div
      [formGroup]="conditionForm()"
      class="flex items-center gap-2 p-2 bg-gray-100 rounded-md"
    >
      <select formControlName="field" class="p-2 border rounded-md">
        <option value="">Select Field</option>
        @for (field of allFormFields(); track field) {
        <option [value]="field">{{ field }}</option>
        }
      </select>
      <select
        formControlName="comparisonOperator"
        class="p-2 border rounded-md"
      >
        <option value="equals">Equals</option>
        <option value="not_equals">Not Equals</option>
        <option value="greater_than">Greater Than</option>
      </select>
      <input
        formControlName="value"
        type="text"
        class="p-2 border rounded-md"
        placeholder="Value"
      />
    </div>
  `,
})
export class SimpleConditionComponent {
  readonly conditionForm = input.required<FormGroup>();
  readonly allFormFields = input.required<string[]>();
}
