import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SubmissionsDataService } from './services/submissions-data.service';
import { SubmissionResponse } from '../core/models/SubmissionResponse';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
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
} from '../../shared/ui/table';
import { CardComponent, CardContentComponent } from '../../shared/ui/card';
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
})
export class SubmissionsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  public router = inject(Router);
  private submissionDataService = inject(SubmissionsDataService);
  private fb = inject(FormBuilder);
  private themeService = inject(ThemeService);
  private errorHandler = inject(ErrorHandlerService);
  private destroyRef = inject(DestroyRef);

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
  private filterFormSubscription?: Subscription;
  filterValues = signal<Record<string, string>>({});

  // Pagination state
  pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });

  // Sort state
  sortState = signal<SortState>({ column: null, direction: null });

  // Filtered and sorted data
  filteredData = computed(() => {
    let data = [...this.submissions()];

    // Apply filters
    const filterValues = this.filterValues();
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
    // Effect se automatski čisti kada se komponenta uništi
    // Resetuj paginaciju kada se submissions promene
    effect(() => {
      const submissions = this.submissions();
      if (submissions.length > 0) {
        // Reset to first page when data changes, ali samo ako već nije na prvoj stranici
        const currentPagination = this.pagination();
        if (currentPagination.pageIndex !== 0) {
          this.pagination.set({ pageIndex: 0, pageSize: currentPagination.pageSize });
        }
      }
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
    this.submissionDataService.getAllSubmissions(formId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.submissions.set(data);
          // Kreiraj filter form samo kada se submissions učitaju
          if (data.length > 0) {
            this.buildFilterForm();
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorHandler.handle(error, 'Submissions.load');
        },
      });
  }

  buildFilterForm(): void {
    // Čisti staru subscription ako postoji
    if (this.filterFormSubscription) {
      this.filterFormSubscription.unsubscribe();
      this.filterFormSubscription = undefined;
    }

    const group: { [key: string]: any } = {};
    this.displayedColumns().forEach((col) => {
      group[col] = [''];
    });
    this.filterForm = this.fb.group(group);

    // Kreiraj novu subscription sa automatskim cleanup-om
    this.filterFormSubscription = this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((values) => {
        // Update filter values signal
        this.filterValues.set(values);
        // Reset to first page when filters change
        const currentPagination = this.pagination();
        if (currentPagination.pageIndex !== 0) {
          this.pagination.set({ pageIndex: 0, pageSize: currentPagination.pageSize });
        }
      });
  }

  onSort(column: string): void {
    const current = this.sortState();
    if (current.column === column) {
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
