import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-table-body',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-body.component.html',
})
export class TableBodyComponent {
  class = input<string>('');

  protected cn = cn;
}

