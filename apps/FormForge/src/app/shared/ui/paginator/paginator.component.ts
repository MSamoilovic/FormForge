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
  templateUrl: './paginator.component.html',
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
