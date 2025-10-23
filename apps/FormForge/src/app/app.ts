import { Component, effect, inject, Renderer2 } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './modules/layout/components/header/header.component';
import { Theme, ThemeService } from './modules/core/services/theme.service';

@Component({
  imports: [RouterModule, HeaderComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
  providers: [ThemeService],
})
export class App {
  protected title = 'FormForge';

  private themeService = inject(ThemeService);
  private renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      const currentTheme = this.themeService.currentTheme();
      this.updateBodyClass(currentTheme);
    });
  }

  private updateBodyClass(theme: Theme): void {
    const body = document.body;
    if (theme === 'dark') {
      this.renderer.addClass(body, 'dark-theme');
    } else {
      this.renderer.removeClass(body, 'dark-theme');
    }
  }
}
