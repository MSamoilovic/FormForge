import { inject, Injectable, ApplicationRef, ComponentRef, createComponent, EnvironmentInjector } from '@angular/core';
import { ToastContainerComponent } from '../../../shared/ui/toast/toast-container.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private appRef = inject(ApplicationRef);
  private injector = inject(EnvironmentInjector);
  private toastContainerRef: ComponentRef<ToastContainerComponent> | null = null;

  private getToastContainer(): ToastContainerComponent {
    if (!this.toastContainerRef) {
      this.toastContainerRef = createComponent(ToastContainerComponent, {
        environmentInjector: this.injector,
      });
      document.body.appendChild(this.toastContainerRef.location.nativeElement);
      this.appRef.attachView(this.toastContainerRef.hostView);
    }
    return this.toastContainerRef.instance;
  }

  showSuccess(message: string): void {
    this.getToastContainer().addToast({
      message,
      type: 'success',
      duration: 4000,
    });
  }

  showError(message: string): void {
    this.getToastContainer().addToast({
      message,
      type: 'error',
      duration: 5000,
    });
  }

  showInfo(message: string): void {
    this.getToastContainer().addToast({
      message,
      type: 'info',
      duration: 4000,
    });
  }
}
