import { Component, computed, effect, inject, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import {
  AvailableField,
  FieldType,
  FormField,
  FormTheme,
} from '@form-forge/models';
import {
  CheckboxField,
  ColorPickerField,
  DateField,
  EmailField,
  FileUploadField,
  NumberField,
  RadioField,
  SelectorField,
  TextAreaField,
  TextField,
  RichTextField,
} from '@form-forge/ui-kit';
import { FormBuilderSidebar } from './components/form-builder-sidebar/form-builder-sidebar';
import { FormBuilderCanvas } from './components/form-builder-canvas/form-builder-canvas';
import { FormBuilderPropertyPanel } from './components/form-builder-property-panel/form-builder-property-panel';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../core/services/api.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilderService } from './services/form-builder.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NotificationService } from '../core/services/notification.service';
import { ThemeService } from '../core/services/theme.service';

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
    MatIconModule,
    MatButton,
    MatSnackBarModule,
    MatProgressSpinner,
    FormBuilderPropertyPanel,
  ],
  providers: [ApiService, HttpClient, FormBuilderService, NotificationService],
})
export class FormBuilderComponent {
  fields: FieldType[] = [
    FieldType.Text,
    FieldType.Number,
    FieldType.Select,
    FieldType.Checkbox,
    FieldType.Radio,
    FieldType.Date,
    FieldType.Email,
    FieldType.TextArea,
    FieldType.FileUpload,
    FieldType.RichText,
    FieldType.ColorPicker,
  ];

  availableFields: AvailableField[] = [
    { type: FieldType.Text, label: 'Text Input', icon: '' },
    { type: FieldType.Number, label: 'Number Input', icon: '' },
    {
      type: FieldType.Select,
      label: 'Dropdown',
      icon: '',
    },
    { type: FieldType.Email, label: 'Email', icon: '' },
    { type: FieldType.TextArea, label: 'Text Area', icon: '' },
    { type: FieldType.FileUpload, label: 'File Upload', icon: '' },
    { type: FieldType.Checkbox, label: 'Checkbox', icon: '' },
    { type: FieldType.Radio, label: 'Radio', icon: '' },
    { type: FieldType.Date, label: 'Date', icon: '' },
    { type: FieldType.RichText, label: 'Rich Text', icon: '' },
    { type: FieldType.ColorPicker, label: 'Color Picker', icon: '' },
  ];

  formBuilderService = inject(FormBuilderService);
  private themeService = inject(ThemeService);

  form = new FormGroup({});

  public isDarkMode = computed(
    () => this.themeService.currentTheme() === 'dark'
  );

  componentMap: Record<FieldType, Type<any>> = {
    [FieldType.Text]: TextField,
    [FieldType.Number]: NumberField,
    [FieldType.Select]: SelectorField,
    [FieldType.Checkbox]: CheckboxField,
    [FieldType.Radio]: RadioField,
    [FieldType.Date]: DateField,
    [FieldType.Email]: EmailField,
    [FieldType.TextArea]: TextAreaField,
    [FieldType.FileUpload]: FileUploadField,
    [FieldType.RichText]: RichTextField,
    [FieldType.ColorPicker]: ColorPickerField,
  };

  constructor() {
    effect(() => {
      const fields = this.formBuilderService.fields();
      const currentControlIds = Object.keys(this.form.controls);
      const fieldIds = fields.map((f) => f.id);

      currentControlIds
        .filter((id) => !fieldIds.includes(id))
        .forEach((id) => this.form.removeControl(id));

      fields
        .filter((field) => !currentControlIds.includes(field.id))
        .forEach((field) => this.form.addControl(field.id, new FormControl()));
    });
  }

  onDrop(event: CdkDragDrop<any[]>): void {
    this.formBuilderService.dropField(event);
  }

  onSelectField(field: FormField): void {
    this.formBuilderService.selectField(field);
  }

  onFieldChange(updatedValues: Partial<FormField>): void {
    this.formBuilderService.updateField(updatedValues);
  }

  saveForm(): void {
    this.formBuilderService.saveForm();
  }

  onThemeChange(theme: FormTheme): void {
    this.formBuilderService.updateTheme(theme);
  }
}
