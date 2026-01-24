import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-field-hint',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-hint.html',
  styleUrl: './field-hint.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldHint {
  hint = input<string | null>(null);
}
