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
  templateUrl: './generate-form-dialog.component.html',
  styleUrl: './generate-form-dialog.component.scss',
})
export class GenerateFormDialogComponent {
  public dialogRef = inject(MatDialogRef<GenerateFormDialogComponent>);

  promptControl = new FormControl('', Validators.required);

  isLoading = signal(false);

  generate(): void {
    if (this.promptControl.invalid) {
      return;
    }

    this.dialogRef.close(this.promptControl.value);
  }

  close(): void {
    this.dialogRef.close();
  }
}
