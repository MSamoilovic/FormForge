import { FieldError } from '../field-error/field-error';
import { FieldHint } from '../field-hint/field-hint';
import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-field-shell',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FieldHint, FieldError],
  templateUrl: './form-field-shell.html',
  styleUrl: './form-field-shell.scss',
})
export class FormFieldShell {
  label = input<string>('');
  required = input<boolean>(false);
  formControl = input<FormControl | null>(null);
  errorMessage = input<string | null>(null);
  hint = input<string | null>(null);

  shouldShowError = computed(() => {
    const control = this.formControl();
    const errorMsg = this.errorMessage();

    if (!errorMsg) {
      return false;
    }

    return (
      control !== null && (control.touched || control.dirty) && control.invalid
    );
  });

  shouldShowHint = computed(() => {
    return (
      !this.shouldShowError() && this.hint() !== null && this.hint() !== ''
    );
  });
}
