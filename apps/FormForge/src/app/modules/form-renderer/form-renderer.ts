import { Component, inject, OnDestroy, OnInit, signal, Type } from '@angular/core';
import { FieldType, FormField, FormSchema, ValidatorType } from '@form-forge/models';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { CheckboxField, DateField, RadioField, SelectorField, TextField } from '@form-forge/ui-kit';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatError } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { RuleEngineService } from '@form-forge/rule-engine';
import { Subject } from 'rxjs';
import { SubmissionApiService } from '../core/services/submission-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilderDataService } from '../form-builder/services/form-builder.data.service';
import { SubmissionPayload } from '../core/models/SubmissionPayload';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatError,
    MatButton,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  providers: [SubmissionApiService, FormBuilderDataService],
  selector: 'app-form-renderer',
  standalone: true,
  styleUrl: './form-renderer.scss',
  templateUrl: './form-renderer.html',
  exportAs: 'formRenderer',
})
export class FormRenderer implements OnInit, OnDestroy {
  public form!: FormGroup;
  public formSchema: FormSchema | null = null;
  public isLoading = signal(true);

  private fb = inject(FormBuilder);
  private ruleEngine = inject(RuleEngineService);
  private submissionApi = inject(SubmissionApiService);
  //TODO: HITNO !!!! prebaciti u infrastructure folder zajedno sa modelima
  private formApi = inject(FormBuilderDataService);
  private snackBar = inject(MatSnackBar);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();

  private formId: number | null = null;

  private componentMap: Record<FieldType, Type<any>> = {
    [FieldType.Text]: TextField,
    [FieldType.Select]: SelectorField,
    [FieldType.Checkbox]: CheckboxField,
    [FieldType.Number]: TextField,
    [FieldType.Radio]: RadioField,
    [FieldType.Date]: DateField,
  };

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.formId = +idParam;
      console.log(this.formId);
      this.loadForm(this.formId);
    } else {
      console.error('Form ID is missing from the URL.');
      this.isLoading.set(false);
    }
  }

  loadForm(id: number): void {
    this.isLoading.set(true);
    console.log(id);
    this.formApi.getById(id.toString()).subscribe({
      next: (schema) => {
        this.formSchema = schema as FormSchema;
        this.buildForm();
        if (this.formSchema.rules) {
          this.ruleEngine.processRules(
            this.form,
            this.formSchema.rules,
            this.destroy$
          );
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading form schema:', err);
        this.isLoading.set(false);
        this.snackBar.open('Could not load the form.', 'Error');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(): void {
    const group: { [key: string]: FormControl } = {};
    this.formSchema?.fields.forEach((field) => {
      group[field.id] = this.createControl(field);
    });
    this.form = this.fb.group(group);
  }

  private createControl(field: FormField): FormControl {
    const validators = [];
    if (field.validations) {
      for (const rule of field.validations) {
        switch (rule.type) {
          case ValidatorType.Required:
            validators.push(Validators.required);
            break;
          case ValidatorType.MinLength:
            validators.push(Validators.minLength(rule.value));
            break;
          case ValidatorType.MaxLength:
            validators.push(Validators.maxLength(rule.value));
            break;
          case ValidatorType.Pattern:
            validators.push(Validators.pattern(rule.value));
            break;
          case ValidatorType.Min:
            validators.push(Validators.min(rule.value));
            break;
          case ValidatorType.Max:
            validators.push(Validators.max(rule.value));
            break;
        }
      }
    }
    return this.fb.control('', validators);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open(
        'Please fill out all required fields correctly.',
        'Close',
        { duration: 3000 }
      );
      return;
    }

    if (!this.formId) {
      console.error('Form ID is missing, cannot submit.');
      return;
    }

    const submissionData: SubmissionPayload = {
      data: this.form.value,
    };

    this.submissionApi.create(this.formId, submissionData).subscribe({
      next: () => {
        this.snackBar.open(
          'Your response has been successfully submitted!',
          'OK',
          { duration: 5000 }
        );
        this.form.reset();
      },
      error: (err) => {
        console.error('Submission failed:', err);
        this.snackBar.open(
          'There was an error submitting your response.',
          'Error'
        );
      },
    });
  }

  getComponent(fieldType: FieldType): Type<any> | null {
    return this.componentMap[fieldType] || null;
  }

  getComponentInputs(field: FormField): Record<string, any> {
    const inputs: Record<string, any> = {
      label: field.label,
      placeholder: field.placeholder,
      formControl: this.form.get(field.id),
    };
    if (field.type === FieldType.Select || field.type === FieldType.Radio) {
      inputs['options'] = field.options;
    }
    return inputs;
  }
}
