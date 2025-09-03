import { Component, inject, input, OnInit, Type } from '@angular/core';
import { CanvasField, FieldType } from '@form-forge/models';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CheckboxField, DateField, RadioField, SelectorField, TextField } from '@form-forge/ui-kit';
import { CommonModule, NgComponentOutlet } from '@angular/common';

@Component({
  imports: [ReactiveFormsModule, NgComponentOutlet, CommonModule],
  selector: 'app-form-renderer',
  standalone: true,
  styleUrl: './form-renderer.scss',
  templateUrl: './form-renderer.html',
  exportAs: 'formRenderer',
})
export class FormRenderer implements OnInit {
  readonly formSchema = input<CanvasField[]>();
  public form!: FormGroup;

  fb = inject(FormBuilder);

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
    const group: any = {};

    this.formSchema()?.forEach((field) => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }

      group[field.id] = [field.id || '', validators];
    });

    this.form = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Forma je ispravna, podaci:', this.form.value);
    } else {
      console.log('Forma nije ispravna.');
    }
  }

  public getComponent(fieldType: FieldType): Type<any> | null {
    return this.componentMap[fieldType] || null;
  }

  public getInput(field: CanvasField): any {
    switch (field.type) {
      case FieldType.Text:
        return {
          label: field.label,
          placeholder: field.placeholder,
          formControl: this.form.get(field.id),
          fieldType: field.type,
        };

      case FieldType.Select:
        return {
          label: field.label,
          placeholder: field.placeholder,
          formControl: this.form.get(field.id),
          fieldType: field.type,
          options: field.options,
        };
    }
  }
}
