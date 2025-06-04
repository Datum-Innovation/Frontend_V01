import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dfinance-frontend-itemrates-popup',
  templateUrl: './itemrates-popup.component.html',
  styleUrls: ['./itemrates-popup.component.scss'],
})
export class ItemratesPopupComponent {
    showPopup = true; 
    @Input() itemRateArr:any = [];
    @Input() itemname:any = ""; 
    @Output() close = new EventEmitter<void>();
  
    ngOnInit(): void {
      console.log(this.itemRateArr);
    }
  
    cancelItems(){
      this.showPopup = false;
      this.close.emit();    
      return true;
    }
}
