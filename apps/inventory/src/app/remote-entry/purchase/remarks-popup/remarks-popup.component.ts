import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dfinance-frontend-remarks-popup',
  templateUrl: './remarks-popup.component.html',
  styleUrls: ['./remarks-popup.component.scss'],
})
export class RemarksPopupComponent {
  showPopup = true; 
  @Input() remarks:string = "";
  @Output() close = new EventEmitter<void>();

  ngOnInit(): void {
    console.log(this.remarks);
  }

  cancelItems(){
    this.showPopup = false;
    this.close.emit();    
    return true;
  }
}
