import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideChevronLeft, lucideChevronRight, lucideChevronsLeft, lucideChevronsRight } from '@ng-icons/lucide';
import { cn } from '../../utils/cn';

@Component({
  selector: 'app-paginator',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight,
      lucideChevronsLeft,
      lucideChevronsRight,
    }),
  ],
  template: `
    <div [class]="cn('flex items-center justify-between px-2', class())">
      <div class="flex items-center gap-2">
        <p class="text-sm text-muted-foreground">
          Showing {{ startIndex() }} to {{ endIndex() }} of {{ length() }} entries
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          [disabled]="!hasPreviousPage()"
          (click)="firstPage()"
          [class]="cn(
            'inline-flex items-center justify-center rounded-md h-9 w-9',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            'disabled:pointer-events-none disabled:opacity-50',
            'transition-colors'
          )"
        >
          <ng-icon name="lucideChevronsLeft" class="h-4 w-4" />
        </button>
        <button
          type="button"
          [disabled]="!hasPreviousPage()"
          (click)="previousPage()"
          [class]="cn(
            'inline-flex items-center justify-center rounded-md h-9 w-9',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            'disabled:pointer-events-none disabled:opacity-50',
            'transition-colors'
          )"
        >
          <ng-icon name="lucideChevronLeft" class="h-4 w-4" />
        </button>
        <span class="text-sm text-muted-foreground">
          Page {{ pageIndex() + 1 }} of {{ totalPages() }}
        </span>
        <button
          type="button"
          [disabled]="!hasNextPage()"
          (click)="nextPage()"
          [class]="cn(
            'inline-flex items-center justify-center rounded-md h-9 w-9',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            'disabled:pointer-events-none disabled:opacity-50',
            'transition-colors'
          )"
        >
          <ng-icon name="lucideChevronRight" class="h-4 w-4" />
        </button>
        <button
          type="button"
          [disabled]="!hasNextPage()"
          (click)="lastPage()"
          [class]="cn(
            'inline-flex items-center justify-center rounded-md h-9 w-9',
            'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
            'disabled:pointer-events-none disabled:opacity-50',
            'transition-colors'
          )"
        >
          <ng-icon name="lucideChevronsRight" class="h-4 w-4" />
        </button>
      </div>
    </div>
  `,
})
export class PaginatorComponent {
  class = input<string>('');
  length = input.required<number>();
  pageSize = input.required<number>();
  pageIndex = input<number>(0);
  pageSizeOptions = input<number[]>([10, 25, 50, 100]);

  pageChange = output<{ pageIndex: number; pageSize: number }>();

  protected cn = cn;

  totalPages = computed(() => Math.ceil(this.length() / this.pageSize()));
  startIndex = computed(() => this.pageIndex() * this.pageSize() + 1);
  endIndex = computed(() => Math.min((this.pageIndex() + 1) * this.pageSize(), this.length()));
  hasPreviousPage = computed(() => this.pageIndex() > 0);
  hasNextPage = computed(() => this.pageIndex() < this.totalPages() - 1);

  firstPage(): void {
    if (this.hasPreviousPage()) {
      this.pageChange.emit({ pageIndex: 0, pageSize: this.pageSize() });
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.pageChange.emit({ pageIndex: this.pageIndex() - 1, pageSize: this.pageSize() });
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.pageChange.emit({ pageIndex: this.pageIndex() + 1, pageSize: this.pageSize() });
    }
  }

  lastPage(): void {
    if (this.hasNextPage()) {
      this.pageChange.emit({ pageIndex: this.totalPages() - 1, pageSize: this.pageSize() });
    }
  }
}

