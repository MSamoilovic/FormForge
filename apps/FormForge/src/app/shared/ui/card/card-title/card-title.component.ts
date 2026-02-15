import { Component, input, computed } from '@angular/core';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-card-title',
  standalone: true,
  templateUrl: './card-title.component.html',
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

