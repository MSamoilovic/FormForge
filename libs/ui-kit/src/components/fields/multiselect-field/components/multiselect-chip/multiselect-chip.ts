import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldOption, OptionValue } from '@form-forge/models';

@Component({
  selector: 'app-multiselect-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multiselect-chip.html',
  styleUrl: './multiselect-chip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiSelectChip {
  option = input.required<FieldOption>();
  disabled = input<boolean>(false);

  removed = output<OptionValue>();

  onRemove(event: Event): void {
    event.stopPropagation();
    if (!this.disabled()) {
      this.removed.emit(this.option().value);
    }
  }
}

