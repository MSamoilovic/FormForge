import { Component, input, output } from '@angular/core';
import {
  AvailableField,
  FieldComponentInputs,
  FieldType,
  FormField,
} from '@form-forge/models';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgComponentOutlet } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FieldComponentType } from '@form-forge/ui-kit';

@Component({
  selector: 'app-form-builder-canvas',
  imports: [
    CdkDropList,
    NgComponentOutlet,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './form-builder-canvas.html',
  styleUrl: './form-builder-canvas.scss',
  standalone: true,
})
export class FormBuilderCanvas {
  canvasFields = input<FormField[]>([]);
  selectedField = input<FormField | null>(null);
  componentMap = input.required<Record<FieldType, FieldComponentType>>();

  form = input.required<FormGroup>();

  fieldDropped = output<CdkDragDrop<FormField[], AvailableField[], FieldType>>();
  fieldSelected = output<FormField>();
  fieldDuplicated = output<string>();
  fieldRemoved = output<string>();

  onDrop(event: CdkDragDrop<FormField[], AvailableField[], FieldType>): void {
    this.fieldDropped.emit(event);
  }

  onSelectField(field: FormField): void {
    this.fieldSelected.emit(field);
  }

  onDuplicateField(fieldId: string, event: Event): void {
    event.stopPropagation();
    this.fieldDuplicated.emit(fieldId);
  }

  onRemoveField(fieldId: string, event: Event): void {
    event.stopPropagation();
    this.fieldRemoved.emit(fieldId);
  }

  getComponent(fieldType: FieldType): FieldComponentType | null {
    const component = this.componentMap()[fieldType];
    return component || null;
  }

  getComponentInputs(field: FormField): FieldComponentInputs {
    const control = this.form().get(field.id);

    const inputs: FieldComponentInputs = {
      label: field.label,
      placeholder: field.placeholder,
      formControl: control ?? undefined,
    };

    if (
      field.type === FieldType.Select ||
      field.type === FieldType.Radio ||
      field.type === FieldType.MultiSelect ||
      field.type === FieldType.LikertScale
    ) {
      (inputs as { options?: typeof field.options }).options = field.options;
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
