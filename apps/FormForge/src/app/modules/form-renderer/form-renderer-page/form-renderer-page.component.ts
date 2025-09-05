import { Component } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { FieldType, FormField } from '@form-forge/models';
import { FormRenderer } from '../form-renderer';

@Component({
  selector: 'app-form-renderer-page',
  imports: [CommonModule, FormRenderer, JsonPipe],
  templateUrl: './form-renderer-page.component.html',
  styleUrl: './form-renderer-page.component.scss',
})
export class FormRendererPageComponent {
  public formSchema: FormField[] = [
    {
      id: 'name',
      type: FieldType.Text,
      label: 'Your Name',
      placeholder: 'Enter your full name',
      required: true,
      options: [],
    },
    {
      id: 'country',
      type: FieldType.Select,
      label: 'Country',
      placeholder: '',
      required: false,
      options: [
        { label: 'USA', value: 'usa' },
        { label: 'CAD', value: 'canada' },
        { label: 'NOR', value: 'norway' },
        { label: 'SRB', value: 'serbia' },
      ],
    },
  ];
}
