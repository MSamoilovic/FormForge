import { Component, input, computed } from '@angular/core';
import { cn } from '../../utils/cn';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardComponent {
  class = input<string>('');
  computedClass = computed(() =>
    cn('rounded-xl border bg-card text-card-foreground shadow', this.class())
  );
}

@Component({
  selector: 'app-card-header',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardHeaderComponent {
  class = input<string>('');
  computedClass = computed(() => cn('flex flex-col space-y-1.5 p-6', this.class()));
}

@Component({
  selector: 'app-card-title',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardTitleComponent {
  class = input<string>('');
  computedClass = computed(() =>
    cn('text-2xl font-semibold leading-none tracking-tight', this.class())
  );
}

@Component({
  selector: 'app-card-description',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardDescriptionComponent {
  class = input<string>('');
  computedClass = computed(() => cn('text-sm text-muted-foreground', this.class()));
}

@Component({
  selector: 'app-card-content',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardContentComponent {
  class = input<string>('');
  computedClass = computed(() => cn('p-6 pt-0', this.class()));
}

@Component({
  selector: 'app-card-footer',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardFooterComponent {
  class = input<string>('');
  computedClass = computed(() => cn('flex items-center p-6 pt-0', this.class()));
}

export const CardComponents = [
  CardComponent,
  CardHeaderComponent,
  CardTitleComponent,
  CardDescriptionComponent,
  CardContentComponent,
  CardFooterComponent,
];

