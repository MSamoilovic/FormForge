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
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideUndo, lucideRedo, lucideEye, lucideSave, lucideLoader2,
  lucideType, lucideHash, lucideChevronDown, lucideListChecks,
  lucideMail, lucideLink, lucideLock, lucidePhone, lucideAlignLeft,
  lucideCloudUpload, lucideSquareCheck, lucideToggleRight, lucideCircleDot,
  lucideCalendar, lucidePalette, lucideSliders, lucideLayoutGrid, lucideGripVertical,
} from '@ng-icons/lucide';
import { ApiService } from '../core/services/api.service';
import { HttpClient } from '@angular/common/http';
import { FormBuilderService } from './services/form-builder.service';
import { NotificationService } from '../core/services/notification.service';
import { ThemeService } from '../core/services/theme.service';
import { HistoryService } from './services/history.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';

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
    NgIconComponent,
    ButtonComponent,
  ],
  viewProviders: [
    provideIcons({
      lucideUndo,
      lucideRedo,
      lucideEye,
      lucideSave,
      lucideLoader2,
      lucideType,
      lucideHash,
      lucideChevronDown,
      lucideListChecks,
      lucideMail,
      lucideLink,
      lucideLock,
      lucidePhone,
      lucideAlignLeft,
      lucideCloudUpload,
      lucideSquareCheck,
      lucideToggleRight,
      lucideCircleDot,
      lucideCalendar,
      lucidePalette,
      lucideSliders,
      lucideLayoutGrid,
      lucideGripVertical,
    }),
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
    FieldType.Url,
    FieldType.Password,
    FieldType.Phone,
    FieldType.TextArea,
    FieldType.FileUpload,
    FieldType.RichText,
    FieldType.ColorPicker,
    FieldType.LikertScale,
  ];

  availableFields: AvailableField[] = [
    { type: FieldType.Text, label: 'Text Input', icon: 'lucideType' },
    { type: FieldType.Number, label: 'Number Input', icon: 'lucideHash' },
    { type: FieldType.Select, label: 'Dropdown', icon: 'lucideChevronDown' },
    { type: FieldType.MultiSelect, label: 'Multi Select', icon: 'lucideListChecks' },
    { type: FieldType.Email, label: 'Email', icon: 'lucideMail' },
    { type: FieldType.Url, label: 'URL', icon: 'lucideLink' },
    { type: FieldType.Password, label: 'Password', icon: 'lucideLock' },
    { type: FieldType.Phone, label: 'Phone', icon: 'lucidePhone' },
    { type: FieldType.TextArea, label: 'Text Area', icon: 'lucideAlignLeft' },
    { type: FieldType.FileUpload, label: 'File Upload', icon: 'lucideCloudUpload' },
    { type: FieldType.Checkbox, label: 'Checkbox', icon: 'lucideSquareCheck' },
    { type: FieldType.ToggleSwitch, label: 'Toggle Switch', icon: 'lucideToggleRight' },
    { type: FieldType.Radio, label: 'Radio', icon: 'lucideCircleDot' },
    { type: FieldType.Date, label: 'Date', icon: 'lucideCalendar' },
    { type: FieldType.RichText, label: 'Rich Text', icon: 'lucideAlignLeft' },
    { type: FieldType.ColorPicker, label: 'Color Picker', icon: 'lucidePalette' },
    { type: FieldType.LikertScale, label: 'Likert Scale', icon: 'lucideSliders' },
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
