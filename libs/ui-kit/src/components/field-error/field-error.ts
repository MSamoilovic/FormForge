import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-field-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './field-error.html',
  styleUrl: './field-error.scss',
})
export class FieldError {
  message = input<string | null>(null);
}
