import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-table-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-row.component.html',
  host: {
    '[class.cursor-pointer]': 'false', // Can be overridden by parent
  },
})
export class TableRowComponent {
  class = input<string>('');

  protected cn = cn;
}

