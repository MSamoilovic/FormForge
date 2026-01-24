import { ChangeDetectionStrategy, Component, computed, effect, forwardRef, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Countries } from './countries';
import { PHONE_FIELD_DEFAULTS } from '@form-forge/config';
import { BaseFieldComponent } from '../../../base';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneField),
      multi: true,
    },
  ],
})
export class PhoneField extends BaseFieldComponent<string> {
  protected override readonly defaultFieldType = FieldType.Phone;

  // PhoneField-specific inputs
  readonly defaultCountry = input<string>(PHONE_FIELD_DEFAULTS.defaultCountry);
  readonly showCountrySelector = input<boolean>(PHONE_FIELD_DEFAULTS.showCountrySelector);

  // PhoneField-specific state
  selectedCountry = signal<string>(PHONE_FIELD_DEFAULTS.defaultCountry);
  phoneNumber = signal<string>('');
  countries = Countries;
  
  countryFlag = computed(() => {
    const country = this.countries.find(c => c.code === this.selectedCountry());
    return country?.flag || PHONE_FIELD_DEFAULTS.defaultFlag;
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
    super();
    
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

  private phoneValidator(control: FormControl): { [key: string]: { message: string } } | null {
    const value = control?.value;
    if (!value || (this.required() === false && !value.trim())) {
      return null;
    }

    try {
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
    
    const cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+')) {
      const digits = cleaned.substring(1);
      return digits.length >= 7 && digits.length <= 15 && /^\d+$/.test(digits);
    }
    
    return cleaned.length >= 7 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
  }

  private formatPhoneNumber(value: string): string {
    if (!value) return '';
    
    let cleaned = value.replace(/[^\d+]/g, '');
    
    if (!cleaned.startsWith('+')) {
      return cleaned;
    }
    
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
    
    const formatted = this.formatPhoneNumber(value);
    
    const control = this.formControl();
    if (control) {
      this.phoneNumber.set(value);
      control.setValue(formatted, { emitEvent: true });
      
      if (input.value !== formatted) {
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

  // Override writeValue for custom phone formatting
  override writeValue(value: string | null): void {
    if (value) {
      const formatted = this.formatPhoneNumber(value);
      this.phoneNumber.set(formatted);
      this.formControl()?.setValue(formatted, { emitEvent: false });
    } else {
      this.phoneNumber.set('');
      this.formControl()?.setValue('', { emitEvent: false });
    }
  }
}
