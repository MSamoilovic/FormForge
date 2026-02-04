import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { lucideSparkles, lucideLoader2, lucideX } from '@ng-icons/lucide';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AIApiService } from '../../../core/services/ai-api.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-generate-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, NgIconComponent, TextFieldModule],
  viewProviders: [
    provideIcons({
      lucideSparkles,
      lucideLoader2,
      lucideX,
    }),
  ],
  providers: [AIApiService],
  templateUrl: './generate-form-dialog.component.html',
  styleUrl: './generate-form-dialog.component.scss',
})
export class GenerateFormDialogComponent {
  public dialogRef = inject(MatDialogRef<GenerateFormDialogComponent>);

  private aiApiService = inject(AIApiService);
  private errorHandler = inject(ErrorHandlerService);

  promptControl = new FormControl('', Validators.required);

  isLoading = signal(false);

  generate(): void {
    if (this.promptControl.invalid) {
      return;
    }

    this.isLoading.set(true);
    const prompt = this.promptControl.value;

    this.aiApiService.generateFormFromText(prompt!).subscribe({
      next: (generatedSchema) => {
        this.isLoading.set(false);
        this.dialogRef.close(generatedSchema);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorHandler.handle(err, 'AI.generateForm');
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
