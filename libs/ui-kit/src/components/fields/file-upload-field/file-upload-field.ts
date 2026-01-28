import { ChangeDetectionStrategy, Component, computed, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { BaseFieldComponent } from '../../../base';

export interface UploadedFile {
  file: File;
  preview?: string;
  progress?: number;
  error?: string;
}

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

  override readonly placeholder = input<string>('Click to upload or drag and drop');
  readonly accept = input<string>('*/*');
  readonly multiple = input<boolean>(false);
  readonly maxFileSize = input<number>(10 * 1024 * 1024); // 10MB default
  readonly maxFiles = input<number>(10);

  uploadedFiles = signal<UploadedFile[]>([]);
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
    if (control.errors['maxFiles']) {
      return `Maximum ${this.maxFiles()} files allowed.`;
    }

    return 'The entered value is not valid.';
  });

  acceptedTypesDisplay = computed(() => {
    const accept = this.accept();
    if (!accept || accept === '*/*') return null;

    const types = accept.split(',').map(t => t.trim());
    const extensions = types
      .filter(t => t.startsWith('.'))
      .map(t => t.toUpperCase());
    
    if (extensions.length > 0) {
      return extensions.join(', ');
    }

    const mimeTypes: Record<string, string> = {
      'image/*': 'Images',
      'video/*': 'Videos',
      'audio/*': 'Audio',
      'application/pdf': 'PDF',
      'text/*': 'Text files',
    };

    return types.map(t => mimeTypes[t] || t).join(', ');
  });

  maxFileSizeDisplay = computed(() => {
    return this.formatFileSize(this.maxFileSize());
  });

  onFileChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const files = Array.from(inputEl.files || []);
    this.handleFiles(files);
    inputEl.value = '';
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
    const currentFiles = this.uploadedFiles();
    const maxFiles = this.maxFiles();
    const maxSize = this.maxFileSize();

    let filesToProcess = files;

    if (!this.multiple()) {
      filesToProcess = files.slice(0, 1);
      this.uploadedFiles.set([]);
    } else {
      const remaining = maxFiles - currentFiles.length;
      if (remaining <= 0) {
        return;
      }
      filesToProcess = files.slice(0, remaining);
    }

    const newUploadedFiles: UploadedFile[] = filesToProcess.map(file => {
      const uploadedFile: UploadedFile = { file };

      if (file.size > maxSize) {
        uploadedFile.error = `File exceeds ${this.formatFileSize(maxSize)} limit`;
      }

      if (this.isImageFile(file) && !uploadedFile.error) {
        this.generateImagePreview(file, uploadedFile);
      }

      return uploadedFile;
    });

    const updatedFiles = this.multiple() 
      ? [...currentFiles, ...newUploadedFiles]
      : newUploadedFiles;

    this.uploadedFiles.set(updatedFiles);
    this.updateFormControl(updatedFiles);
  }

  private generateImagePreview(file: File, uploadedFile: UploadedFile): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      uploadedFile.preview = e.target?.result as string;
      this.uploadedFiles.update(files => [...files]);
    };
    reader.readAsDataURL(file);
  }

  private updateFormControl(files: UploadedFile[]): void {
    const validFiles = files.filter(f => !f.error).map(f => f.file);
    this.formControl()?.setValue(validFiles.length > 0 ? validFiles : null);
    this.formControl()?.markAsDirty();
    this.formControl()?.markAsTouched();
  }

  removeFile(index: number): void {
    const updatedFiles = this.uploadedFiles().filter((_, i) => i !== index);
    this.uploadedFiles.set(updatedFiles);
    this.updateFormControl(updatedFiles);
  }

  isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
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

    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎬';
    if (file.type.startsWith('audio/')) return '🎵';
    if (file.type === 'application/pdf') return '📄';
    
    if (['doc', 'docx'].includes(extension || '')) return '📝';
    if (['xls', 'xlsx'].includes(extension || '')) return '📊';
    if (['ppt', 'pptx'].includes(extension || '')) return '📽️';
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) return '🗜️';
    if (['txt', 'md', 'rtf'].includes(extension || '')) return '📃';
    if (['html', 'css', 'js', 'ts', 'json', 'xml'].includes(extension || '')) return '💻';
    
    return '📎';
  }

  get filesCount(): number {
    return this.uploadedFiles().length;
  }

  get hasErrors(): boolean {
    return this.uploadedFiles().some(f => f.error);
  }
}
