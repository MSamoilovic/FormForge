import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  currentTheme = signal<Theme>(this.getInitialTheme());

  private readonly storageKey = 'formforge-theme';

  private platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      const theme = this.currentTheme();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem(this.storageKey, theme);
        document.documentElement.classList.toggle('dark', theme === 'dark');
      }
    });
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
  }

  toggleTheme(): void {
    this.currentTheme.update((current) =>
      current === 'light' ? 'dark' : 'light'
    );
  }

  private getInitialTheme(): Theme {
    if (isPlatformBrowser(this.platformId)) {
      const storedTheme = localStorage.getItem(this.storageKey);
      if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
      }
    }
    return 'light';
  }
}
