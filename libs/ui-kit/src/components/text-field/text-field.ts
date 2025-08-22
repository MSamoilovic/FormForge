import { Component, input } from '@angular/core';

@Component({
  selector: 'app-text-field',
  imports: [],
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
  standalone: true,
})
export class TextField {
  label = input<string>('');
  placeholder = input<string>('');
}
