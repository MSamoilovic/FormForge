import { Component, input, computed } from '@angular/core';
import { cn } from '../../utils/cn';

@Component({
  selector: 'app-dialog',
  standalone: true,
  template: `<ng-content />`,
  host: { '[class]': 'computedClass()' },
})
export class HlmDialogComponent {
  class = input<string>('');
  computedClass = computed(() =>
    cn(
      'relative flex flex-col bg-card text-card-foreground',
      'rounded-xl border border-border shadow-2xl',
      this.class()
    )
  );
}

@Component({
  selector: 'app-dialog-header',
  standalone: true,
  template: `<ng-content />`,
  host: { '[class]': 'computedClass()' },
})
export class HlmDialogHeaderComponent {
  class = input<string>('');
  computedClass = computed(() =>
    cn('flex flex-col gap-1.5 p-6', this.class())
  );
}

@Component({
  selector: 'app-dialog-title, [hlmDialogTitle]',
  standalone: true,
  template: `<ng-content />`,
  host: { '[class]': 'computedClass()' },
})
export class HlmDialogTitleComponent {
  class = input<string>('');
  computedClass = computed(() =>
    cn('text-lg font-semibold leading-none tracking-tight', this.class())
  );
}

@Component({
  selector: 'app-dialog-description, [hlmDialogDescription]',
  standalone: true,
  template: `<ng-content />`,
  host: { '[class]': 'computedClass()' },
})
export class HlmDialogDescriptionComponent {
  class = input<string>('');
  computedClass = computed(() =>
    cn('text-sm text-muted-foreground', this.class())
  );
}

@Component({
  selector: 'app-dialog-footer',
  standalone: true,
  template: `<ng-content />`,
  host: { '[class]': 'computedClass()' },
})
export class HlmDialogFooterComponent {
  class = input<string>('');
  computedClass = computed(() =>
    cn('flex flex-col-reverse sm:flex-row sm:justify-end gap-2 p-6 pt-0', this.class())
  );
}

export const HlmDialogImports = [
  HlmDialogComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleComponent,
  HlmDialogDescriptionComponent,
  HlmDialogFooterComponent,
] as const;
