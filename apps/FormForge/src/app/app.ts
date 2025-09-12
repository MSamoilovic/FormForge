import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './modules/layout/components/header/header.component';

@Component({
  imports: [RouterModule, HeaderComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  protected title = 'FormForge';
}
