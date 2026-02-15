import { Component, input, computed } from '@angular/core';
import { cn } from '../../utils/cn';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
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
