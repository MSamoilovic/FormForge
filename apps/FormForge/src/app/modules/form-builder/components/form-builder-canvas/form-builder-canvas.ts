import { Component, input, output, Type } from '@angular/core';
import { FieldType, FormField } from '@form-forge/models';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgComponentOutlet } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { MatCard, MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-form-builder-canvas',
  imports: [CdkDropList, NgComponentOutlet, MatCardModule, MatIconModule],
  templateUrl: './form-builder-canvas.html',
  styleUrl: './form-builder-canvas.scss',
  standalone: true,
})
export class FormBuilderCanvas {
  canvasFields = input<FormField[]>([]);
  selectedField = input<FormField | null>(null);
  componentMap = input.required<Record<FieldType, Type<any>>>();

  form = input.required<FormGroup>();

  fieldDropped = output<CdkDragDrop<any[]>>();
  fieldSelected = output<FormField>();

  onDrop(event: CdkDragDrop<any[]>) {
    this.fieldDropped.emit(event);
  }

  onSelectField(field: FormField) {
    this.fieldSelected.emit(field);
  }

  getComponent(fieldType: FieldType): Type<any> | null {
    const component = this.componentMap()[fieldType];
    return component || null;
  }

  getComponentInputs(field: FormField): Record<string, any> {
    const control = this.form().get(field.id);

    const inputs: Record<string, any> = {
      label: field.label,
      placeholder: field.placeholder,
      formControl: control,
    };

    if (field.type === FieldType.Select || field.type === FieldType.Radio) {
      inputs['options'] = field.options;
    }
    return inputs;
  }
}
