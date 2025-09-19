import { computed, inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FieldType, FormField, FormRule, FormSchema } from '@form-forge/models';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { FormSchemaPayload } from '../../core/models/FormSchemaPayload';

@Injectable({
  providedIn: 'any',
})
export class FormBuilderService {
  private apiService = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private canvasFields = signal<FormField[]>([]);
  private selectedField = signal<FormField | null>(null);
  private isLoading = signal<boolean>(false);
  private formIdToEdit = signal<number | null>(null);

  public readonly fields = this.canvasFields.asReadonly();
  public readonly selected = this.selectedField.asReadonly();
  public readonly loading = this.isLoading.asReadonly();
  public readonly isEditMode = computed(() => this.formIdToEdit() !== null);
  public readonly pageTitle = computed(() =>
    this.isEditMode() ? 'Edit Form' : 'Create New Form'
  );

  private formName = signal<string>('My New Form');

  constructor() {
    this.initializeFromUrl();
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

        this.formName.set(formSchema.name);
        this.canvasFields.set(fieldsWithRules);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error', err);
        this.isLoading.set(false);
        this.snackBar.open(`Form with ID ${id} not found.`, 'Error', {
          duration: 5000,
        });
        this.router.navigate(['/dashboard']);
      },
    });
  }

  public selectField(field: FormField | null): void {
    this.selectedField.set(field);
  }

  public dropField(event: CdkDragDrop<any[]>): void {
    const fieldType: FieldType = event.item.data;

    const newField: FormField = {
      id: crypto.randomUUID(),
      type: fieldType,
      label: `${fieldType} field`,
      placeholder: '',
      options:
        fieldType === FieldType.Select || fieldType === FieldType.Radio
          ? [{ label: 'Option 1', value: 'option1' }]
          : [],
      rules: [],
      validations: [],
    };

    this.canvasFields.update((currentFields) => [...currentFields, newField]);
    this.selectField(newField);
  }

  public updateField(updatedValues: Partial<FormField>): void {
    const currentSelected = this.selectedField();
    if (currentSelected) {
      const updatedField = { ...currentSelected, ...updatedValues };
      this.selectedField.set(updatedField);
      this.canvasFields.update((fields) =>
        fields.map((f) => (f.id === updatedField.id ? updatedField : f))
      );
    }
  }

  public saveForm(): void {
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

    const formSchemaPayload = new FormSchemaPayload(
      this.formName(),
      'A dynamically Created Form',
      cleanFields,
      allRules
    );

    let saveObservable: Observable<FormSchema>;
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
        this.snackBar.open(
          `Form "${savedForm.name}" has been successfully ${message}!`,
          'OK',
          {
            duration: 3000,
          }
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log(err);
        this.snackBar.open('Error saving form. Please try again.', 'Error', {
          duration: 5000,
        });
      },
    });
  }
}
