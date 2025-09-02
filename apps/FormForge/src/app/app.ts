import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormRendererPageComponent } from './modules/form-renderer/form-renderer-page/form-renderer-page.component';

@Component({
  imports: [RouterModule, FormRendererPageComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  standalone: true,
})
export class App {
  protected title = 'FormForge';
}
