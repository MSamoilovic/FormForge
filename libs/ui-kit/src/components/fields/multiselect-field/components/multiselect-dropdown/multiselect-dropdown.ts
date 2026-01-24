import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldOption, OptionValue } from '@form-forge/models';
import { MultiSelectOption } from '../multiselect-option/multiselect-option';

@Component({
  selector: 'app-multiselect-dropdown',
  standalone: true,
  imports: [CommonModule, MultiSelectOption],
  templateUrl: './multiselect-dropdown.html',
  styleUrl: './multiselect-dropdown.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectDropdown {
  options = input<FieldOption[]>([]);
  selectedValues = input<OptionValue[]>([]);
  disabled = input<boolean>(false);

  optionToggled = output<OptionValue>();

  isSelected(optionValue: OptionValue): boolean {
    return this.selectedValues().includes(optionValue);
  }

  onOptionToggle(value: OptionValue): void {
    this.optionToggled.emit(value);
  }
}

