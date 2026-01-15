import { computed, inject, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AvailableField,
  ColorFormat,
  FieldType,
  FormField,
  FormRule,
  FormSchema,
  FormTheme,
} from '@form-forge/models';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { FormSchemaPayload } from '../../core/models/FormSchemaPayload';
import { FormBuilderDataService } from './form-builder.data.service';
import { FormSchemaResponse } from '../../core/models/FormSchemaResponse';
import { NotificationService } from '../../core/services/notification.service';

@Injectable({
  providedIn: 'any',
})
export class FormBuilderService {
  private apiService = inject(FormBuilderDataService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private canvasFields = signal<FormField[]>([]);
  private selectedField = signal<FormField | null>(null);
  private isLoading = signal<boolean>(false);
  private formIdToEdit = signal<number | null>(null);
  private theme = signal<FormTheme | undefined>(undefined);

  public readonly fields = this.canvasFields.asReadonly();
  public readonly selected = this.selectedField.asReadonly();
  public readonly loading = this.isLoading.asReadonly();
  public readonly currentTheme = this.theme.asReadonly();

  public readonly isEditMode = computed(() => this.formIdToEdit() !== null);
  public readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Form' : 'Create New Form'
  );

  private formName = signal<string>('My New Form');

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const navigationState = history.state;
    const aiSchema = navigationState.generatedSchema;

    if (aiSchema) {
      try {
        console.log('AI schema found in navigation state. Loading...');
        const schema: FormSchema = aiSchema;

        this.canvasFields.set(schema.fields || []);
        this.formName.set(schema.name || 'AI Generated Form');

        history.replaceState(
          { ...history.state, generatedSchema: undefined },
          ''
        );
      } catch (e) {
        console.error('Failed to process AI generated schema from state', e);
        this.initializeFromUrl();
      }
    } else {
      this.initializeFromUrl();
    }
  }

  private initializeFromUrl(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const formId = +idParam;
      this.formIdToEdit.set(formId);
      this.loadFormForEdit(formId);
    }
  }

  private loadFormForEdit(id: number): void {
    this.isLoading.set(true);
    this.apiService.getById(id.toString()).subscribe({
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

        this.formName.set(formSchema.name);
        this.canvasFields.set(fieldsWithRules);
        this.theme.set(formSchema.theme || undefined);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error', err);
        this.isLoading.set(false);
        this.notificationService.showError(`Form with ID ${id} not found.`);
        this.router.navigate(['/dashboard']);
      },
    });
  }

  public selectField(field: FormField | null): void {
    this.selectedField.set(field);
  }

  public dropField(
    event: CdkDragDrop<FormField[], AvailableField[], FieldType>
  ): void {
    const fieldType: FieldType = event.item.data;

    const newField: FormField = {
      id: crypto.randomUUID(),
      type: fieldType,
      label: `${fieldType} field`,
      placeholder: '',
      options:
        fieldType === FieldType.Select || fieldType === FieldType.Radio || fieldType === FieldType.MultiSelect
          ? [{ label: 'Option 1', value: 'option1' }]
          : fieldType === FieldType.LikertScale
          ? [
              { label: 'Strongly Disagree', value: 'strongly_disagree' },
              { label: 'Disagree', value: 'disagree' },
              { label: 'Neutral', value: 'neutral' },
              { label: 'Agree', value: 'agree' },
              { label: 'Strongly Agree', value: 'strongly_agree' },
            ]
          : [],
      rules: [],
      validations: [],
      // Initialize number field specific properties
      ...(fieldType === FieldType.Number && {
        min: undefined,
        max: undefined,
        step: undefined,
      }),
      // Initialize color picker specific properties
      ...(fieldType === FieldType.ColorPicker && {
        colorFormat: ColorFormat.HEX,
      }),
    };

    this.canvasFields.update((currentFields) => [...currentFields, newField]);
    this.selectField(newField);
  }

  public updateField(updatedValues: Partial<FormField>): void {
    const currentSelected = this.selectedField();
    if (currentSelected) {
      const updatedField = { ...currentSelected, ...updatedValues };
      this.selectedField.set(updatedField);
      console.log(this.selectedField());
      this.canvasFields.update((fields) =>
        fields.map((f) => (f.id === updatedField.id ? updatedField : f))
      );

      this.theme.set(this.selectedField()?.theme || this.theme());
    }
  }

  public updateTheme(theme: FormTheme): void {
    console.log('Servis: Ažuriram theme signal:', theme);
    this.theme.set(theme);
  }

  public duplicateField(fieldId: string): void {
    const fieldToDuplicate = this.canvasFields().find((f) => f.id === fieldId);
    if (!fieldToDuplicate) {
      this.notificationService.showError('Field not found for duplication.');
      return;
    }

    const duplicatedField: FormField = JSON.parse(JSON.stringify(fieldToDuplicate));
    
    duplicatedField.id = crypto.randomUUID();
    duplicatedField.label = `${fieldToDuplicate.label} (Copy)`;
    
    if (duplicatedField.rules) {
      duplicatedField.rules = duplicatedField.rules.map((rule) => {
        return JSON.parse(JSON.stringify(rule));
      });
    }

    const currentFields = this.canvasFields();
    const originalIndex = currentFields.findIndex((f) => f.id === fieldId);
    const newFields = [...currentFields];
    newFields.splice(originalIndex + 1, 0, duplicatedField);

    this.canvasFields.set(newFields);
    this.selectField(duplicatedField);

    this.notificationService.showSuccess('Field duplicated successfully.');
  }

  public saveForm(): void {
    const currentFields = this.canvasFields();
    if (currentFields.length === 0) {
      this.notificationService.showInfo('Cannot save an empty form.');
      return;
    }

    const allRules: FormRule[] = currentFields.flatMap(
      (field) => field.rules || []
    );
    const cleanFields: FormField[] = currentFields.map((field) => {
      const { rules, ...fieldWithoutRules } = field;
      return fieldWithoutRules;
    });

    console.log(this.currentTheme());

    const formSchemaPayload = new FormSchemaPayload(
      this.formName(),
      'A dynamically Created Form',
      cleanFields,
      allRules,
      this.currentTheme()
    );

    let saveObservable: Observable<FormSchemaResponse>;
    const isEditing = this.isEditMode();

    if (isEditing) {
      const formId = this.formIdToEdit() ?? 0;
      saveObservable = this.apiService.updateForm(formId, formSchemaPayload);
    } else {
      saveObservable = this.apiService.createForm(formSchemaPayload);
    }

    saveObservable.subscribe({
      next: (savedForm) => {
        const message = isEditing ? 'updated' : 'created';

        this.notificationService.showSuccess(
          `Form "${savedForm.name}" has been successfully ${message}!`
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log(err);
        this.notificationService.showError(
          'Error saving form. Please try again.'
        );
      },
    });
  }
}
