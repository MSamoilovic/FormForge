import { Component, input } from '@angular/core';

@Component({
  selector: 'app-selector-field',
  imports: [],
  templateUrl: './selector-field.html',
  styleUrl: './selector-field.scss',
  standalone: true,
})
export class SelectorField {
  label = input<string>('');
  options = input<string[]>([]);
}
