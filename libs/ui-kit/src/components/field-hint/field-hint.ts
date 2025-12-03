import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-field-hint',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-hint.html',
  styleUrl: './field-hint.scss',
})
export class FieldHint {
  hint = input<string | null>(null);
}
