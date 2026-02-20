import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ButtonComponent,
  HlmDialogComponent,
  HlmDialogDescriptionComponent,
  HlmDialogFooterComponent,
  HlmDialogHeaderComponent,
  HlmDialogTitleComponent,
} from '../../../../shared';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    ButtonComponent,
    HlmDialogComponent,
    HlmDialogHeaderComponent,
    HlmDialogTitleComponent,
    HlmDialogDescriptionComponent,
    HlmDialogFooterComponent,
  ],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  public dialogRef = inject(DialogRef<boolean>);
  public data: { message: string } = inject(DIALOG_DATA);

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
