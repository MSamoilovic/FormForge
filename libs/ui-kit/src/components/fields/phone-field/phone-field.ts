import { Component, computed, effect, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FieldType } from '../../../../../models/src';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Countries } from './countries';

@Component({
  selector: 'app-phone-field',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormFieldShell,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './phone-field.html',
  styleUrl: './phone-field.scss',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneField),
      multi: true,
    },
  ],
})
export class PhoneField implements ControlValueAccessor {
  label = input<string>('');
  placeholder = input<string>('');
  formControl = input<FormControl | undefined>(undefined);
  fieldType = input<FieldType>(FieldType.Phone);
  required = input<boolean>(false);
  hint = input<string | null>(null);
  defaultCountry = input<string>('RS'); // ISO 3166-1 alpha-2 country code
  showCountrySelector = input<boolean>(true);

  selectedCountry = signal<string>('RS');
  phoneNumber = signal<string>('');
  countries = Countries;
  countryFlag = computed(() => {
    const country = this.countries.find(c => c.code === this.selectedCountry());
    return country?.flag || '🇷🇸';
  });

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }
    if (control.errors['invalidPhone']) {
      return control.errors['invalidPhone'].message || 'Phone number is not valid.';
    }
    if (control.errors['pattern']) {
      return 'Pattern is not matching.';
    }

    return 'Phone number is not valid.';
  });

  constructor() {
    effect(() => {
      const defaultCountry = this.defaultCountry();
      if (defaultCountry) {
        this.selectedCountry.set(defaultCountry);
      }
    });

    effect(() => {
      const control = this.formControl();
      if (control) {
        this.setupValidators(control);
        this.syncValue(control.value);
      }
    });
  }

  private setupValidators(control: FormControl): void {
    const validators = [];
    if (this.required()) {
      validators.push(Validators.required);
    }
    validators.push(this.phoneValidator.bind(this));
    control.setValidators(validators);
    control.updateValueAndValidity({ emitEvent: false });
  }

  private phoneValidator(control: FormControl): { [key: string]: any } | null {
    const value = control?.value;
    if (!value || (this.required() === false && !value.trim())) {
      return null;
    }

    // Try to dynamically import libphonenumber-js if available
    try {
      // For now, we'll use a basic validation pattern
      // In production, this would use libphonenumber-js
      const phoneValue = this.formatPhoneNumber(value);
      const isValid = this.validatePhoneNumber(phoneValue, this.selectedCountry());
      
      if (!isValid) {
        return {
          invalidPhone: {
            message: 'Please enter a valid phone number.',
          },
        };
      }
    } catch (error) {
      console.warn('Phone validation error:', error);
    }

    return null;
  }

  private validatePhoneNumber(phone: string, countryCode: string): boolean {
    if (!phone) return false;
    
    // Basic validation - accepts international format
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    // Must start with + for international format
    if (cleaned.startsWith('+')) {
      // International format: + followed by 7-15 digits
      const digits = cleaned.substring(1);
      return digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits);
    }
    
    // National format: 7-15 digits
    return cleaned.length >= 7 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
  }

  private formatPhoneNumber(value: string): string {
    if (!value) return '';
    
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If value doesn't start with +, assume it's a national number
    if (!cleaned.startsWith('+')) {
      // If user is typing national format, keep it as is for now
      // The validation will check if it's valid
      return cleaned;
    }
    
    // If it starts with +, it's already in international format
    return cleaned;
  }

  onCountryChange(countryCode: string): void {
    this.selectedCountry.set(countryCode);
    const control = this.formControl();
    if (control) {
      const currentValue = control.value || '';
      const formatted = this.formatPhoneNumber(currentValue);
      control.setValue(formatted, { emitEvent: true });
      control.updateValueAndValidity();
    }
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    
    // Format as user types
    const formatted = this.formatPhoneNumber(value);
    
    const control = this.formControl();
    if (control) {
      this.phoneNumber.set(value);
      control.setValue(formatted, { emitEvent: true });
      
      // Update input display with formatted value if different
      if (input.value !== formatted) {
        // Use setTimeout to avoid conflicts with Angular's form control
        setTimeout(() => {
          input.value = formatted;
        }, 0);
      }
      
      control.updateValueAndValidity();
    }
  }

  private syncValue(value: string | null): void {
    if (value) {
      this.phoneNumber.set(value);
    }
  }

  getCountryByCode(code: string) {
    return this.countries.find(c => c.code === code);
  }

  writeValue(value: string | null): void {
    if (value) {
      const formatted = this.formatPhoneNumber(value);
      this.phoneNumber.set(formatted);
      this.formControl()?.setValue(formatted, { emitEvent: false });
    } else {
      this.phoneNumber.set('');
      this.formControl()?.setValue('', { emitEvent: false });
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
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
}

