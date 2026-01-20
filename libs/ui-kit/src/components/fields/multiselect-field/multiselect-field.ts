import {
  Component,
  computed,
  effect,
  forwardRef,
  input,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { FieldOption, FieldType, OptionValue } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { MultiSelectTrigger } from './components/multiselect-trigger/multiselect-trigger';
import { MultiSelectDropdown } from './components/multiselect-dropdown/multiselect-dropdown';

@Component({
  selector: 'app-multiselect-field',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldShell,
    MultiSelectTrigger,
    MultiSelectDropdown,
  ],
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
export class MultiSelectField implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly options = input<FieldOption[]>([]);
  readonly formControl = input<FormControl | undefined>(undefined);
  readonly placeholder = input<string>('');
  readonly fieldType = input<FieldType>(FieldType.MultiSelect);
  readonly required = input<boolean>(false);
  readonly hint = input<string | null>(null);

  @ViewChild('wrapper', { static: false }) wrapperRef?: ElementRef<HTMLElement>;

  isOpen = signal(false);
  private internalValue = signal<OptionValue[]>([]);
  private onChangeFn?: (value: OptionValue[]) => void;
  private onTouchedFn?: () => void;

  constructor() {
    // Initialize internal value when form control changes
    effect(() => {
      const control = this.formControl();
      if (control) {
        const value = control.value;
        this.internalValue.set(Array.isArray(value) ? value : []);
      }
    }, { allowSignalWrites: true });
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

  selectedValues = computed<OptionValue[]>(() => {
    return this.internalValue();
  });

  selectedOptions = computed(() => {
    const selected = this.selectedValues();
    return this.options().filter((opt) => selected.includes(opt.value));
  });

  onTriggerClick(): void {
    if (this.formControl()?.disabled) return;
    this.isOpen.update((open) => !open);
    if (!this.isOpen()) {
      this.markAsTouched();
    }
  }

  onOptionToggle(optionValue: OptionValue): void {
    const control = this.formControl();
    if (!control || control.disabled) return;

    const currentValue = [...this.internalValue()];
    const index = currentValue.indexOf(optionValue);

    if (index > -1) {
      currentValue.splice(index, 1);
    } else {
      currentValue.push(optionValue);
    }

    this.internalValue.set(currentValue);
    control.setValue(currentValue);
    this.onChangeFn?.(currentValue);
    control.markAsTouched();
  }

  onChipRemove(optionValue: OptionValue): void {
    const control = this.formControl();
    if (!control || control.disabled) return;

    const currentValue = [...this.internalValue()];
    const index = currentValue.indexOf(optionValue);

    if (index > -1) {
      currentValue.splice(index, 1);
      this.internalValue.set(currentValue);
      control.setValue(currentValue);
      this.onChangeFn?.(currentValue);
    }
  }

  private markAsTouched(): void {
    this.formControl()?.markAsTouched();
    this.onTouchedFn?.();
  }

  private closeDropdown(): void {
    this.isOpen.set(false);
    this.markAsTouched();
  }

  writeValue(value: OptionValue[] | OptionValue | null): void {
    const arrayValue = Array.isArray(value) ? value : value ? [value] : [];
    this.internalValue.set(arrayValue);
    this.formControl()?.setValue(arrayValue, { emitEvent: false });
  }

  registerOnChange(fn: (value: OptionValue[]) => void): void {
    this.onChangeFn = fn;
    this.formControl()?.valueChanges.subscribe(fn);
  }

  registerOnTouched(fn: () => void): void {
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

    if (!this.wrapperRef.nativeElement.contains(target)) {
      const isCanvasAction =
        target.closest('.field-actions') ||
        target.closest('.action-button') ||
        target.closest('.canvas-field-wrapper');

      if (isCanvasAction || !target.closest('.multiselect-dropdown')) {
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
