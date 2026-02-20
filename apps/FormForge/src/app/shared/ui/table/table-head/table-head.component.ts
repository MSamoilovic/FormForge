import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-table-head',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-head.component.html',
})
export class TableHeadComponent {
  class = input<string>('');

  protected cn = cn;
}

