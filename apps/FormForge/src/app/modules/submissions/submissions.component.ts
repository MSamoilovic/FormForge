import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SubmissionsDataService } from './services/submissions-data.service';
import { SubmissionResponse } from '../core/models/SubmissionResponse';
import { FormSchemaResponse } from '../core/models/FormSchemaResponse';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, forkJoin, Subscription } from 'rxjs';
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
  formSchema = signal<FormSchemaResponse | null>(null);
  isLoading = signal<boolean>(true);

  public isDarkMode = computed(
    () => this.themeService.currentTheme() === 'dark'
  );

  fieldLabelMap = computed(() => {
    const schema = this.formSchema();
    if (!schema) return {} as Record<string, string>;
    return schema.fields.reduce((acc, field) => {
      acc[field.id] = field.label;
      return acc;
    }, {} as Record<string, string>);
  });

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

  pagination = signal<PaginationState>({ pageIndex: 0, pageSize: 10 });
  sortState = signal<SortState>({ column: null, direction: null });

  filteredData = computed(() => {
    let data = [...this.submissions()];

    const filterValues = this.filterValues();
    data = data.filter((submission) => {
      for (const key in filterValues) {
        const filterValue = filterValues[key]?.trim().toLowerCase();
        if (filterValue) {
          let dataValue: unknown;
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

    const sort = this.sortState();
    if (sort.column && sort.direction) {
      data.sort((a, b) => {
        let aValue: unknown;
        let bValue: unknown;

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

        const aComp = typeof aValue === 'string' ? aValue.toLowerCase() : aValue;
        const bComp = typeof bValue === 'string' ? bValue.toLowerCase() : bValue;

        if (aComp < bComp) return sort.direction === 'asc' ? -1 : 1;
        if (aComp > bComp) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return data;
  });

  paginatedData = computed(() => {
    const { pageIndex, pageSize } = this.pagination();
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return this.filteredData().slice(start, end);
  });

  constructor() {
    effect(() => {
      const submissions = this.submissions();
      if (submissions.length > 0) {
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
      this.loadData(idParam, this.formId);
    } else {
      this.errorHandler.showError('Form ID is missing from URL', 'Submissions.init');
      this.isLoading.set(false);
    }
  }

  private loadData(formIdStr: string, formId: number) {
    this.isLoading.set(true);
    forkJoin({
      submissions: this.submissionDataService.getAllSubmissions(formId),
      form: this.submissionDataService.getFormById(formIdStr),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ submissions, form }) => {
          this.formSchema.set(form as FormSchemaResponse);
          this.submissions.set(submissions);
          if (submissions.length > 0) {
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
    if (this.filterFormSubscription) {
      this.filterFormSubscription.unsubscribe();
      this.filterFormSubscription = undefined;
    }

    const group: { [key: string]: unknown[] } = {};
    this.displayedColumns().forEach((col) => {
      group[col] = [''];
    });
    this.filterForm = this.fb.group(group);

    this.filterFormSubscription = this.filterForm.valueChanges
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((values) => {
        this.filterValues.set(values);
        const currentPagination = this.pagination();
        if (currentPagination.pageIndex !== 0) {
          this.pagination.set({ pageIndex: 0, pageSize: currentPagination.pageSize });
        }
      });
  }

  getColumnLabel(column: string): string {
    if (column === 'id') return 'ID';
    if (column === 'submitted_at') return 'Submitted At';
    return this.fieldLabelMap()[column] ?? column;
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

  getCellValue(submission: SubmissionResponse, column: string): unknown {
    if (column === 'submitted_at') {
      return submission.submitted_at;
    } else if (column === 'id') {
      return submission.id;
    } else {
      return submission.data[column];
    }
  }
}
