import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog.component',
  imports: [],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  public dialogRef: MatDialogRef<ConfirmDialogComponent>;

  @Inject(MAT_DIALOG_DATA) public data: { message: string };

  constructor(
    dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { message: string }
  ) {
    this.data = data;
    this.dialogRef = dialogRef;
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
