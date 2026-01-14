import { Component, computed, inject, OnInit, Type } from '@angular/core';
import { FieldType, FormField } from '@form-forge/models';
import { ReactiveFormsModule } from '@angular/forms';

import { FIELD_TYPE_MAP } from '@form-forge/ui-kit';
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

  private componentMap = FIELD_TYPE_MAP;

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
    if (
      field.type === FieldType.Select ||
      field.type === FieldType.Radio ||
      field.type === FieldType.MultiSelect ||
      field.type === FieldType.LikertScale
    ) {
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
    if (field.type === FieldType.Phone) {
      inputs['defaultCountry'] = field.defaultCountry || 'RS';
      inputs['showCountrySelector'] = field.showCountrySelector !== false;
    }
    if (field.type === FieldType.FileUpload) {
      // Za sada koristimo podrazumevane vrednosti iz FileUploadField;
      // kasnije se ovde mogu vezati specifične opcije (accept, multiple, maxSize, maxFiles).
    }
    return inputs;
  }
}
