import { Component, computed, forwardRef, input, ElementRef, ViewChild, AfterViewInit, OnDestroy, effect, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldType } from '../../../../../models/src';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-rich-text-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell, MatIconModule, MatButtonModule, MatTooltipModule],
  templateUrl: './rich-text-field.html',
  styleUrl: './rich-text-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextField),
      multi: true,
    },
  ],
})
export class RichTextField implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChild('editor', { static: false }) editorRef?: ElementRef<HTMLDivElement>;

  label = input<string>('');
  placeholder = input<string>('');
  formControl = input<FormControl | undefined>(undefined);
  fieldType = input<FieldType>(FieldType.RichText);
  required = input<boolean>(false);
  hint = input<string | null>(null);

  private onChangeFn?: (value: string | null) => void;
  private onTouchedFn?: () => void;
  private isWriting = false;
  private destroyRef = inject(DestroyRef);

  constructor() {
    // Use effect to sync form control value to editor
    effect(() => {
      const control = this.formControl();
      if (control && !this.isWriting && this.editorRef?.nativeElement) {
        const value = control.value || '';
        const currentHtml = this.editorRef.nativeElement.innerHTML;
        if (currentHtml !== value) {
          this.editorRef.nativeElement.innerHTML = value;
        }
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.editorRef?.nativeElement) {
      const editor = this.editorRef.nativeElement;
      const initialValue = this.formControl()?.value || '';
      if (initialValue) {
        editor.innerHTML = initialValue;
      } else {
        editor.innerHTML = '';
      }

      // Use RxJS for proper cleanup
      fromEvent(editor, 'input')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.onEditorInput());

      fromEvent(editor, 'blur')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.onEditorBlur());

      fromEvent<ClipboardEvent>(editor, 'paste')
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((e) => this.onPaste(e));
    }
  }

  ngOnDestroy(): void {
    // Cleanup is handled by takeUntilDestroyed
  }

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    return 'Unesena vrednost nije validna.';
  });

  onEditorInput(): void {
    if (!this.editorRef?.nativeElement || this.isWriting) return;
    const html = this.editorRef.nativeElement.innerHTML;
    this.isWriting = true;
    this.formControl()?.setValue(html, { emitEvent: false });
    this.onChangeFn?.(html);
    this.isWriting = false;
  }

  onEditorBlur(): void {
    this.formControl()?.markAsTouched();
    this.onTouchedFn?.();
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, text);
    this.onEditorInput();
  }

  execCommand(command: string, value?: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    document.execCommand(command, false, value);
    this.onEditorInput();
    this.editorRef?.nativeElement.focus();
  }

  writeValue(value: string | null): void {
    if (!this.editorRef?.nativeElement) return;
    this.isWriting = true;
    this.editorRef.nativeElement.innerHTML = value || '';
    this.isWriting = false;
    if (!value) {
      this.formControl()?.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (this.editorRef?.nativeElement) {
      this.editorRef.nativeElement.contentEditable = isDisabled ? 'false' : 'true';
    }
    if (isDisabled) {
      this.formControl()?.disable();
    } else {
      this.formControl()?.enable();
    }
  }
}
