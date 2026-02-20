import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastComponent, ToastType } from './toast.component';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  templateUrl: './toast-container.component.html',
})
export class ToastContainerComponent {
  toasts = signal<Toast[]>([]);

  addToast(toast: Omit<Toast, 'id'>): string {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = {
      id,
      duration: 4000,
      ...toast,
    };

    this.toasts.update((current) => [...current, newToast]);

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, newToast.duration);
    }

    return id;
  }

  removeToast(id: string): void {
    this.toasts.update((current) => current.filter((t) => t.id !== id));
  }

  clear(): void {
    this.toasts.set([]);
  }
}

