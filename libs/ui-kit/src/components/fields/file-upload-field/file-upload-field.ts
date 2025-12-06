import { Component, computed, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldType } from '../../../../../models/src';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';

@Component({
  selector: 'app-file-upload-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './file-upload-field.html',
  styleUrl: './file-upload-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadField),
      multi: true,
    },
  ],
})
export class FileUploadField implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  formControl = input<FormControl | undefined>(undefined);
  fieldType = input<FieldType>(FieldType.FileUpload);
  accept = input<string>('*/*');
  multiple = input<boolean>(false);
  required = input<boolean>(false);
  hint = input<string | null>(null);

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['fileSize']) {
      return 'File size exceeds the allowed limit.';
    }
    if (control.errors['fileType']) {
      return 'Invalid file type.';
    }

    return 'The entered value is not valid.';
  });

  writeValue(value: File[] | null): void {
    this.formControl()?.setValue(value, { emitEvent: false });
  }

  registerOnChange(fn: (value: File[] | null) => void): void {
    this.formControl()?.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
    this.formControl()?.statusChanges.subscribe(() => fn());
  }

  setDisabledState?(isDisabled: boolean): void {
    return isDisabled
      ? this.formControl()?.disable()
      : this.formControl()?.enable();
  }

  onFileChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files || []);

    const value = this.multiple() ? files : files.slice(0, 1);

    this.formControl()?.setValue(value);
    this.formControl()?.markAsDirty();
    this.formControl()?.markAsTouched();
  }
}
