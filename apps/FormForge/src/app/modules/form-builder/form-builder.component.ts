import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import {
  AvailableField,
  FieldType,
  FormField,
  FormTheme,
} from '@form-forge/models';
import { FIELD_TYPE_MAP } from '@form-forge/ui-kit';
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
import { HistoryService } from './services/history.service';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatTooltipModule,
  ],
  providers: [ApiService, HttpClient, FormBuilderService, NotificationService, HistoryService],
})
export class FormBuilderComponent {
  fields: FieldType[] = [
    FieldType.Text,
    FieldType.Number,
    FieldType.Select,
    FieldType.MultiSelect,
    FieldType.Checkbox,
    FieldType.ToggleSwitch,
    FieldType.Radio,
    FieldType.Date,
    FieldType.Email,
    FieldType.Phone,
    FieldType.TextArea,
    FieldType.FileUpload,
    FieldType.RichText,
    FieldType.ColorPicker,
    FieldType.LikertScale,
  ];

  availableFields: AvailableField[] = [
    { type: FieldType.Text, label: 'Text Input', icon: 'text_fields' },
    { type: FieldType.Number, label: 'Number Input', icon: 'pin' },
    {
      type: FieldType.Select,
      label: 'Dropdown',
      icon: 'arrow_drop_down_circle',
    },
    {
      type: FieldType.MultiSelect,
      label: 'Multi Select',
      icon: 'checklist',
    },
    { type: FieldType.Email, label: 'Email', icon: 'alternate_email' },
    { type: FieldType.Phone, label: 'Phone', icon: 'phone' },
    { type: FieldType.TextArea, label: 'Text Area', icon: 'notes' },
    { type: FieldType.FileUpload, label: 'File Upload', icon: 'cloud_upload' },
    { type: FieldType.Checkbox, label: 'Checkbox', icon: 'check_box' },
    { type: FieldType.ToggleSwitch, label: 'Toggle Switch', icon: 'toggle_on' },
    { type: FieldType.Radio, label: 'Radio', icon: 'radio_button_checked' },
    { type: FieldType.Date, label: 'Date', icon: 'calendar_today' },
    { type: FieldType.RichText, label: 'Rich Text', icon: 'format_align_left' },
    { type: FieldType.ColorPicker, label: 'Color Picker', icon: 'palette' },
    {
      type: FieldType.LikertScale,
      label: 'Likert Scale',
      icon: 'linear_scale',
    },
  ];

  formBuilderService = inject(FormBuilderService);
  private themeService = inject(ThemeService);

  form = new FormGroup({});

  public isDarkMode = computed(
    () => this.themeService.currentTheme() === 'dark'
  );

  componentMap = FIELD_TYPE_MAP;

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
        .forEach((field) => {
          // MultiSelect field should be initialized with an empty array
          // Phone field should be initialized with empty string
          const initialValue =
            field.type === FieldType.MultiSelect
              ? []
              : field.type === FieldType.Phone
              ? ''
              : null;
          this.form.addControl(field.id, new FormControl(initialValue));
        });
    });
  }

  onDrop(event: CdkDragDrop<FormField[], AvailableField[], FieldType>): void {
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

  onDuplicateField(fieldId: string): void {
    this.formBuilderService.duplicateField(fieldId);
  }

  onRemoveField(fieldId: string): void {
    this.formBuilderService.removeField(fieldId);
  }

  undo(): void {
    this.formBuilderService.undo();
  }

  redo(): void {
    this.formBuilderService.redo();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    const isCtrlOrMeta = event.ctrlKey || event.metaKey;
    
    // Ctrl/Cmd + D: Duplicate field
    if (isCtrlOrMeta && event.key === 'd') {
      const selectedField = this.formBuilderService.selected();
      if (selectedField) {
        event.preventDefault();
        this.onDuplicateField(selectedField.id);
      }
    }
    
    // Ctrl/Cmd + Z: Undo
    if (isCtrlOrMeta && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      this.undo();
    }
    
    // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
    if (isCtrlOrMeta && ((event.key === 'z' && event.shiftKey) || event.key === 'y')) {
      event.preventDefault();
      this.redo();
    }
    
    // Delete/Backspace: Remove selected field
    if ((event.key === 'Delete' || event.key === 'Backspace') && !this.isInputFocused()) {
      const selectedField = this.formBuilderService.selected();
      if (selectedField) {
        event.preventDefault();
        this.onRemoveField(selectedField.id);
      }
    }
  }

  /**
   * Check if an input element is currently focused to avoid capturing delete in text fields
   */
  private isInputFocused(): boolean {
    const activeElement = document.activeElement;
    if (!activeElement) return false;
    
    const tagName = activeElement.tagName.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || 
           activeElement.hasAttribute('contenteditable');
  }
}
