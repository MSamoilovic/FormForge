import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { CanvasField, FieldType } from '@form-forge/models';

@Component({
  standalone: true,
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss'],
  imports: [CommonModule, DragDropModule, FormsModule],
})
export class FormBuilderComponent {
  fields: FieldType[] = [
    FieldType.Text,
    FieldType.Number,
    FieldType.Select,
    FieldType.Checkbox,
    FieldType.Radio,
    FieldType.Date,
  ];

  canvasFields: CanvasField[] = [];
  selectedField: CanvasField | null = null;
  fieldProps = { label: '' };

  onDrop(event: CdkDragDrop<CanvasField[]>) {
    if (event.previousContainer === event.container) {
      // Reorder unutar canvas-a
      moveItemInArray(
        this.canvasFields,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      //TODO: ovo mora da se ispravi
      const type = event.previousContainer.data[
        event.previousIndex
      ] as unknown as FieldType;

      const newField: CanvasField = {
        id: crypto.randomUUID(),
        type,
        label: type,
        placeholder: '',
        required: false,
      };
      this.canvasFields.splice(event.currentIndex, 0, newField);
      this.selectField(newField);
    }
  }

  selectField(field: CanvasField) {
    this.selectedField = field;
  }
}
