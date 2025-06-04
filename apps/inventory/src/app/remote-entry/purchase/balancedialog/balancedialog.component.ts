import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dfinance-frontend-balancedialog',
  templateUrl: './balancedialog.component.html',
  styleUrls: ['./balancedialog.component.scss'],
})
export class BalancedialogComponent {

  selectedAccount: 'Card' | 'Cash' = 'Card'; // Default selection

  constructor(private dialogRef: MatDialogRef<BalancedialogComponent>) {}

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      this.selectedAccount = 'Cash'; // Select Cash
    } else if (event.key === 'ArrowLeft') {
      this.selectedAccount = 'Card'; // Select Card
    } else if (event.key === 'Enter') {
      // Handle the selection confirmation
      this.dialogRef.close(this.selectedAccount);
    } else if (event.code === 'KeyC') {
      this.selectedAccount = 'Cash'; // Select Cash
      this.dialogRef.close(this.selectedAccount);
    } else if (event.code === 'KeyB') {
      this.selectedAccount = 'Card'; // Select Cash
      this.dialogRef.close(this.selectedAccount);
    }
  }

  closeDialog(): void {
    this.dialogRef.close(); // Close without selection
  }
}
