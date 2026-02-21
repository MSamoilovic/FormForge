import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucidePalette, lucideType, lucideSquare } from '@ng-icons/lucide';

@Component({
  selector: 'app-theme-editor',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIconComponent,
  ],
  viewProviders: [
    provideIcons({
      lucidePalette,
      lucideType,
      lucideSquare,
    }),
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
