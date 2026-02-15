import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { ButtonComponent } from '../../../../shared';

@Component({
  selector: 'app-confirm-dialog.component',
  standalone: true,
  imports: [MatDialogModule, ButtonComponent],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  public dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  public data: { message: string } = inject(MAT_DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
