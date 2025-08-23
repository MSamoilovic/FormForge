import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FieldType } from '@form-forge/models';

@Component({
  selector: 'app-form-builder-sidebar',
  imports: [CommonModule, DragDropModule],
  templateUrl: './form-builder-sidebar.html',
  styleUrl: './form-builder-sidebar.css',
  standalone: true,
})
export class FormBuilderSidebar {
  fields = input<FieldType[]>([]);
}
