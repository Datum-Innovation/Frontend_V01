import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'dfinance-frontend-custom-dialogue',
  templateUrl: './custom-dialogue.component.html',
  styleUrls: ['./custom-dialogue.component.scss'],
})
export class CustomDialogueComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
  private dialogRef: MatDialogRef<CustomDialogueComponent>) {}
  barcodeInput: string = '';
  // EventEmitter to emit the barcodeInput value
  @Output() barcodeChanged = new EventEmitter<string>();

  onClose(): void {
    this.dialogRef.close();
  }
  closeBarcode(){
    this.dialogRef.close(this.barcodeInput);
  }

  onBarcodeInputChange() {
    // Emit the updated barcodeInput value whenever it changes
    this.barcodeChanged.emit(this.barcodeInput);
  }
}
