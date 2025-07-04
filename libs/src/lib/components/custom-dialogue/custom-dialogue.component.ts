import { Component, ElementRef, EventEmitter, Inject, Output, ViewChild } from '@angular/core';
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
  @ViewChild('okButton') okButton!: ElementRef;
  @ViewChild('cancelButton') cancelButton!: ElementRef;
  @ViewChild('barcodeInputRef') barcodeInputRef!: ElementRef;
 showToast: boolean = false;
  toastMessage: string = '';
  toastType: 'success' | 'error' | 'info' = 'success'; 
  onClose(): void {
    this.dialogRef.close();
  }
  closeBarcode(){
    this.dialogRef.close(this.barcodeInput);
  }

  onBarcodeInputChange() {
    // Emit the updated barcodeInput value whenever it changes
    if(this.barcodeInput){
      this.barcodeChanged.emit(this.barcodeInput);
      this.barcodeInput = "";
      // Use setTimeout to ensure Angular updates the DOM before focusing again
      setTimeout(() => {
        this.barcodeInputRef?.nativeElement.focus();
      });
    }    
  }
  onConfirm(){
    this.dialogRef.close(true);
  }
  onCancel(){
    this.dialogRef.close(false);
  }

  handleKeydown(event: KeyboardEvent, button: 'ok' | 'cancel') {
    if (event.key === 'ArrowRight' && button === 'ok') {
      // Move focus to Cancel button
      this.cancelButton.nativeElement.focus();
      event.preventDefault();
    } else if (event.key === 'ArrowLeft' && button === 'cancel') {
      // Move focus back to OK button
      this.okButton.nativeElement.focus();
      event.preventDefault();
    }
  }

  // Focus the input field when clicking anywhere in the dialog
  focusBarcodeInput(event: MouseEvent): void {
    // Prevent focus loss when clicking inside dialog but outside input
    if (this.barcodeInputRef && !(event.target as HTMLElement).matches('input')) {
      setTimeout(() => this.barcodeInputRef.nativeElement.focus(), 0);
    }
  }

  ngAfterViewInit(): void {
    if (this.data.key === 'barcode') {
      setTimeout(() => {
        this.barcodeInputRef?.nativeElement.focus();
      });
    } else {
      this.okButton.nativeElement.focus();
    }
  }
  // Show Toast/Alert message
  showAlertMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Hide the toast message after 3 seconds
    setTimeout(() => {
      this.showToast = false;
    }, 3000);
  }
}
