import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-theme-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './form-builder-theme-editor.component.html',
  styleUrl: './form-builder-theme-editor.component.scss',
})
export class FormBuilderThemeEditorComponent {
  themeForm = input.required<FormGroup>();

  fontFamilies = [
    { name: 'Roboto', value: "'Roboto', sans-serif" },
    { name: 'Open Sans', value: "'Open Sans', sans-serif" },
    { name: 'Montserrat', value: "'Montserrat', sans-serif" },
    { name: 'Lato', value: "'Lato', sans-serif" },
  ];
}
