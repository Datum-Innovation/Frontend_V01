import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { GridNavigationService } from '@dfinance-frontend/shared';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'dfinance-frontend-account-popup',
  templateUrl: './account-popup.component.html',
  styleUrls: ['./account-popup.component.css'],
})
export class AccountPopupComponent {
  showPopup = true;  
  @Input() accountData: any[] = [];
  @Input() accountGridDetails:any = []; 
  @Input() popupType:string = "";
  @ViewChild('dataTable', { static: false }) table!: ElementRef;  
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @Output() savedata = new EventEmitter<any[]>();
  @Output() close = new EventEmitter<void>();
  @ViewChild('okbutton') okButton!: ElementRef;
  @ViewChild('cancelbutton') cancelbutton!: ElementRef;
  currentItemTableIndex: number | null = null;
  accountCodereturnField = 'accountcode';
  accountCodeKeys = ['Account Code','Account Name','ID'];
  totalAmountInGrid: any = 0;
  formattedAmount!: string;
  balanceAmount = 0.00;
  showBalanceAmount:boolean = false;

  selected: any = [];
  SelectionType = SelectionType;

  changesMade = false;

  // noGridItem = true;
  modifiedArray: any = [];
  tablecolumns = [
    { name: 'ID', field: 'id'},
    { name: 'Account Code', field: 'accountcode' },
    { name: 'Account Name', field: 'accountname' },
    { name: 'Description', field: 'description' },
    { name: 'Amount', field: 'amount' }
  ];
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname:any = "";

  enableInlineEditing:boolean = false;
  constructor(
    private decimalPipe: DecimalPipe,    
    private gridnavigationService: GridNavigationService,
    private elementRef: ElementRef
  ) {
    this.formattedAmount = this.formatAmount(this.totalAmountInGrid);
  }

  ngOnInit(): void {
    this.modifiedArray = JSON.parse(JSON.stringify(this.accountGridDetails));
    // if(this.modifiedArray.length == 0){
    //   this.onClickAddItem();
    // } else{
    //   //this.noGridItem = false;
    //   this.onClickAddItem();
    // }

    this.onClickAddItem();

    this.calculateTotal();
    if(this.popupType != 'tax'){      
      this.showBalanceAmount = true;
    }
    
  }

  save(){
    this.showPopup = false;
    //removing last entry from modifiedArray ..
    this.modifiedArray.pop();
    let response:any = {
      "gridDetails":this.modifiedArray,
      "totalamount":this.formattedAmount
    }
    this.savedata.emit(response);    
  }
  cancelItems(){
    this.showPopup = false;
    if(this.changesMade == true){
      if(confirm('Do you want to save data edited?')){
        this.save();
      }
    }
    this.close.emit();    
    return true;
  }
  onClickAddItem(accountcodesel=false){  
    let rowIndex = this.modifiedArray.length - 1;
    if( this.modifiedArray.length == 0 || Object.keys(this.modifiedArray[rowIndex]['accountCode']).length > 0){
      this.modifiedArray.push({
        id: 0,
        accountCode: {},
        description: "",
        amount: 0,
        payableAccount: {}
      }); 
      this.currentItemTableIndex = this.modifiedArray.length - 1;
      this.modifiedArray = [...this.modifiedArray];
      if(!accountcodesel){
        //set row and column index....        
        this.currentRowIndex = this.modifiedArray.length - 1;
        this.currentColIndex = 0; 
        this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);// Reset column index to 0 for the new row
        setTimeout(() => {
          this.focusGridCell(this.currentRowIndex,this.currentColIndex);
        });
      }  
      return true;
    }
     return false;   
  }

  onAccountCodeSelected(option:any,rowIndex:string){   
    this.changesMade = true;
    this.accountData.map((item: any) => {
      if (item.accountcode === option) {
        this.modifiedArray[rowIndex]['accountCode']  = {
          "alias":item.accountcode,
          "name": item.accountname,
          "id": item.id
        };
      }
    });
    this.onClickAddItem(true);
    
    //find accountname column and its' index...
    const accountNameIndex = this.tablecolumns.findIndex(column => column.name === 'Account Name');
    this.currentColIndex = accountNameIndex - 1;
    this.gridnavigationService.focusCell(this.gridCells.toArray(),this.currentRowIndex, this.currentColIndex);   
    this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex); 
  }

  onChangeDescription(event:any,rowIndex:string){
    this.changesMade = true; 
    this.modifiedArray[rowIndex]['description'] = event.target.value;
  }

  onChangeAmount(event:any,rowIndex:string){
    this.changesMade = true; 
    this.modifiedArray[rowIndex]['amount'] = event.target.value;
    this.calculateTotal();
  }

  calculateTotal(){
    let totalAmount = 0;
    if(this.popupType == 'tax'){
      this.accountData.map((item: any) => {
        totalAmount += Number(item.amount);
      });
      this.totalAmountInGrid = totalAmount;
      this.balanceAmount = -this.totalAmountInGrid;
    } else{
      this.modifiedArray.map((item: any) => {
        totalAmount += Number(item.amount);
      });
      this.totalAmountInGrid = totalAmount;
      this.balanceAmount = -this.totalAmountInGrid;
    }
    
    this.formattedAmount = this.formatAmount(this.totalAmountInGrid);
  }

  formatAmount(amount: number): string {
    const formattedAmount = this.decimalPipe.transform(amount, '1.4-4');
    return formattedAmount ? formattedAmount : '0.0000';
  }
  
  onSelect(selected: any) {
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Delete' && this.selected.length > 0) {
      this.deleteAccount(this.selected[0].id);
    }
  }

  deleteAccount(accountId: any) {
    const index = this.modifiedArray.findIndex((account:any) => account.id === accountId);
    if(index == this.modifiedArray.length - 1){
      return false;
    } else{
        if (confirm("Are you sure you want to delete this details?")) {      
        if (index !== -1) {
          this.modifiedArray.splice(index, 1);
        }
        this.modifiedArray = [...this.modifiedArray];
        this.calculateTotal();
      }
      return true;
    }     
  }
  isNegative(): boolean {
    return this.balanceAmount < 0;
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
  }

  onClickSpan(event:any, rowIndex: number, colIndex: number): void {
    this.enableInlineEditing = false;
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditingAcc();

    setTimeout(() => {
        this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }

  handleKeysForInlineEditingAcc(){
    // Handle other keys for inline editing
    const cellid = "accountcell-"+this.currentRowIndex+"-"+this.currentColIndex;
    const cellelement = document.getElementById(cellid);
    if (cellelement) {
      const columnName = cellelement.getAttribute('data-column-name');
      if(columnName != null){
        this.currentColumname = columnName;
      }
    } 
  }
  @HostListener('document:keydown', ['$event'])
  onAccountKeyDown(event: KeyboardEvent) {  
    event.stopPropagation();
    let cursorPosition = 0;
    let targetlength = 0;
    const targetElement = event.target as HTMLElement;

    // Check if the event target is an input or textarea
    if (targetElement instanceof HTMLInputElement || targetElement instanceof HTMLTextAreaElement) {
      if(targetElement.selectionStart != null){
        cursorPosition = targetElement.selectionStart;
      }     
      targetlength = targetElement.value.length;    
    }
    switch (event.key) {
      case 'ArrowDown':
        if(this.enableInlineEditing == false){
          event.preventDefault();
          if (this.currentRowIndex < this.modifiedArray.length - 1) {
            this.currentRowIndex++;
            this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }   
        }
         break;
       

      case 'ArrowUp':
        if(this.enableInlineEditing == false){
          event.preventDefault();
          if (this.currentRowIndex > 0) {
            this.currentRowIndex--;
            this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }          
        }
        break;

      case 'ArrowRight':
        
        if(cursorPosition == targetlength){
          event.preventDefault();
          if (this.currentColIndex < this.tablecolumns.length - 1) {
            this.currentColIndex++;
            this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
          }        
          this.handleKeysForInlineEditingAcc();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        }
        break;

      case 'ArrowLeft':
        if(cursorPosition == 0){
          event.preventDefault();
          if (this.currentColIndex > 0) {
            this.currentColIndex--;
            this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;          
            this.handleKeysForInlineEditingAcc();
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }
        }
        break;

      // case 'Delete':
      //   if(!this.enableInlineEditing){
      //     event.preventDefault();
      //     //call delete function to delete current row.
      //     this.deleteItemGrid(this.currentRowIndex);
      //   }
      // break;     

      case 'Enter':
        event.preventDefault(); 
        
        this.enableInlineEditing = false; 
        if (this.currentColIndex < this.tablecolumns.length - 1) {
          this.currentColIndex++;
          this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
          this.enableInlineEditing = false;
          this.handleKeysForInlineEditingAcc();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);          

        } else {
          if (this.currentRowIndex < this.modifiedArray.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            // focusCell(this.currentRowIndex, this.currentColIndex);
          } else {
            this.onClickAddItem();
            this.enableInlineEditing = false;
          } 
          this.handleKeysForInlineEditingAcc();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        } 
          break;
      case 'Tab':
          event.preventDefault();         
          this.enableInlineEditing = false; 
          this.currentRowIndex = -1;
          this.currentColIndex = -1;
          this.movefocusToOkButton();
          // if (this.currentRowIndex < this.modifiedArray.length - 1) {
          //   this.currentRowIndex++;
          //   this.currentColIndex = 0;
          //   this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
          //   this.enableInlineEditing = false;
          //   this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          // } else{
          //   this.onClickAddItem();
          //   this.enableInlineEditing = false;
          // }   

        break;
      

      default:           
          // Handle other keys for inline editing
          const cellId = `accountcell-${this.currentRowIndex}-${this.currentColIndex}`;//(event.target as HTMLElement).id;
          const cellElement = document.getElementById(cellId);
          if (cellElement) {
            const columnName = cellElement.getAttribute('data-column-name');
            const columnKeyName = cellElement.getAttribute('data-column-key-name');
            if(columnName != null){
              this.currentColumname = columnName;
            }
            if(this.enableInlineEditing == false && (columnName != 'accountname' && columnName != 'id' )){
              this.enableInlineEditing = true;
              setTimeout(() => {
                const cellElement = document.getElementById(cellId);
                let newValue = event.key;
                // Check if the key is a character key
                const isCharacterKey = event.key.length === 1;
                if ((cellElement instanceof HTMLInputElement || cellElement instanceof HTMLTextAreaElement) && isCharacterKey) {
                  // If it's an input or textarea, set the value
                  cellElement.value = newValue;
                  if (columnKeyName !== null && columnKeyName !== undefined) {
                    // if(columnName == 'unit'){
                    //   this.modifiedArray[this.currentRowIndex][columnKeyName]['unit'] = event.key;
                    // } else if(columnName == 'pricecategory'){
                    //   this.modifiedArray[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    // } else if(columnName == 'sizemasterid'){
                    //   this.modifiedArray[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    // } else{

                      let tempRow = { ...this.modifiedArray[this.currentRowIndex] };
                      tempRow[columnKeyName] = event.key;
                      this.modifiedArray[this.currentRowIndex] = tempRow;
                      this.setFocusToInput(cellId);
                    // }    
                   

                  }
                  this.modifiedArray = [...this.modifiedArray];
                } 
              }, 0);
              
            }  
          }  
        break;
    }
    return true;
  }

  movefocusToOkButton(){
    if (this.okButton) {
      this.okButton.nativeElement.focus();
    }
  }

  setFocusToInput(inputId: string): void {
    const inputElement = this.elementRef.nativeElement.querySelector(`#${inputId}`);
    if (inputElement) {
      inputElement.focus();
    }
  }

  handleOkbuttonkeydown(event: KeyboardEvent) {
    // Check if the Enter key is pressed and the focus is on the OK button
    if (event.key === 'Enter' && document.activeElement === this.okButton.nativeElement) {
      this.save();
    } else if (event.key == 'ArrowRight'){
      if (this.cancelbutton) {
        this.cancelbutton.nativeElement.focus();
      }
    }
  }

  handleCancelbuttonkeydown(event: KeyboardEvent) {
    // Check if the Enter key is pressed and the focus is on the OK button
    if (event.key === 'Enter' && document.activeElement === this.cancelbutton.nativeElement) {
      this.cancelItems();
    } else if (event.key == 'ArrowLeft'){
      if (this.okButton) {
        this.okButton.nativeElement.focus();
      }
    }
  }

  scrollToCellAcc(rowIndex: number, colIndex: number): void {
    const cellId = `accountcell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
  }

  handleDoubleClick(event:any){
    if(this.currentColumname != 'accountname' && this.currentColumname != 'id'){
      this.enableInlineEditing  = true;
    }    
  }

  onColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.gridnavigationService.moveToNextRow(this.modifiedArray, this.focusGridCell.bind(this));
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.gridnavigationService.moveToPreviousRow(this.focusGridCell.bind(this));
        break;

      case 'ArrowRight':
        event.preventDefault();
        this.gridnavigationService.moveToNextColumn(this.tablecolumns, this.focusGridCell.bind(this));
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.gridnavigationService.moveToPreviousColumn(this.focusGridCell.bind(this));
        break;

      case 'Enter':
      case 'Tab':
        event.preventDefault();
        this.gridnavigationService.handleNavigationKey(this.tablecolumns, this.modifiedArray, this.focusGridCell.bind(this), this.onClickAddItem.bind(this));
        break;
    }
  }

  onClickInput(event:any, rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditingAcc();

    setTimeout(() => {
        this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }

}
