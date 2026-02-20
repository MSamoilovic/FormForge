import { Component, input, computed } from '@angular/core';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-card-footer',
  standalone: true,
  templateUrl: './card-footer.component.html',
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardFooterComponent {
  class = input<string>('');
  computedClass = computed(() => cn('flex items-center p-6 pt-0', this.class()));
}

