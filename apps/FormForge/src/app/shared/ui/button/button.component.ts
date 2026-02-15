import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-lg px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './button.component.html',
  host: {
    '[class]': 'computedClass()',
    '[attr.routerLink]': 'routerLink()',
  },
})
export class ButtonComponent {
  variant = input<ButtonVariants['variant']>('default');
  size = input<ButtonVariants['size']>('default');
  class = input<string>('');
  routerLink = input<string | any[] | null>(null);
  queryParams = input<Record<string, any> | null>(null);
  fragment = input<string | undefined>(undefined);
  disabled = input<boolean>(false);

  computedClass = computed(() =>
    cn(buttonVariants({ variant: this.variant(), size: this.size() }), this.class())
  );
}
