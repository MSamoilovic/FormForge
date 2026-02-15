import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-table-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-header.component.html',
})
export class TableHeaderComponent {
  class = input<string>('');

  protected cn = cn;
}

