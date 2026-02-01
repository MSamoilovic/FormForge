import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink, MatIconModule],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  title = input<string>('Welcome');
  subtitle = input<string>('');

  private themeService = inject(ThemeService);
  isDarkMode = computed(() => this.themeService.currentTheme() === 'dark');
}


