import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'dfinance-frontend-reference-item-list',
  templateUrl: './reference-item-list.component.html',
  styleUrls: ['./reference-item-list.component.css'],
})
export class ReferenceItemListComponent {
  @Input() itemList:any[] = [];  
  @Input() transId:number = 0;
  @Output() saveItems = new EventEmitter<any[]>();
  @Output() close = new EventEmitter<void>();
  showPopup = true;
  savedList: any = [];

  ngOnInit(): void {
    this.savedList = JSON.parse(JSON.stringify(this.itemList));
  }
  saveItemsList(){
    this.showPopup = false;
    this.saveItems.emit(this.savedList);
    
  }

  onChangeSelection(event:Event,rowIndex:any,ID:number){
    let input = event.target as HTMLInputElement;
    let selected = input.checked;
    this.savedList[rowIndex]['selected'] = selected;
    console.log('---before'+this.savedList);
    // if(selected){
    //   // Check if the item is already in savedList
    //   const alreadyAdded = this.savedList.some((item:any) => item.id === this.itemList[rowIndex].id);
      
    //   // If not, push it
    //   if (!alreadyAdded) {
    //    // this.itemList[rowIndex]['transId'] = this.transId;
    //     this.savedList.push(this.itemList[rowIndex]);
    //   }
    // } else {
    //   console.log('---removed');
    //   // Remove item from savedList
    //   this.savedList = this.savedList.filter((item:any) => item.id !== this.itemList[rowIndex].id);
    // }
  }

    onClickSelectAll(event:Event){
        let input = event.target as HTMLInputElement;
        let isChecked = input.checked;
        this.savedList.forEach((item:any) => {
          item.selected = isChecked;    
        });  
        // if(isChecked == true){
        //   this.itemList.forEach((item:any) => {
        //     //item.transId = this.transId;
        //     this.savedList.push(item);            
        //   });          
        // } else{
        //   this.savedList = [];
        // }
    }

    cancelItems(){
      this.showPopup = false;
      this.close.emit();
    }
  
}
