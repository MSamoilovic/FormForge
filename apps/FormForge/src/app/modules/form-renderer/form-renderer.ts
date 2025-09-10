import { Component, inject, OnInit, Type } from '@angular/core';
import {
  FieldType,
  FormField,
  FormSchema,
  ValidatorType,
} from '@form-forge/models';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  CheckboxField,
  DateField,
  RadioField,
  SelectorField,
  TextField,
} from '@form-forge/ui-kit';
import { CommonModule } from '@angular/common';
import { MOCK_FORM_SCHEMA } from './mock-schema';
import { MatCardModule } from '@angular/material/card';
import { MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { RuleEngineService } from '@form-forge/rule-engine';

@Component({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatError,
    MatButton,
  ],
  providers: [RuleEngineService],
  selector: 'app-form-renderer',
  standalone: true,
  styleUrl: './form-renderer.scss',
  templateUrl: './form-renderer.html',
  exportAs: 'formRenderer',
})
export class FormRenderer implements OnInit {
  formSchema: FormSchema = MOCK_FORM_SCHEMA;

  public form!: FormGroup;
  private fb = inject(FormBuilder);

  private componentMap: Record<FieldType, Type<any>> = {
    [FieldType.Text]: TextField,
    [FieldType.Number]: TextField,
    [FieldType.Select]: SelectorField,
    [FieldType.Checkbox]: CheckboxField,
    [FieldType.Radio]: RadioField,
    [FieldType.Date]: DateField,
  };

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    const group: { [key: string]: FormControl } = {};
    this.formSchema.fields.forEach((field) => {
      group[field.id] = this.createControl(field);
    });
    this.form = this.fb.group(group);
  }

  private createControl(field: FormField): FormControl {
    const validators = [];
    if (field.validations) {
      for (const rule of field.validations) {
        switch (rule.type) {
          case ValidatorType.Required:
            validators.push(Validators.required);
            break;
          case ValidatorType.MinLength:
            validators.push(Validators.minLength(rule.value));
            break;
          case ValidatorType.MaxLength:
            validators.push(Validators.maxLength(rule.value));
            break;
          case ValidatorType.Pattern:
            validators.push(Validators.pattern(rule.value));
            break;
          case ValidatorType.Min:
            validators.push(Validators.min(rule.value));
            break;
          case ValidatorType.Max:
            validators.push(Validators.max(rule.value));
            break;
        }
      }
    }
    return this.fb.control('', validators);
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Forma je validna. Podaci:', this.form.value);
      alert('Forma je uspešno poslata! Proverite konzolu.');
    } else {
      console.error('Forma nije validna.');
      this.form.markAllAsTouched();
    }
  }

  getComponent(fieldType: FieldType): Type<any> | null {
    return this.componentMap[fieldType] || null;
  }

  getComponentInputs(field: FormField): Record<string, any> {
    return {
      label: field.label,
      placeholder: field.placeholder,
      options: field.options,
      formControl: this.form.get(field.id),
    };
  }
}
