import { Component, effect, inject, input, output } from '@angular/core';
import { ColorFormat, FieldOption, FormField, FormRule, FormTheme, RuleCondition, RuleConditionGroup } from '@form-forge/models';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormBuilderFieldRulesComponent } from '../form-builder-form-rules/form-builder-field-rules.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilderThemeEditorComponent } from '../form-builder-theme-editor/form-builder-theme-editor.component';

@Component({
  selector: 'app-form-builder-property-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormBuilderFieldRulesComponent,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatTabGroup,
    MatTab,
    MatSelectModule,
    FormBuilderThemeEditorComponent,
  ],
  templateUrl: './form-builder-property-panel.html',
  styleUrls: ['./form-builder-property-panel.scss'],
})
export class FormBuilderPropertyPanel {
  private fb = inject(FormBuilder);

  readonly selectedField = input.required<FormField | null>();
  readonly allCanvasFields = input.required<FormField[]>();

  readonly fieldChanged = output<Partial<FormField>>();
  readonly themeChanged = output<FormTheme>();

  readonly formTheme = input<FormTheme | null>();

  private previousFieldId: string | null = null;

  propertiesForm: FormGroup;

  // Color format options for color picker
  colorFormats = [
    { value: ColorFormat.HEX, label: 'HEX (#RRGGBB)' },
    { value: ColorFormat.RGB, label: 'RGB (r, g, b)' },
    { value: ColorFormat.RGBA, label: 'RGBA (r, g, b, a)' },
    { value: ColorFormat.HSL, label: 'HSL (h, s%, l%)' },
    { value: ColorFormat.HSLA, label: 'HSLA (h, s%, l%, a)' },
  ];

  constructor() {
    this.propertiesForm = this.fb.group({
      label: ['', Validators.required],
      placeholder: [''],
      required: [false],
      options: this.fb.array<FormGroup>([]),
      rules: this.fb.array<FormGroup>([]),
      // Number field specific properties
      min: [null],
      max: [null],
      step: [null],
      // Color picker specific properties
      colorFormat: [ColorFormat.HEX],

      theme: this.fb.group({
        primaryColor: [''],
        backgroundColor: [''],
        textColor: [''],
        fontFamily: [''],
        borderRadius: [0],
      }),
    });

    effect(() => {
      const field = this.selectedField();

      if (field && this.previousFieldId !== field.id) {
        this.propertiesForm.reset(
          {
            label: field.label,
            placeholder: field.placeholder,
            required: field.required,
            min: field.min ?? null,
            max: field.max ?? null,
            step: field.step ?? null,
            colorFormat: field.colorFormat ?? ColorFormat.HEX,
            theme: this.formTheme(),
          },
          { emitEvent: false }
        );

        this.setOptions(field.options);
        this.setRules(field.rules);
        this.previousFieldId = field.id;
      }

      if (!field) {
        this.previousFieldId = null;
      }
    });

    this.propertiesForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((value) => {
        this.fieldChanged.emit(value);
      });

    this.themeFormGroup.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntilDestroyed()
      )
      .subscribe((themeValue) => {
        console.log(
          'PropertyPanel: Theme changed, emitting event:',
          themeValue
        );
        this.themeChanged.emit(themeValue);
      });
  }

  get optionsFormArray(): FormArray {
    return this.propertiesForm.get('options') as FormArray;
  }

  get rulesFormArray(): FormArray {
    return this.propertiesForm.get('rules') as FormArray;
  }

  getAllFields(): FormField[] {
    return this.allCanvasFields() ?? [];
  }

  get themeFormGroup(): FormGroup {
    return this.propertiesForm.get('theme') as FormGroup;
  }

  addOption(): void {
    const optionsArray = this.propertiesForm.get('options') as FormArray;
    const newOption: FieldOption = {
      label: `Option ${optionsArray.length + 1}`,
      value: `option_${optionsArray.length + 1}`,
    };
    optionsArray.push(this.createOptionGroup(newOption));
  }

  removeOption(index: number): void {
    this.optionsFormArray.removeAt(index);
  }

  private createOptionGroup(option: FieldOption): FormGroup {
    return this.fb.group({
      label: [option.label, Validators.required],
      value: [option.value, Validators.required],
    });
  }

  private setOptions(options: FieldOption[] = []): void {
    const optionsArray = this.propertiesForm.get('options') as FormArray;
    optionsArray.clear({ emitEvent: false });
    options.forEach((option) => {
      optionsArray.push(this.createOptionGroup(option), { emitEvent: false });
    });
  }

  private setRules(rules: FormRule[] = []): void {
    const rulesArray = this.propertiesForm.get('rules') as FormArray;
    rulesArray.clear({ emitEvent: false });
    rules.forEach((rule) => {
      const ruleGroup = this.fb.group({
        id: [rule.id],
        description: [rule.description],
        conditions: this.fb.array(
          rule.conditions.map((c) => this.buildConditionForm(c))
        ),
        actions: this.fb.array(rule.actions.map((a) => this.fb.group(a))),
      });
      rulesArray.push(ruleGroup, { emitEvent: false });
    });
  }

  private buildConditionForm(
    condition: RuleCondition | RuleConditionGroup
  ): FormGroup {
    if ('conditions' in condition) {
      const group = condition as RuleConditionGroup;
      return this.fb.group({
        operator: [group.operator],
        conditions: this.fb.array(
          group.conditions.map((c) => this.buildConditionForm(c))
        ),
      });
    }

    const simpleCondition = condition as RuleCondition;
    return this.fb.group({
      fieldId: [simpleCondition.fieldId, Validators.required],
      operator: [simpleCondition.operator, Validators.required],
      value: [simpleCondition.value, Validators.required],
    });
  }
}
