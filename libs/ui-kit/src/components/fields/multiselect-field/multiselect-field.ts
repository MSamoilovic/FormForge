import { Component, computed, forwardRef, input, signal, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldOption, FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';

@Component({
  selector: 'app-multiselect-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './multiselect-field.html',
  styleUrl: './multiselect-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectField),
      multi: true,
    },
  ],
})
export class MultiSelectField implements ControlValueAccessor, AfterViewInit {
  readonly label = input<string>('');
  readonly options = input<FieldOption[]>([]);
  readonly formControl = input<FormControl | undefined>(undefined);
  readonly placeholder = input<string>('');
  readonly fieldType = input<FieldType>(FieldType.MultiSelect);
  readonly required = input<boolean>(false);
  readonly hint = input<string | null>(null);

  @ViewChild('wrapper', { static: false }) wrapperRef?: ElementRef<HTMLElement>;

  isOpen = signal(false);
  private onChangeFn?: (value: any) => void;
  private onTouchedFn?: () => void;

  ngAfterViewInit(): void {
    // Setup is done in template
  }

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    return 'Value is not valid.';
  });

  selectedValues = computed(() => {
    const control = this.formControl();
    return control?.value || [];
  });

  selectedOptions = computed(() => {
    const selected = this.selectedValues();
    return this.options().filter((opt) => selected.includes(opt.value));
  });

  toggleDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.formControl()?.disabled) return;
    this.isOpen.update((open) => !open);
    if (!this.isOpen()) {
      this.formControl()?.markAsTouched();
      this.onTouchedFn?.();
    }
  }

  closeDropdown(): void {
    this.isOpen.set(false);
    this.formControl()?.markAsTouched();
    this.onTouchedFn?.();
  }

  toggleOption(optionValue: any, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const control = this.formControl();
    if (!control || control.disabled) return;

    const currentValue = Array.isArray(control.value) ? [...control.value] : [];
    const index = currentValue.indexOf(optionValue);

    if (index > -1) {
      currentValue.splice(index, 1);
    } else {
      currentValue.push(optionValue);
    }

    control.setValue(currentValue);
    this.onChangeFn?.(currentValue);
    control.markAsTouched();
  }

  isSelected(optionValue: any): boolean {
    const selected = this.selectedValues();
    return selected.includes(optionValue);
  }

  removeOption(event: Event, optionValue: any): void {
    event.stopPropagation();
    const control = this.formControl();
    if (!control || control.disabled) return;

    const currentValue = Array.isArray(control.value) ? [...control.value] : [];
    const index = currentValue.indexOf(optionValue);

    if (index > -1) {
      currentValue.splice(index, 1);
      control.setValue(currentValue);
      this.onChangeFn?.(currentValue);
    }
  }

  writeValue(value: any): void {
    const arrayValue = Array.isArray(value) ? value : value ? [value] : [];
    this.formControl()?.setValue(arrayValue, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChangeFn = fn;
    this.formControl()?.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouchedFn = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.formControl()?.disable();
      this.isOpen.set(false);
    } else {
      this.formControl()?.enable();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen() || !this.wrapperRef?.nativeElement) return;
    const target = event.target as HTMLElement;
    // Close if clicked outside the wrapper, but allow clicks on dropdown options
    if (!this.wrapperRef.nativeElement.contains(target)) {
      // Also check if click is on a duplicate button or other canvas actions
      const isCanvasAction = target.closest('.field-actions') || 
                            target.closest('.action-button') ||
                            target.closest('.canvas-field-wrapper');
      if (isCanvasAction) {
        this.closeDropdown();
      } else if (!target.closest('.multiselect-dropdown')) {
        this.closeDropdown();
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isOpen()) {
      this.closeDropdown();
    }
  }
}

