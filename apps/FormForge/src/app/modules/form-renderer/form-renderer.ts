import { Component, computed, inject, OnInit } from '@angular/core';
import { FieldComponentInputs, FieldType, FormField } from '@form-forge/models';
import { ReactiveFormsModule } from '@angular/forms';

import { FIELD_TYPE_MAP, FieldComponentType } from '@form-forge/ui-kit';
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

  getComponent(fieldType: FieldType): FieldComponentType | null {
    return this.componentMap[fieldType] || null;
  }

  getComponentInputs(field: FormField): FieldComponentInputs {
    const formGroup = this.rendererService.formGroup();
    if (!formGroup) {
      return { label: field.label };
    }

    const inputs: FieldComponentInputs = {
      label: field.label,
      placeholder: field.placeholder,
      formControl: formGroup.get(field.id) ?? undefined,
    };

    if (
      field.type === FieldType.Select ||
      field.type === FieldType.Radio ||
      field.type === FieldType.MultiSelect ||
      field.type === FieldType.LikertScale
    ) {
      (inputs as { options?: typeof field.options }).options = field.options;
    }

    if (field.type === FieldType.Number) {
      const numberInputs = inputs as {
        min?: number;
        max?: number;
        step?: number;
      };
      if (field.min !== undefined) numberInputs.min = field.min;
      if (field.max !== undefined) numberInputs.max = field.max;
      if (field.step !== undefined) numberInputs.step = field.step;
    }

    if (field.type === FieldType.ColorPicker && field.colorFormat) {
      (inputs as { colorFormat?: typeof field.colorFormat }).colorFormat =
        field.colorFormat;
    }

    if (field.type === FieldType.Phone) {
      (inputs as { defaultCountry?: string }).defaultCountry =
        field.defaultCountry || 'RS';
      (inputs as { showCountrySelector?: boolean }).showCountrySelector =
        field.showCountrySelector !== false;
    }

   

    return inputs;
  }
}
