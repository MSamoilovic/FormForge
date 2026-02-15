import { Component, input, computed } from '@angular/core';
import { cn } from '../../../utils/cn';

@Component({
  selector: 'app-card-description',
  standalone: true,
  templateUrl: './card-description.component.html',
  host: {
    '[class]': 'computedClass()',
  },
})
export class CardDescriptionComponent {
  class = input<string>('');
  computedClass = computed(() => cn('text-sm text-muted-foreground', this.class()));
}

