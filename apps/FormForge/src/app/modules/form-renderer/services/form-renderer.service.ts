import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { FormRendererDataService } from './form-renderer-data.service';
import { RuleEngineService } from '@form-forge/rule-engine';
import { FieldType, FormField, FormSchema, ValidationRule, ValidatorType } from '@form-forge/models';
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
    const validators: ValidatorFn[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.validations) {
      for (const rule of field.validations) {
        const validator = this.getValidator(rule);
        if (validator) {
          validators.push(validator);
        }
      }
    }

    if (field.type === FieldType.Email && !this.hasValidatorType(field.validations, ValidatorType.Email)) {
      validators.push(Validators.email);
    }

    if (field.type === FieldType.Url && !this.hasValidatorType(field.validations, ValidatorType.Url)) {
      validators.push(this.urlValidator());
    }

    const initialValue = this.getInitialValue(field);
    return this.fb.control(initialValue, validators);
  }

  private getValidator(rule: ValidationRule): ValidatorFn | null {
    switch (rule.type) {
      case ValidatorType.Required:
        return Validators.required;

      case ValidatorType.MinLength:
        if (typeof rule.value === 'number') {
          return Validators.minLength(rule.value);
        }
        return null;

      case ValidatorType.MaxLength:
        if (typeof rule.value === 'number') {
          return Validators.maxLength(rule.value);
        }
        return null;

      case ValidatorType.Pattern:
        if (typeof rule.value === 'string' || rule.value instanceof RegExp) {
          return Validators.pattern(rule.value);
        }
        return null;

      case ValidatorType.Min:
        if (typeof rule.value === 'number') {
          return Validators.min(rule.value);
        }
        return null;

      case ValidatorType.Max:
        if (typeof rule.value === 'number') {
          return Validators.max(rule.value);
        }
        return null;

      case ValidatorType.Email:
        return Validators.email;

      case ValidatorType.Url:
        return this.urlValidator();

      default:
        return null;
    }
  }

  private urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
      const isValid = urlPattern.test(control.value);

      return isValid ? null : { url: true };
    };
  }

  private hasValidatorType(validations: ValidationRule[] | undefined, type: ValidatorType): boolean {
    return validations?.some(v => v.type === type) ?? false;
  }

  private getInitialValue(field: FormField): unknown {
    switch (field.type) {
      case FieldType.MultiSelect:
        return [];
      case FieldType.Checkbox:
      case FieldType.ToggleSwitch:
        return false;
      case FieldType.Number:
        return null;
      default:
        return '';
    }
  }
}
