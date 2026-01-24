import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldOption, OptionValue } from '@form-forge/models';
import { MultiSelectChip } from '../multiselect-chip/multiselect-chip';

@Component({
  selector: 'app-multiselect-trigger',
  standalone: true,
  imports: [CommonModule, MultiSelectChip],
  templateUrl: './multiselect-trigger.html',
  styleUrl: './multiselect-trigger.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectTrigger {
  selectedOptions = input<FieldOption[]>([]);
  placeholder = input<string>('Select options...');
  disabled = input<boolean>(false);
  isOpen = input<boolean>(false);

  clicked = output<void>();
  chipRemoved = output<OptionValue>();

  onClick(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) {
      this.clicked.emit();
    }
  }

  onChipRemove(value: OptionValue): void {
    this.chipRemoved.emit(value);
  }
}

