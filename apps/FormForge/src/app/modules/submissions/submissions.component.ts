import {
  AfterViewInit,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SubmissionsDataService } from './services/submissions-data.service';
import { SubmissionResponse } from '../core/models/SubmissionResponse';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { ThemeService } from '../core/services/theme.service';
import { ErrorHandlerService } from '../core/services/error-handler.service';

@Component({
  selector: 'app-submissions',
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatSortModule,
    MatPaginatorModule,
    MatButtonModule,
    RouterLink,
    MatFormFieldModule,
    MatInput,
    ReactiveFormsModule,
  ],
  templateUrl: './submissions.component.html',
  styleUrl: './submissions.component.scss',
})
export class SubmissionsComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private submissionDataService = inject(SubmissionsDataService);
  private fb = inject(FormBuilder);
  private themeService = inject(ThemeService);
  private errorHandler = inject(ErrorHandlerService);

  private formId: number | null = null;
  submissions = signal<SubmissionResponse[]>([]);
  isLoading = signal<boolean>(true);

  public isDarkMode = computed(
    () => this.themeService.currentTheme() === 'dark'
  );

  dataSource = new MatTableDataSource<SubmissionResponse>([]);

  displayedColumns = computed(() => {
    const firstSubmission = this.submissions()[0];
    if (!firstSubmission) {
      return [];
    }

    return ['id', 'submitted_at', ...Object.keys(firstSubmission.data)];
  });

  private _sort!: MatSort;
  private _paginator!: MatPaginator;

  filterForm: FormGroup = this.fb.group({});

  @ViewChild(MatSort) set sort(sort: MatSort) {
    this._sort = sort;
    if (this._sort) {
      this.dataSource.sort = this._sort;
    }
  }

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    this._paginator = paginator;
    if (this._paginator) {
      this.dataSource.paginator = this._paginator;
    }
  }
  constructor() {
    effect(() => {
      this.dataSource.data = this.submissions();

      this.buildFilterForm();
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

  ngAfterViewInit() {
    this.dataSource.sortingDataAccessor = (
      item: SubmissionResponse,
      columnId: string
    ) => {
      switch (columnId) {
        case 'id':
          return item.id;
        case 'submitted_at':
          return new Date(item.submitted_at).getTime();
        default:
          return item.data[columnId];
      }
    };

    this.dataSource.filterPredicate = (
      data: SubmissionResponse,
      filter: string
    ): boolean => {
      const filterValues = JSON.parse(filter);

      for (const key in filterValues) {
        const filterValue = filterValues[key]?.trim().toLowerCase();
        if (filterValue) {
          let dataValue: any;
          if (key === 'id' || key === 'submitted_at') {
            dataValue = data[key];
          } else {
            dataValue = data.data[key];
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
    };
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  buildFilterForm(): void {
    const group: { [key: string]: any } = {};
    this.displayedColumns().forEach((col) => {
      group[col] = [''];
    });
    this.filterForm = this.fb.group(group);

    this.filterForm.valueChanges.pipe(debounceTime(300)).subscribe((values) => {
      this.dataSource.filter = JSON.stringify(values);
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    });
  }

  exportData() {
    if (this.formId === null) {
      return;
    }

    const filters = this.filterForm.value;
    this.submissionDataService.exportSubmissions(this.formId, filters);
  }
}
