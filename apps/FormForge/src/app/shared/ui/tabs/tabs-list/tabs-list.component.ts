import { Component, input, computed } from '@angular/core';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-tabs-list',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class]': 'computedClass()',
    '[attr.role]': '"tablist"',
  },
})
export class TabsListComponent {
  class = input<string>('');

  computedClass = computed(() =>
    cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      this.class()
    )
  );
}

