import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-file-upload-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './file-upload-field.html',
  styleUrl: './file-upload-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadField),
      multi: true,
    },
  ],
})
export class FileUploadField extends BaseFieldComponent<File[]> {
  protected override readonly defaultFieldType = FieldType.FileUpload;

  // FileUploadField-specific inputs
  override readonly placeholder = input<string>('Click to upload or drag and drop');
  readonly accept = input<string>('*/*');
  readonly multiple = input<boolean>(false);

  // FileUploadField-specific state
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
