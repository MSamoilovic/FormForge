import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideCheckCircle2, lucideXCircle, lucideInfo, lucideX } from '@ng-icons/lucide';
import { cn } from '../../utils/cn';

export type ToastType = 'success' | 'error' | 'info';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideCheckCircle2,
      lucideXCircle,
      lucideInfo,
      lucideX,
    }),
  ],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  message = input.required<string>();
  type = input<ToastType>('info');
  dismissible = input<boolean>(true);

  dismiss = output<void>();

  iconName = computed(() => {
    switch (this.type()) {
      case 'success':
        return 'lucideCheckCircle2';
      case 'error':
        return 'lucideXCircle';
      default:
        return 'lucideInfo';
    }
  });

  iconClass = computed(() => {
    switch (this.type()) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  });

  computedClass = computed(() =>
    cn(
      'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg',
      'bg-background text-foreground py-4 px-4',
      'animate-in slide-in-from-top-full fade-in-0',
      this.type() === 'success' && 'border-green-200 dark:border-green-800',
      this.type() === 'error' && 'border-red-200 dark:border-red-800',
      this.type() === 'info' && 'border-blue-200 dark:border-blue-800'
    )
  );

  onDismiss(): void {
    this.dismiss.emit();
  }
}

