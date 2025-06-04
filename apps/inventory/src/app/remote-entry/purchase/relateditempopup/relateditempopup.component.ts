import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ItemOptions, Items } from '../../model/purchase.interface';
import { PurchaseService } from '../../../services/purchase.service';
import { EndpointConstant } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'dfinance-frontend-relateditempopup',
  templateUrl: './relateditempopup.component.html',
  styleUrls: ['./relateditempopup.component.scss'],
})
export class RelateditempopupComponent {
  showPopup = true;
  @Input() itemname: any = "";
  @Input() itemCode: any = "";
  @Output() close = new EventEmitter<void>();
  destroySubscription: Subject<void> = new Subject<void>();
  @Output() saveRelatedItem = new EventEmitter<any[]>();

  fillItemsData = [] as Array<Items>;
  @Input() fillItemDataOptions: any = [];

  itemCodereturnField = 'itemcode';
  itemCodeKeys = ['Item Code', 'Item Name', 'PartNo', 'ID'];
  partyId = 0;
  locId = 0;
  currentItemTableIndex: number | null = null;
  searchItemId: any = "";
  itemSearchArr: any = [];
  selected = [];

  SelectionType = SelectionType;
  constructor(
    private PurchaseService: PurchaseService,) {
  }
  ngOnInit(): void {
    if (this.itemCode) {
      this.onItemCodeSelected(this.itemCode);
      this.searchItems();
    }
  }

  cancelItems() {
    this.showPopup = false;
    this.close.emit();
    return true;
  }

  onItemCodeSelected(option: any) {
    this.itemCode = option;
    const selectedItem = this.fillItemDataOptions.find((item: any) => item.itemcode === option);

    if (selectedItem) {
      this.itemname = selectedItem.itemname;
      this.searchItemId = selectedItem.id;
      this.searchItems();
    }
  }

  searchItems() {
    this.PurchaseService
      .getDetails(EndpointConstant.FETCHSEARCHITEM + this.searchItemId + '&value=' + this.itemname)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.itemSearchArr = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  onSelect(selected: any) {
    // console.log('Select Event', selected, this.selected);
  }

  onActivate(event: any) {
    if (event.type == 'dblclick' || (event.type == 'keydown' && event.event.code == 'Enter')) {
      this.saveRelatedItem.emit(event.row);
    }
  }
}
