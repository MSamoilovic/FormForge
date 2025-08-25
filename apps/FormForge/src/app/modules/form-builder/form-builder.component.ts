import { Component, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { CanvasField, FieldType } from '@form-forge/models';
import {
  CheckboxField,
  DateField,
  RadioField,
  SelectorField,
  TextField,
} from '@form-forge/ui-kit';
import { FormBuilderSidebar } from './form-builder-sidebar/form-builder-sidebar';
import { FormBuilderCanvas } from './form-builder-canvas/form-builder-canvas';
import { FormBuilderPropertyPanel } from './form-builder-property-panel/form-builder-property-panel';

@Component({
  standalone: true,
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss'],
  imports: [
    CommonModule,
    DragDropModule,
    FormsModule,
    TextField,
    SelectorField,
    CheckboxField,
    RadioField,
    DateField,
    FormBuilderSidebar,
    FormBuilderCanvas,
    FormBuilderPropertyPanel,
  ],
})
export class FormBuilderComponent {
  fields: FieldType[] = [
    FieldType.Text,
    FieldType.Number,
    FieldType.Select,
    FieldType.Checkbox,
    FieldType.Radio,
    FieldType.Date,
  ];

  canvasFields: CanvasField[] = [];

  selectedField: CanvasField | null = null;

  componentMap: Record<FieldType, Type<any>> = {
    [FieldType.Text]: TextField,
    [FieldType.Number]: TextField,
    [FieldType.Select]: SelectorField,
    [FieldType.Checkbox]: CheckboxField,
    [FieldType.Radio]: RadioField,
    [FieldType.Date]: DateField,
  };

  onDrop(event: CdkDragDrop<any[]>) {
    const fieldType: FieldType = event.item.data;

    const newField: CanvasField = {
      id: crypto.randomUUID(),
      type: fieldType,
      label: `${fieldType} field`,
      placeholder: '',
      required: false,
      options:
        fieldType === FieldType.Select || fieldType === FieldType.Radio
          ? ['Option 1']
          : [],
    };

    this.canvasFields.push(newField);
    this.selectField(newField);
  }

  selectField(field: CanvasField) {
    this.selectedField = field;
  }

  addOption() {
    if (this.selectedField && this.selectedField.options) {
      this.selectedField.options.push(
        `Option ${this.selectedField.options.length + 1}`
      );
    }
  }

  removeOption(index: number) {
    if (this.selectedField && this.selectedField.options) {
      this.selectedField.options.splice(index, 1);
    }
  }

  onFieldChange(updatedValues: Partial<CanvasField>): void {
    if (this.selectedField) {
      this.selectedField = { ...this.selectedField, ...updatedValues };

      const index = this.canvasFields.findIndex(
        (f) => f.id === this.selectedField?.id
      );

      if (index !== -1) {
        this.canvasFields[index] = this.selectedField;
        // TODO: Imati u vidu i NGRX ovde
      }
    }
  }
}
