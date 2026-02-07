import { Directive, input, computed } from '@angular/core';
import { cn } from '../../utils/cn';

@Directive({
  selector: 'input[appInput], textarea[appInput]',
  standalone: true,
  host: {
    '[class]': 'computedClass()',
  },
})
export class InputDirective {
  class = input<string>('');
  hasError = input<boolean>(false);

  computedClass = computed(() =>
    cn(
      'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm',
      'placeholder:text-muted-foreground',
      'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-50',
      this.hasError() ? 'border-destructive focus:ring-destructive' : 'border-input',
      this.class()
    )
  );
}

