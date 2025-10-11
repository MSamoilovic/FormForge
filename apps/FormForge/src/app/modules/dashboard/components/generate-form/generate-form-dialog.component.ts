import { Component, inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { TextFieldModule } from '@angular/cdk/text-field';
import { AIApiService } from '../../../core/services/ai-api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-generate-form-dialog.component',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    TextFieldModule,
  ],
  providers: [AIApiService, NotificationService],
  templateUrl: './generate-form-dialog.component.html',
  styleUrl: './generate-form-dialog.component.scss',
})
export class GenerateFormDialogComponent {
  public dialogRef = inject(MatDialogRef<GenerateFormDialogComponent>);

  private aiApiService = inject(AIApiService);
  private notificationService = inject(NotificationService);

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
        console.error('AI form generation failed:', err);
        this.notificationService.showError(
          'AI failed to generate the form. Please try again.'
        );
      },
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
