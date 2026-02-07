import {
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SubmissionsDataService } from './services/submissions-data.service';
import { SubmissionResponse } from '../core/models/SubmissionResponse';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ThemeService } from '../core/services/theme.service';
import { ErrorHandlerService } from '../core/services/error-handler.service';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideDownload,
  lucideArrowLeft,
  lucideInbox,
  lucideLoader2,
  lucideChevronUp,
  lucideChevronDown,
  lucideSearch,
} from '@ng-icons/lucide';
import {
  TableComponent,
  TableHeaderComponent,
  TableBodyComponent,
  TableRowComponent,
  TableHeadComponent,
  TableCellComponent,
} from '../../shared/ui/table/table.component';
import { CardComponent, CardContentComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { InputDirective } from '../../shared/ui/input/input.directive';
import { PaginatorComponent } from '../../shared/ui/paginator/paginator.component';
import { cn } from '../../shared/utils/cn';

interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

interface SortState {
  column: string | null;
  direction: 'asc' | 'desc' | null;
}

@Component({
  selector: 'app-submissions',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NgIconComponent,
    TableComponent,
    TableHeaderComponent,
    TableBodyComponent,
    TableRowComponent,
    TableHeadComponent,
    TableCellComponent,
    CardComponent,
    CardContentComponent,
    ButtonComponent,
    InputDirective,
    PaginatorComponent,
    DatePipe,
  ],
  viewProviders: [
    provideIcons({
      lucideDownload,
      lucideArrowLeft,
      lucideInbox,
      lucideLoader2,
      lucideChevronUp,
      lucideChevronDown,
      lucideSearch,
    }),
  ],
  templateUrl: './submissions.component.html',
  styleUrl: './submissions.component.scss',
})
export class SubmissionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private submissionDataService = inject(SubmissionsDataService);
  private fb = inject(FormBuilder);
  private themeService = inject(ThemeService);
  private errorHandler = inject(ErrorHandlerService);

  protected cn = cn;

  formId: number | null = null;
  submissions = signal<SubmissionResponse[]>([]);
  isLoading = signal<boolean>(true);

  public isDarkMode = computed(
    () => this.themeService.currentTheme() === 'dark'
  );

  displayedColumns = computed(() => {
    const firstSubmission = this.submissions()[0];
    if (!firstSubmission) {
      return [];
    }
    return ['id', 'submitted_at', ...Object.keys(firstSubmission.data)];
  });

  filterForm: FormGroup = this.fb.group({});

  // Pagination state
  pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });
  
  // Sort state
  sortState = signal<SortState>({ column: null, direction: null });

  // Filtered and sorted data
  filteredData = computed(() => {
    let data = [...this.submissions()];

    // Apply filters
    const filterValues = this.filterForm.value;
    data = data.filter((submission) => {
      for (const key in filterValues) {
        const filterValue = filterValues[key]?.trim().toLowerCase();
        if (filterValue) {
          let dataValue: any;
          if (key === 'id' || key === 'submitted_at') {
            dataValue = submission[key];
          } else {
            dataValue = submission.data[key];
          }

          if (
            dataValue === null ||
            dataValue === undefined ||
            !String(dataValue).toLowerCase().includes(filterValue)
          ) {
            return false;
          }
        }
      }
      return true;
    });

    // Apply sorting
    const sort = this.sortState();
    if (sort.column && sort.direction) {
      data.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sort.column === 'id') {
          aValue = a.id;
          bValue = b.id;
        } else if (sort.column === 'submitted_at') {
          aValue = new Date(a.submitted_at).getTime();
          bValue = new Date(b.submitted_at).getTime();
        } else {
          aValue = a.data[sort.column!];
          bValue = b.data[sort.column!];
        }

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
        }
        if (typeof bValue === 'string') {
          bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  });

  // Paginated data
  paginatedData = computed(() => {
    const { pageIndex, pageSize } = this.pagination();
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return this.filteredData().slice(start, end);
  });

  constructor() {
    effect(() => {
      this.submissions();
      this.buildFilterForm();
      // Reset to first page when data changes
      this.pagination.set({ pageIndex: 0, pageSize: this.pagination().pageSize });
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('formId');
    if (idParam) {
      this.formId = +idParam;
      this.loadSubmissions(this.formId);
    } else {
      this.errorHandler.showError('Form ID is missing from URL', 'Submissions.init');
      this.isLoading.set(false);
    }
  }

  private loadSubmissions(formId: number) {
    this.isLoading.set(true);
    this.submissionDataService.getAllSubmissions(formId).subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        this.errorHandler.handle(error, 'Submissions.load');
      },
    });
  }

  buildFilterForm(): void {
    const group: { [key: string]: any } = {};
    this.displayedColumns().forEach((col) => {
      group[col] = [''];
    });
    this.filterForm = this.fb.group(group);

    this.filterForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      // Reset to first page when filters change
      this.pagination.set({ pageIndex: 0, pageSize: this.pagination().pageSize });
    });
  }

  onSort(column: string): void {
    const current = this.sortState();
    if (current.column === column) {
      // Toggle direction
      if (current.direction === 'asc') {
        this.sortState.set({ column, direction: 'desc' });
      } else if (current.direction === 'desc') {
        this.sortState.set({ column: null, direction: null });
      } else {
        this.sortState.set({ column, direction: 'asc' });
      }
    } else {
      this.sortState.set({ column, direction: 'asc' });
    }
  }

  getSortIcon(column: string): string | null {
    const sort = this.sortState();
    if (sort.column !== column) return null;
    return sort.direction === 'asc' ? 'lucideChevronUp' : 'lucideChevronDown';
  }

  onPageChange(event: { pageIndex: number; pageSize: number }): void {
    this.pagination.set(event);
  }

  exportData() {
    if (this.formId === null) {
      return;
    }

    const filters = this.filterForm.value;
    this.submissionDataService.exportSubmissions(this.formId, filters);
  }

  getCellValue(submission: SubmissionResponse, column: string): any {
    if (column === 'submitted_at') {
      return submission.submitted_at;
    } else if (column === 'id') {
      return submission.id;
    } else {
      return submission.data[column];
    }
  }
}
