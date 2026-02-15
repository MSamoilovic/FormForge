import { Component, input, computed } from '@angular/core';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-card-header',
  standalone: true,
  templateUrl: './card-header.component.html',
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardHeaderComponent {
  class = input<string>('');
  computedClass = computed(() => cn('flex flex-col space-y-1.5 p-6', this.class()));
}

