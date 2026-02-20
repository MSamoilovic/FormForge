import { Component, input, computed } from '@angular/core';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-card-content',
  standalone: true,
  templateUrl: './card-content.component.html',
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardContentComponent {
  class = input<string>('');
  computedClass = computed(() => cn('p-6 pt-0', this.class()));
}

