import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AvailableField,
  FieldType,
  FormField,
  FormRule,
  FormSchema,
  FormTheme,
} from '@form-forge/models';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Observable } from 'rxjs';
import { FormSchemaPayload } from '../../core/models/FormSchemaPayload';
import { FormBuilderDataService } from './form-builder.data.service';
import { FormSchemaResponse } from '../../core/models/FormSchemaResponse';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import {
  COLOR_PICKER_DEFAULTS,
  LIKERT_SCALE_DEFAULTS,
  NUMBER_FIELD_DEFAULTS,
  SELECT_FIELD_DEFAULTS,
} from '@form-forge/config';
import { HistoryService, FormState } from './history.service';

@Injectable({
  providedIn: 'any',
})
export class FormBuilderService {
  private apiService = inject(FormBuilderDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ErrorHandlerService);
  private historyService = inject(HistoryService);

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

  public readonly canUndo = this.historyService.canUndo;
  public readonly canRedo = this.historyService.canRedo;

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
        this.errorHandler.log(e, 'FormBuilder.initialize');
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
        this.isLoading.set(false);
        this.errorHandler.handle(err, 'FormBuilder.loadForm');
        this.router.navigate(['/dashboard']);
      },
    });
  }

  public selectField(field: FormField | null): void {
    this.selectedField.set(field);
  }

  private getCurrentState(): FormState {
    return {
      fields: this.canvasFields(),
      theme: this.theme(),
      selectedFieldId: this.selectedField()?.id ?? null,
    };
  }

  private saveToHistory(): void {
    this.historyService.pushState(this.getCurrentState());
  }

  private applyState(state: FormState): void {
    this.canvasFields.set(state.fields);
    this.theme.set(state.theme);

    if (state.selectedFieldId) {
      const selectedField = state.fields.find(f => f.id === state.selectedFieldId);
      this.selectedField.set(selectedField || null);
    } else {
      this.selectedField.set(null);
    }
  }

  public undo(): void {
    const previousState = this.historyService.undo(this.getCurrentState());
    if (previousState) {
      this.applyState(previousState);
      this.notificationService.showInfo('Action undone');
    }
  }

  public redo(): void {
    const nextState = this.historyService.redo(this.getCurrentState());
    if (nextState) {
      this.applyState(nextState);
      this.notificationService.showInfo('Action redone');
    }
  }

  public removeField(fieldId: string): void {
    this.saveToHistory();

    this.canvasFields.update((fields) => fields.filter((f) => f.id !== fieldId));

    if (this.selectedField()?.id === fieldId) {
      this.selectedField.set(null);
    }

    this.notificationService.showSuccess('Field removed');
  }

  public reorderFields(previousIndex: number, currentIndex: number): void {
    if (previousIndex === currentIndex) return;

    this.saveToHistory();

    this.canvasFields.update((fields) => {
      const reordered = [...fields];
      moveItemInArray(reordered, previousIndex, currentIndex);
      return reordered;
    });
  }

  public dropField(
    event: CdkDragDrop<FormField[], AvailableField[], FieldType>
  ): void {
    if (event.previousContainer.id === event.container.id) {
      this.reorderFields(event.previousIndex, event.currentIndex);
      return;
    }

    this.saveToHistory();

    const fieldType: FieldType = event.item.data;

    const newField: FormField = {
      id: crypto.randomUUID(),
      type: fieldType,
      label: `${fieldType} field`,
      placeholder: '',
      options:
        fieldType === FieldType.Select || fieldType === FieldType.Radio || fieldType === FieldType.MultiSelect
          ? [...SELECT_FIELD_DEFAULTS.defaultOptions]
          : fieldType === FieldType.LikertScale
          ? [...LIKERT_SCALE_DEFAULTS.defaultOptions]
          : [],
      rules: [],
      validations: [],
      ...(fieldType === FieldType.Number && {
        min: NUMBER_FIELD_DEFAULTS.min,
        max: NUMBER_FIELD_DEFAULTS.max,
        step: NUMBER_FIELD_DEFAULTS.step,
      }),
      ...(fieldType === FieldType.ColorPicker && {
        colorFormat: COLOR_PICKER_DEFAULTS.colorFormat,
      }),
    };

    this.canvasFields.update((currentFields) => [...currentFields, newField]);
    this.selectField(newField);
  }

  public updateField(updatedValues: Partial<FormField>): void {
    const currentSelected = this.selectedField();
    if (currentSelected) {
      this.saveToHistory();

      const updatedField = { ...currentSelected, ...updatedValues };
      this.selectedField.set(updatedField);
      this.canvasFields.update((fields) =>
        fields.map((f) => (f.id === updatedField.id ? updatedField : f))
      );

      this.theme.set(this.selectedField()?.theme || this.theme());
    }
  }

  public updateTheme(theme: FormTheme): void {
    this.saveToHistory();
    this.theme.set(theme);
  }

  public duplicateField(fieldId: string): void {
    const fieldToDuplicate = this.canvasFields().find((f) => f.id === fieldId);
    if (!fieldToDuplicate) {
      this.notificationService.showError('Field not found for duplication.');
      return;
    }

    this.saveToHistory();

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

        this.historyService.clear();

        this.notificationService.showSuccess(
          `Form "${savedForm.name}" has been successfully ${message}!`
        );
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.errorHandler.handle(err, 'FormBuilder.saveForm');
      },
    });
  }
}
