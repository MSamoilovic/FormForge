import { Component, computed, inject, OnInit, Type } from '@angular/core';
import { FieldType, FormField } from '@form-forge/models';
import { ReactiveFormsModule } from '@angular/forms';

import {
  CheckboxField,
  ColorPickerField,
  DateField,
  EmailField,
  FileUploadField,
  NumberField,
  RadioField,
  SelectorField,
  MultiSelectField,
  TextAreaField,
  TextField,
  RichTextField,
  ToggleSwitchField,
} from '@form-forge/ui-kit';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormRendererService } from './services/form-renderer.service';
import { FormRendererDataService } from './services/form-renderer-data.service';
import { ThemeService } from '../core/services/theme.service';

@Component({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatError,
    MatButton,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  providers: [FormRendererService, FormRendererDataService],
  selector: 'app-form-renderer',
  standalone: true,
  styleUrl: './form-renderer.scss',
  templateUrl: './form-renderer.html',
  exportAs: 'formRenderer',
})
export class FormRenderer implements OnInit {
  public readonly rendererService = inject(FormRendererService);
  private readonly route = inject(ActivatedRoute);
  private themeService = inject(ThemeService);

  private formId: number | null = null;

  public isDarkMode = computed(
    () => this.themeService.currentTheme() === 'dark'
  );

  private componentMap: Record<FieldType, Type<any>> = {
    [FieldType.Text]: TextField,
    [FieldType.Number]: NumberField,
    [FieldType.Select]: SelectorField,
    [FieldType.MultiSelect]: MultiSelectField,
    [FieldType.Checkbox]: CheckboxField,
    [FieldType.ToggleSwitch]: ToggleSwitchField,
    [FieldType.Radio]: RadioField,
    [FieldType.Date]: DateField,
    [FieldType.Email]: EmailField,
    [FieldType.TextArea]: TextAreaField,
    [FieldType.FileUpload]: FileUploadField,
    [FieldType.RichText]: RichTextField,
    [FieldType.ColorPicker]: ColorPickerField,
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.formId = +idParam;
      this.rendererService.initialize(this.formId);
    } else {
      console.error('Form ID is missing from the URL.');
    }
  }

  onSubmit(): void {
    if (this.formId) {
      this.rendererService.submit(this.formId);
    }
  }

  getComponent(fieldType: FieldType): Type<any> | null {
    return this.componentMap[fieldType] || null;
  }

  getComponentInputs(field: FormField): Record<string, any> {
    const formGroup = this.rendererService.formGroup();
    if (!formGroup) return {};

    const inputs: Record<string, any> = {
      label: field.label,
      placeholder: field.placeholder,
      formControl: formGroup.get(field.id),
    };
    if (field.type === FieldType.Select || field.type === FieldType.Radio || field.type === FieldType.MultiSelect) {
      inputs['options'] = field.options;
    }
    if (field.type === FieldType.Number) {
      if (field.min !== undefined) inputs['min'] = field.min;
      if (field.max !== undefined) inputs['max'] = field.max;
      if (field.step !== undefined) inputs['step'] = field.step;
    }
    if (field.type === FieldType.ColorPicker && field.colorFormat) {
      inputs['colorFormat'] = field.colorFormat;
    }
    if (field.type === FieldType.FileUpload) {
      // Za sada koristimo podrazumevane vrednosti iz FileUploadField;
      // kasnije se ovde mogu vezati specifične opcije (accept, multiple, maxSize, maxFiles).
    }
    return inputs;
  }
}
