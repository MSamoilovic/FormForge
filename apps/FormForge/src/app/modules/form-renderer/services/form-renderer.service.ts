import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FormRendererDataService } from './form-renderer-data.service';
import { RuleEngineService } from '@form-forge/rule-engine';
import { FieldType, FormField, FormSchema, ValidatorType } from '@form-forge/models';
import { Subject } from 'rxjs';
import { SubmissionPayload } from '../../core/models/SubmissionPayload';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorHandlerService } from '../../core/services/error-handler.service';

@Injectable()
export class FormRendererService implements OnDestroy {
  private fb = inject(FormBuilder);

  private dataService = inject(FormRendererDataService);
  private ruleEngine = inject(RuleEngineService);
  private notificationService = inject(NotificationService);
  private errorHandler = inject(ErrorHandlerService);

  private formSchema = signal<FormSchema | null>(null);
  private form = signal<FormGroup | null>(null);
  private isLoading = signal<boolean>(true);
  private destroy$ = new Subject<void>();

  public readonly schema = this.formSchema.asReadonly();
  public readonly formGroup = this.form.asReadonly();
  public readonly loading = this.isLoading.asReadonly();

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public initialize(formId: number): void {
    this.isLoading.set(true);
    this.dataService.getFormById(formId.toString()).subscribe({
      next: (schema) => {
        this.formSchema.set(schema as FormSchema); // Cast-ujemo u naš tip
        const formGroup = this.buildForm(schema as FormSchema);
        this.form.set(formGroup);
        if (schema.rules) {
          this.ruleEngine.processRules(formGroup, schema.rules, this.destroy$);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorHandler.handle(err, 'FormRenderer.loadForm');
      },
    });
  }

  public submit(formId: number): void {
    const formGroup = this.form();
    if (!formGroup) return;

    if (formGroup.invalid) {
      formGroup.markAllAsTouched();
      this.notificationService.showError('Please fill out all required fields correctly.');
      return;
    }

    const submissionData: SubmissionPayload = {
      data: formGroup.value,
    };

    this.dataService.createSubmission(formId, submissionData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Your response has been successfully submitted!');
        formGroup.reset();
      },
      error: (err) => {
        this.errorHandler.handle(err, 'FormRenderer.submit');
      },
    });
  }

  private buildForm(schema: FormSchema): FormGroup {
    const group: { [key: string]: FormControl } = {};
    schema.fields.forEach((field) => {
      group[field.id] = this.createControl(field);
    });
    return this.fb.group(group);
  }

  private createControl(field: FormField): FormControl {
    const validators = [];
    if (field.validations) {
      for (const rule of field.validations) {
        switch (rule.type) {
          case ValidatorType.Required:
            validators.push(Validators.required);
            break;
          //TODO: implementacija ostalih validatora
        }
      }
    }
    // MultiSelect field should be initialized with an empty array
    const initialValue = field.type === FieldType.MultiSelect ? [] : '';
    return this.fb.control(initialValue, validators);
  }
}
