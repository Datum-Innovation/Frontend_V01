import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'dfinance-frontend-pricecategorypopup',
  templateUrl: './pricecategorypopup.component.html',
  styleUrls: ['./pricecategorypopup.component.scss'],
})
export class PricecategorypopupComponent {
  showPopup = true;
  @Input() pagetype:any ="";
  @Input() priceCatArr: any = [];
  @Output() close = new EventEmitter<void>();
  @Output() savePriceCategory = new EventEmitter<any[]>();
  searchItemId: any = "";
  selected = [];

  SelectionType = SelectionType;
  ngOnInit(): void {
  }

  cancelItems() {
    this.showPopup = false;
    this.close.emit();
    return true;
  }

  onSelect(selected: any) {
    // console.log('Select Event', selected, this.selected);
  }

  onActivate(event: any) {
    if (event.type == 'dblclick' || (event.type == 'keydown' && event.event.code == 'Enter')) {
      this.savePriceCategory.emit(event.row);
    }
  }
}
