import { Component, computed, effect, inject, OnInit, signal, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { FormBuilder, FormControl, FormGroup, FormsModule } from '@angular/forms';
import { AvailableField, FieldOption, FieldType, FormField, FormRule, FormSchema } from '@form-forge/models';
import { CheckboxField, DateField, RadioField, SelectorField, TextField } from '@form-forge/ui-kit';
import { FormBuilderSidebar } from './form-builder-sidebar/form-builder-sidebar';
import { FormBuilderCanvas } from './form-builder-canvas/form-builder-canvas';
import { FormBuilderPropertyPanel } from './form-builder-property-panel/form-builder-property-panel';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../core/services/api.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

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
    FormBuilderPropertyPanel,
  ],
  providers: [ApiService, HttpClient],
})
export class FormBuilderComponent implements OnInit {
  fields: FieldType[] = [
    FieldType.Text,
    FieldType.Number,
    FieldType.Select,
    FieldType.Checkbox,
    FieldType.Radio,
    FieldType.Date,
  ];

  availableFields: AvailableField[] = [
    { type: FieldType.Text, label: 'Text Input', icon: '' },
    { type: FieldType.Number, label: 'Number Input', icon: '' },
    {
      type: FieldType.Select,
      label: 'Dropdown',
      icon: '',
    },
    { type: FieldType.Checkbox, label: 'Checkbox', icon: '' },
    { type: FieldType.Radio, label: 'Radio', icon: '' },
    { type: FieldType.Date, label: 'Date', icon: '' },
  ];

  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  canvasFields = signal<FormField[]>([]);
  selectedField = signal<FormField | null>(null);
  isLoading = signal<boolean>(false);
  isEditMode = signal<boolean>(false);

  private formIdToEdit = signal<number | null>(null);

  pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Form' : 'Create New Form'
  );

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

      fields
        .filter((field) => !currentControlIds.includes(field.id))
        .forEach((field) => {
          this.form.addControl(field.id, this.createControl(field));
        });
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const formId = +idParam;
      this.isEditMode.set(true);
      this.formIdToEdit.set(formId);
      this.loadFormForEdit(formId);
    }
  }

  loadFormForEdit(id: number): void {
    this.isLoading.set(true);
    this.apiService.getForm(id).subscribe({
      next: (formSchema) => {
        const fieldsWithRules = formSchema.fields.map((field) => {
          const associatedRules =
            formSchema.rules?.filter((rule) =>
              rule.conditions.some(
                (c) => 'fieldId' in c && c.fieldId === field.id
              )
            ) || [];
          return { ...field, rules: associatedRules };
        });

        this.canvasFields.set(fieldsWithRules);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Greška pri učitavanju forme za izmenu:', err);
        this.isLoading.set(false);
        this.snackBar.open(`Form with ID ${id} not found.`, 'Error', {
          duration: 5000,
        });
        this.router.navigate(['/dashboard']); // Vraćamo korisnika na dashboard
      },
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

  saveForm(): void {
    const currentFields = this.canvasFields();
    if (currentFields.length === 0) {
      this.snackBar.open('Cannot save an empty form.', 'Close', {
        duration: 3000,
      });
      return;
    }

    const allRules: FormRule[] = currentFields.flatMap(
      (field) => field.rules || []
    );
    const cleanFields: FormField[] = currentFields.map((field) => {
      const { rules, ...fieldWithoutRules } = field;
      return fieldWithoutRules;
    });

    const formSchema: FormSchema = {
      id: '1',
      name: 'My New Form',
      description: 'A dynamically created form.',
      fields: cleanFields,
      rules: allRules,
    };

    this.apiService.createForm(formSchema).subscribe({
      next: (savedForm) => {
        console.log(
          'Forma je uspešno sačuvana! Odgovor sa servera:',
          savedForm
        );
        this.snackBar.open(`Form "${savedForm.name}" has been saved!`, 'OK', {
          duration: 3000,
          panelClass: 'success-snackbar',
        });
      },
      error: (err) => {
        console.error('Došlo je do greške pri čuvanju forme:', err);
        this.snackBar.open('Error saving form. Please try again.', 'Error', {
          duration: 5000,
          panelClass: 'error-snackbar',
        });
      },
    });
  }
}
