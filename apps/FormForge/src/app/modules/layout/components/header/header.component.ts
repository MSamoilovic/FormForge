import { Component, computed, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ThemeService } from '../../../core/services/theme.service';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-header',
  imports: [
    MatIconModule,
    MatToolbarModule,
    RouterModule,
    MatTooltip,
    MatIconButton,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  title = 'FormForge';

  private themeService = inject(ThemeService);

  public isDarkMode = computed(
    () => this.themeService.currentTheme() === 'dark'
  );

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
