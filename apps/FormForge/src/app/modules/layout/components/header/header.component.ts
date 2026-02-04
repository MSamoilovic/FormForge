import { Component, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  lucideSun,
  lucideMoon,
  lucideLayoutDashboard,
  lucidePlus,
  lucideUser,
  lucideLogOut,
  lucideChevronDown,
} from '@ng-icons/lucide';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, NgIconComponent],
  viewProviders: [
    provideIcons({
      lucideSun,
      lucideMoon,
      lucideLayoutDashboard,
      lucidePlus,
      lucideUser,
      lucideLogOut,
      lucideChevronDown,
    }),
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  title = 'FormForge';

  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  isDarkMode = computed(() => this.themeService.currentTheme() === 'dark');
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  isUserMenuOpen = signal(false);

  getInitials(): string {
    const user = this.currentUser();
    if (!user) return '?';

    if (user.full_name) {
      return user.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user.username.slice(0, 2).toUpperCase();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update((v) => !v);
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  logout(): void {
    this.closeUserMenu();
    this.authService.logout();
  }
}
