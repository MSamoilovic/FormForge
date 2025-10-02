import { AfterViewInit, Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
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
  ],
  templateUrl: './submissions.component.html',
  styleUrl: './submissions.component.scss',
})
export class SubmissionsComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private submissionDataService = inject(SubmissionsDataService);

  private formId: number | null = null;

  submissions = signal<SubmissionResponse[]>([]);
  isLoading = signal<boolean>(true);

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
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('formId');
    if (idParam) {
      this.formId = +idParam;
      this.loadSubmissions(this.formId);
    } else {
      console.error('Form ID is missing from URL');
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
  }

  private loadSubmissions(formId: number) {
    this.isLoading.set(true);
    this.submissionDataService.getAllSubmissions(formId).subscribe({
      next: (data) => {
        this.submissions.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading Submissions:', error);
        this.isLoading.set(false);
      },
    });
  }
}
