import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ItemMasterService } from '../../services/itemmaster.service';
import { BaseService, EndpointConstant } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'dfinance-frontend-branchitems',
  templateUrl: './branchitems.component.html',
  styleUrls: ['./branchitems.component.css'],
})
export class BranchitemsComponent {

  isLoading = false;
  isEditBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  isInputDisabled: boolean = true;
  isUpdate: boolean = false; 


  destroySubscription: Subject<void> = new Subject<void>();
  SelectionType = SelectionType;
  selected: any = [];



  branchItemsForm!: FormGroup;

  constructor(
    private itemService: ItemMasterService,
    private baseService:BaseService
  ) {

  }

  ngOnInit(): void {
    this.FetchBranchItems();
  }

  isEditMode = false;
  onClickEdit() { 
    this.isEditMode = true;
    this.isInputDisabled = !this.isInputDisabled;
  
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    this.finalItemData = [];
   
  }
 

 
 

  columns: any[] = []; // Array to store column definitions
  branchItemData: any[] = []; // Array to store the row data
  finalItemData: any[] = [];

  FetchBranchItems(): void {
    this.itemService.getDetails(EndpointConstant.FILLBRANCHITEMS)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          const data = response?.data || [];
          this.branchItemData = data;
          console.log("Branch item data:" + JSON.stringify(this.branchItemData, null, 2))         
          if (data.length > 0) {           
            const dynamicColumns = Object.keys(data[0]).map(key => ({
              name: key, // Column name based on the key
              prop: key, // Prop to match with data key
              label: key // Use the key as label for simplicity
            }));

            // Set dynamic columns
            this.columns = dynamicColumns;
            console.log('Columns:', this.columns);
          }
        }
      });
  }

  shouldShowCheckbox(columnLabel: string): boolean { 
    return columnLabel !== 'ItemCode' && columnLabel !== 'ItemName' && columnLabel !=='ID';
  }
  
  selectedIds: number[] = [];



  onCheckboxChange(row: any, columnProp: string, event: Event): void {   
    const isChecked = (event.target as HTMLInputElement).checked;
    row[columnProp] = isChecked ? 1 : 0;     
    console.log("Row :"+JSON.stringify(row,null,2))
    
    if (isChecked) {     
      if (!this.selectedIds.includes(row.ID)) {
        this.selectedIds.push(row.ID);
        this.finalItemData.push(row);
      }
    } else {
     
      const rowIndex = this.finalItemData.findIndex(item => item.ID === row.ID);
      if (rowIndex !== -1) {
        this.finalItemData[rowIndex][columnProp] = isChecked ? 1 : 0;  
      } 
     
      this.selectedIds = this.selectedIds.filter(id => id !== row.ID);
    }
  
    
    console.log("Selected Array:", JSON.stringify(this.finalItemData,null,2));
  }
  
  

  onClickSave() {  
    let extractedData: any[] = [];
  
    this.finalItemData.forEach(item => { 
      let branchesWithValueOne: string[] = [];
  
      // Loop through all keys in the item object
      Object.entries(item).forEach(([key, value]) => {    
        if (key !== 'ID' && Number(value) === 1) { // Ensure the value is converted to a number for comparison
          branchesWithValueOne.push(key); // Add the branch to the array
        }
      });
  
      // Log the intermediate results for debugging
      console.log('Current Item:', item);
      console.log('Branches with Value 1:', branchesWithValueOne);
  
      // Only add to extractedData if there are branches with value 1
      if (branchesWithValueOne.length > 0) {
        extractedData.push({
          ItemID: item.ID, // Include the item ID
          Branches: branchesWithValueOne // Include all branches with value 1
        });
      }
    });
  
    // Output the extracted data
    console.log('Extracted Data:', JSON.stringify(extractedData, null, 2));
this.createCallback(extractedData);

  }
  createCallback(payload:any){    
    this.itemService.saveDetails(EndpointConstant.SAVEBRANCHITEMS,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

         
          if(response.httpCode == 200){
            this.baseService.showCustomDialogue('Successfully saved branch items'); 
            
          }     
        },
        error: (errormsg) => {
          console.log(errormsg);
          this.isLoading = false;
        },
      });
  }

  
  
  
}
