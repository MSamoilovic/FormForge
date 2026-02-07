import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../utils/cn';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cn('relative w-full overflow-auto', class())">
      <table [class]="cn('w-full caption-bottom text-sm', tableClass())">
        <ng-content />
      </table>
    </div>
  `,
})
export class TableComponent {
  class = input<string>('');
  tableClass = input<string>('');

  protected cn = cn;
}

@Component({
  selector: 'app-table-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <thead [class]="cn('border-b', class())">
      <ng-content />
    </thead>
  `,
})
export class TableHeaderComponent {
  class = input<string>('');

  protected cn = cn;
}

@Component({
  selector: 'app-table-body',
  standalone: true,
  imports: [CommonModule],
  template: `
    <tbody [class]="cn('[&_tr:last-child]:border-0', class())">
      <ng-content />
    </tbody>
  `,
})
export class TableBodyComponent {
  class = input<string>('');

  protected cn = cn;
}

@Component({
  selector: 'app-table-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <tr [class]="cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', class())">
      <ng-content />
    </tr>
  `,
  host: {
    '[class.cursor-pointer]': 'false', // Can be overridden by parent
  },
})
export class TableRowComponent {
  class = input<string>('');

  protected cn = cn;
}

@Component({
  selector: 'app-table-head',
  standalone: true,
  imports: [CommonModule],
  template: `
    <th [class]="cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', class())">
      <ng-content />
    </th>
  `,
})
export class TableHeadComponent {
  class = input<string>('');

  protected cn = cn;
}

@Component({
  selector: 'app-table-cell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <td [class]="cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', class())">
      <ng-content />
    </td>
  `,
})
export class TableCellComponent {
  class = input<string>('');

  protected cn = cn;
}

export const TableComponents = [
  TableComponent,
  TableHeaderComponent,
  TableBodyComponent,
  TableRowComponent,
  TableHeadComponent,
  TableCellComponent,
];

