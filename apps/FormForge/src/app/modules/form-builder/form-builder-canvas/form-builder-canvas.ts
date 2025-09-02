import { Component, input, output, Type } from '@angular/core';
import { CanvasField, FieldType } from '@form-forge/models';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { NgComponentOutlet } from '@angular/common';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-builder-canvas',
  imports: [CdkDropList, NgComponentOutlet],
  templateUrl: './form-builder-canvas.html',
  styleUrl: './form-builder-canvas.scss',
  standalone: true,
})
export class FormBuilderCanvas {
  canvasFields = input<CanvasField[]>([]);
  selectedField = input<CanvasField | null>(null);
  componentMap = input.required<Record<FieldType, Type<any>>>();

  fieldDropped = output<CdkDragDrop<any[]>>();
  fieldSelected = output<CanvasField>();

  onDrop(event: CdkDragDrop<any[]>) {
    this.fieldDropped.emit(event);
  }

  onSelectField(field: CanvasField) {
    this.fieldSelected.emit(field);
  }

  getComponent(fieldType: FieldType): Type<any> | null {
    const component = this.componentMap()[fieldType];
    return component || null;
  }

  getComponentInputs(field: CanvasField): Record<string, any> {
    const inputs: Record<string, any> = {
      label: field.label,
      placeholder: field.placeholder,
      formControl: new FormControl(''),
    };

    if (field.type === FieldType.Select || field.type === FieldType.Radio) {
      inputs['options'] = field.options;
    }

    return inputs;
  }
}
