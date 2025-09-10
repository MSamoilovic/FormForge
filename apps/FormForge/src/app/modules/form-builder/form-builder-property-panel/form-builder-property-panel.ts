import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import {
  FieldOption,
  FormField,
  FormRule,
  RuleCondition,
  RuleConditionGroup,
} from '@form-forge/models';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormBuilderFieldRulesComponent } from '../form-builder-form-rules/form-builder-field-rules.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatInput } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-form-builder-property-panel',
  imports: [
    ReactiveFormsModule,
    FormBuilderFieldRulesComponent,
    MatCardModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatDividerModule,
    MatInput,
    MatIconModule,
    MatIconButton,
    MatButton,
  ],
  templateUrl: './form-builder-property-panel.html',
  styleUrl: './form-builder-property-panel.css',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBuilderPropertyPanel {
  readonly selectedField = input.required<FormField | null>();

  readonly allCanvasFields = input.required<FormField[] | null>();

  readonly fieldChanged = output<Partial<FormField>>();
  readonly addOptionRequested = output<void>();
  readonly removeOptionRequested = output<number>();
  private readonly fb = inject(FormBuilder);

  propertiesForm: FormGroup;

  constructor() {
    this.propertiesForm = this.fb.group({
      label: ['', Validators.required],
      placeholder: [''],
      required: [false],
      options: this.fb.array<FormControl>([]),
      rules: this.fb.array<FormGroup>([]),
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

        this.setOptions(field.options);

        this.setRules(field.rules);
      }
    });

    this.propertiesForm.valueChanges.subscribe((value) => {
      this.fieldChanged.emit(value);
    });
  }

  get optionsFormArray(): FormArray<FormControl<string>> {
    return this.propertiesForm.get('options') as FormArray;
  }

  get rulesFormArray(): FormArray {
    return this.propertiesForm.get('rules') as FormArray;
  }

  addOption(value = ''): void {
    const options = this.propertiesForm.get('options') as FormArray;
    options.push(this.fb.control(value));
  }

  removeOption(index: number): void {
    const options = this.propertiesForm.get('options') as FormArray;
    options.removeAt(index);
  }

  private setOptions(options: FieldOption[] = []): void {
    const optionsArray = this.propertiesForm.get('options') as FormArray;

    optionsArray.clear({ emitEvent: false });

    options.forEach((option) => {
      optionsArray.push(this.createOptionGroup(option), { emitEvent: false });
    });
  }

  private createOptionGroup(option: FieldOption): FormGroup {
    return this.fb.group({
      label: [option.label, Validators.required],
      value: [option.value, Validators.required],
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
    if ('operator' in condition) {
      const group = condition as RuleConditionGroup;
      return this.fb.group({
        operator: [group.operator],
        conditions: this.fb.array(
          group.conditions.map((c) => this.buildConditionForm(c))
        ),
      });
    }

    // Ako je običan USLOV, kreiramo prost FormGroup
    const simpleCondition = condition as RuleCondition;
    return this.fb.group({
      fieldId: [simpleCondition.fieldId, Validators.required],
      operator: [simpleCondition.operator, Validators.required],
      value: [simpleCondition.value, Validators.required],
    });
  }

  getAllFields(): FormField[] {
    return this.allCanvasFields() ?? [];
  }
}
