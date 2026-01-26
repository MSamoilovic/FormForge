import { computed, Directive, input, Signal } from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';
import { FieldType } from '@form-forge/models';

/**
 * Abstract base class for all form field components.
 * 
 * Provides:
 * - Common inputs (formControl, label, placeholder, required, hint, fieldType)
 * - Default ControlValueAccessor implementation
 * - Abstract computedErrorMessage that each field must implement
 * 
 * Usage:
 * ```typescript
 * @Component({
 *   selector: 'app-text-field',
 *   providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TextField), multi: true }],
 *   // ...
 * })
 * export class TextField extends BaseFieldComponent<string> {
 *   override readonly defaultFieldType = FieldType.Text;
 *   
 *   computedErrorMessage = computed(() => {
 *     // Field-specific error messages
 *   });
 * }
 * ```
 */
@Directive()
export abstract class BaseFieldComponent<T = unknown> implements ControlValueAccessor {
  // Common inputs shared by all field components
  readonly formControl = input<FormControl | undefined>(undefined);
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly hint = input<string | null>(null);
  readonly fieldType = input<FieldType | undefined>(undefined);

  /**
   * Default field type for this component.
   * Override in subclass to set the default.
   */
  protected readonly defaultFieldType: FieldType = FieldType.Text;

  /**
   * Resolved field type - uses input or falls back to default.
   */
  readonly resolvedFieldType = computed(() => this.fieldType() ?? this.defaultFieldType);

  /**
   * Each field component must implement its own error message computation.
   * This is because error messages are specific to each field type's validators.
   */
  abstract readonly computedErrorMessage: Signal<string | null>;

  // ============================================
  // ControlValueAccessor Implementation
  // ============================================

  /**
   * Writes a new value to the form control.
   * Override in subclass for custom value transformation.
   */
  writeValue(value: T | null): void {
    this.formControl()?.setValue(value, { emitEvent: false });
  }

  /**
   * Registers a callback to be called when the value changes.
   * Subscribes to the form control's valueChanges observable.
   */
  registerOnChange(fn: (value: T | null) => void): void {
    this.formControl()?.valueChanges.subscribe(fn);
  }

  /**
   * Registers a callback to be called when the control is touched.
   * Subscribes to the form control's statusChanges observable.
   */
  registerOnTouched(fn: () => void): void {
    this.formControl()?.statusChanges.subscribe(() => fn());
  }

  /**
   * Sets the disabled state of the control.
   * Override in subclass for custom disabled handling.
   */
  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.formControl()?.disable() : this.formControl()?.enable();
  }
}

