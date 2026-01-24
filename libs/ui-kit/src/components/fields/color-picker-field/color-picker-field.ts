import { ChangeDetectionStrategy, Component, computed, effect, forwardRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule, FormControl } from '@angular/forms';
import { ColorFormat, FieldType } from '@form-forge/models';
import { FormFieldShell } from '../../form-field-shell/form-field-shell';
import { COLOR_PICKER_DEFAULTS } from '@form-forge/config';
import { BaseFieldComponent } from '../../../base';

@Component({
  selector: 'app-color-picker-field',
  imports: [CommonModule, ReactiveFormsModule, FormFieldShell],
  templateUrl: './color-picker-field.html',
  styleUrl: './color-picker-field.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerField),
      multi: true,
    },
  ],
})
export class ColorPickerField extends BaseFieldComponent<string> {
  protected override readonly defaultFieldType = FieldType.ColorPicker;

  // ColorPickerField-specific inputs
  override readonly placeholder = input<string>(COLOR_PICKER_DEFAULTS.defaultColor);
  readonly colorFormat = input<ColorFormat>(COLOR_PICKER_DEFAULTS.colorFormat);

  // Internal control for native color picker (always HEX)
  internalColorControl = new FormControl<string>(COLOR_PICKER_DEFAULTS.defaultColor);
  // Internal control for text input (formatted color)
  internalTextControl = new FormControl<string>('');

  private isUpdatingInternally = false;

  computedErrorMessage = computed(() => {
    const control = this.formControl();
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      return 'This field is required.';
    }

    if (control.errors['pattern']) {
      return 'Please enter a valid color value.';
    }

    return 'Value is not valid.';
  });

  constructor() {
    super();
    
    // Watch for changes in native color picker
    this.internalColorControl.valueChanges.subscribe((hexColor) => {
      if (!this.isUpdatingInternally && hexColor) {
        this.isUpdatingInternally = true;
        const formatted = this.convertFromHex(hexColor, this.colorFormat());
        this.internalTextControl.setValue(formatted, { emitEvent: false });
        this.formControl()?.setValue(formatted);
        this.formControl()?.markAsDirty();
        this.isUpdatingInternally = false;
      }
    });

    // Watch for changes in text input
    this.internalTextControl.valueChanges.subscribe((formattedColor) => {
      if (!this.isUpdatingInternally && formattedColor) {
        this.isUpdatingInternally = true;
        const hex = this.convertToHex(formattedColor);
        if (hex) {
          this.internalColorControl.setValue(hex, { emitEvent: false });
          this.formControl()?.setValue(formattedColor);
          this.formControl()?.markAsDirty();
        }
        this.isUpdatingInternally = false;
      }
    });

    // Watch for format changes
    effect(() => {
      const format = this.colorFormat();
      const currentValue = this.formControl()?.value;
      if (currentValue && !this.isUpdatingInternally) {
        this.isUpdatingInternally = true;
        const hex = this.convertToHex(currentValue);
        if (hex) {
          const formatted = this.convertFromHex(hex, format);
          this.internalTextControl.setValue(formatted, { emitEvent: false });
          this.formControl()?.setValue(formatted, { emitEvent: false });
        }
        this.isUpdatingInternally = false;
      }
    });
  }

  // Override CVA methods for custom color picker behavior
  override writeValue(value: string | null): void {
    if (value) {
      this.isUpdatingInternally = true;
      const hex = this.convertToHex(value);
      if (hex) {
        this.internalColorControl.setValue(hex, { emitEvent: false });
        this.internalTextControl.setValue(value, { emitEvent: false });
      }
      this.isUpdatingInternally = false;
    }
    this.formControl()?.setValue(value, { emitEvent: false });
  }

  override setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.internalColorControl.disable();
      this.internalTextControl.disable();
      this.formControl()?.disable();
    } else {
      this.internalColorControl.enable();
      this.internalTextControl.enable();
      this.formControl()?.enable();
    }
  }

  private convertToHex(color: string): string | null {
    if (!color) return null;

    // Already HEX
    if (color.startsWith('#')) {
      return color.length === 7 ? color : null;
    }

    // RGB or RGBA
    if (color.startsWith('rgb')) {
      const matches = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (matches) {
        const r = parseInt(matches[1]);
        const g = parseInt(matches[2]);
        const b = parseInt(matches[3]);
        return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      }
    }

    // HSL or HSLA
    if (color.startsWith('hsl')) {
      const matches = color.match(/hsla?\((\d+),\s*(\d+)%,\s*(\d+)%/);
      if (matches) {
        const h = parseInt(matches[1]) / 360;
        const s = parseInt(matches[2]) / 100;
        const l = parseInt(matches[3]) / 100;
        const rgb = this.hslToRgb(h, s, l);
        return `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1)}`;
      }
    }

    return null;
  }

  private convertFromHex(hex: string, format: ColorFormat): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    switch (format) {
      case ColorFormat.HEX:
        return hex;
      case ColorFormat.RGB:
        return `rgb(${r}, ${g}, ${b})`;
      case ColorFormat.RGBA:
        return `rgba(${r}, ${g}, ${b}, 1)`;
      case ColorFormat.HSL: {
        const [h, s, l] = this.rgbToHsl(r, g, b);
        return `hsl(${h}, ${s}%, ${l}%)`;
      }
      case ColorFormat.HSLA: {
        const [h, s, l] = this.rgbToHsl(r, g, b);
        return `hsla(${h}, ${s}%, ${l}%, 1)`;
      }
      default:
        return hex;
    }
  }

  private rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  private hslToRgb(h: number, s: number, l: number): [number, number, number] {
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;

      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
}
