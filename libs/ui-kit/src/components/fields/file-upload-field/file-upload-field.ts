import { Component, computed, forwardRef, input, signal } from '@angular/core';
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
  placeholder = input<string>('Click to upload or drag and drop');
  formControl = input<FormControl | undefined>(undefined);
  fieldType = input<FieldType>(FieldType.FileUpload);
  accept = input<string>('*/*');
  multiple = input<boolean>(false);
  required = input<boolean>(false);
  hint = input<string | null>(null);

  selectedFiles = signal<File[]>([]);
  isDragOver = signal<boolean>(false);

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
    this.handleFiles(files);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  private handleFiles(files: File[]): void {
    const filesToAdd = this.multiple() ? files : files.slice(0, 1);
    this.selectedFiles.set(filesToAdd);

    this.formControl()?.setValue(filesToAdd);
    this.formControl()?.markAsDirty();
    this.formControl()?.markAsTouched();
  }

  removeFile(index: number): void {
    const currentFiles = this.selectedFiles();
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    this.selectedFiles.set(updatedFiles);

    this.formControl()?.setValue(updatedFiles.length > 0 ? updatedFiles : null);
    this.formControl()?.markAsDirty();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  getFileIcon(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return '🖼️';
    } else if (['pdf'].includes(extension || '')) {
      return '📄';
    } else if (['doc', 'docx'].includes(extension || '')) {
      return '📝';
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return '📊';
    } else if (['zip', 'rar', '7z'].includes(extension || '')) {
      return '🗜️';
    } else if (['mp4', 'avi', 'mov'].includes(extension || '')) {
      return '🎬';
    } else if (['mp3', 'wav', 'flac'].includes(extension || '')) {
      return '🎵';
    }
    return '📎';
  }
}
