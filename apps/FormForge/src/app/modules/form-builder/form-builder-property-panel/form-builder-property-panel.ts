import { Component, effect, inject, input, output } from '@angular/core';
import { CanvasField } from '@form-forge/models';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-builder-property-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './form-builder-property-panel.html',
  styleUrl: './form-builder-property-panel.css',
  standalone: true,
})
export class FormBuilderPropertyPanel {
  readonly selectedField = input.required<CanvasField | null>();

  readonly fieldChanged = output<Partial<CanvasField>>();
  readonly addOptionRequested = output<void>();
  readonly removeOptionRequested = output<number>();
  private readonly fb = inject(FormBuilder);

  propertiesForm: FormGroup;

  constructor() {
    this.propertiesForm = this.fb.group({
      label: ['', Validators.required],
      placeholder: [''],
      required: [false],
      options: this.fb.array([]),
    });

    effect(() => {
      const field = this.selectedField();
      if (field) {
        this.propertiesForm.patchValue(
          {
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
          },
          { emitEvent: false }
        );
      }
    });

    this.propertiesForm.valueChanges.subscribe((value) => {
      this.fieldChanged.emit(value);
    });
  }

  get optionsFormArray(): FormArray<FormControl<string>> {
    return this.propertiesForm.get('options') as FormArray;
  }

  addOption(value = ''): void {
    const options = this.propertiesForm.get('options') as FormArray;
    options.push(this.fb.control(value));
  }

  removeOption(index: number): void {
    const options = this.propertiesForm.get('options') as FormArray;
    options.removeAt(index);
  }

  private setOptions(options: string[]): void {
    const optionsArray = this.propertiesForm.get('options') as FormArray;
    optionsArray.clear();
    options.forEach((option) => this.addOption(option));
  }
}
