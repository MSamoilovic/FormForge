import { Component, effect, inject, signal, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
} from '@angular/forms';
import { FieldOption, FieldType, FormField } from '@form-forge/models';
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

  private fb = inject(FormBuilder);

  canvasFields = signal<FormField[]>([]);
  selectedField = signal<FormField | null>(null);

  form = new FormGroup({});

  componentMap: Record<FieldType, Type<any>> = {
    [FieldType.Text]: TextField,
    [FieldType.Number]: TextField,
    [FieldType.Select]: SelectorField,
    [FieldType.Checkbox]: CheckboxField,
    [FieldType.Radio]: RadioField,
    [FieldType.Date]: DateField,
  };

  constructor() {
    effect(() => {
      const fields = this.canvasFields();
      const currentControlIds = Object.keys(this.form.controls);
      const fieldIds = fields.map((f) => f.id);

      currentControlIds
        .filter((id) => !fieldIds.includes(id))
        .forEach((id) => this.form.removeControl(id));

      // 2. Dodajemo nove kontrole za polja koja su tek dodata
      fields
        .filter((field) => !currentControlIds.includes(field.id))
        .forEach((field) => {
          this.form.addControl(field.id, this.createControl(field));
        });
    });
  }

  onDrop(event: CdkDragDrop<any[]>) {
    const fieldType: FieldType = event.item.data;

    const newField: FormField = {
      id: crypto.randomUUID(),
      type: fieldType,
      label: `${fieldType} field`,
      placeholder: '',
      required: false,
      options:
        fieldType === FieldType.Select || fieldType === FieldType.Radio
          ? [{ label: 'Option1', value: 'option1' }]
          : [],
    };

    this.canvasFields.update((currentFields) => [...currentFields, newField]);
    this.selectField(newField);
  }

  selectField(field: FormField) {
    this.selectedField.set(field);
  }

  addOption() {
    const selected = this.selectedField();

    if (!selected || !selected.options) {
      return;
    }

    const options = selected.options;

    const newOption: FieldOption = {
      label: `Option ${options.length + 1}`,
      value: `option${options.length + 1}`,
    };

    const newOptions = [...options, newOption];
    this.onFieldChange({ options: newOptions });
  }

  removeOption(index: number) {
    const selected = this.selectedField();

    if (!selected || !selected.options) {
      return;
    }

    const newOptions = selected.options.filter((_, i) => i !== index);
    this.onFieldChange({ options: newOptions });
  }

  onFieldChange(updatedValues: Partial<FormField>): void {
    const currentSelected = this.selectedField();
    if (currentSelected) {
      const updatedField = { ...currentSelected, ...updatedValues };

      this.selectedField.set(updatedField);

      this.canvasFields.update((fields) =>
        fields.map((f) => (f.id === updatedField.id ? updatedField : f))
      );
    }
  }

  private createControl(field: FormField): FormControl {

    return this.fb.control('');
  }
}
