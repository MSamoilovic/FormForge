import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AvailableField } from '@form-forge/models';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-form-builder-sidebar',
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './form-builder-sidebar.html',
  styleUrl: './form-builder-sidebar.scss',
  standalone: true,
})
export class FormBuilderSidebar {
  availableFields = input<AvailableField[]>([]);
}
