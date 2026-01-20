import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldOption, OptionValue } from '@form-forge/models';

@Component({
  selector: 'app-multiselect-option',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiselect-option.html',
  styleUrl: './multiselect-option.scss',
})
export class MultiSelectOption {
  option = input.required<FieldOption>();
  selected = input<boolean>(false);
  disabled = input<boolean>(false);

  toggled = output<OptionValue>();

  onToggle(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) {
      this.toggled.emit(this.option().value);
    }
  }

  onCheckboxClick(event: Event): void {
    event.stopPropagation();
  }
}

