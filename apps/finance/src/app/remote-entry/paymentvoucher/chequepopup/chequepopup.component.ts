//import { DecimalPipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { GridNavigationService } from '@dfinance-frontend/shared';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'dfinance-frontend-chequepopup',
  templateUrl: './chequepopup.component.html',
  styleUrls: ['./chequepopup.component.css'],
})
export class ChequepopupComponent {
  showPopup = true;  
  @Input() accountData: any[] = [];
  @Input() accountGridDetails:any = []; 
  @Input() popupType:string = "";
  @Input() bankpopupData: any[] = [];
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

  bankreturnField = 'accountcode';
  banknameKeys = ['Account Code','Account Name','ID'];
 
  tablecolumns = [
    { name: 'ID', field: 'id'},
    { name: 'PDCPayable', field: 'pdcpayable' },
    { name: 'ChequeNo', field: 'chequeno' },
    { name: 'ChequeDate', field: 'chequedate' },
    { name: 'Bank name', field: 'bankname' },
    { name: 'Clearing Days', field: 'clearingdays' },
    { name: 'Description', field: 'description' },
    { name: 'Amount', field: 'amount' }
  ];
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname:any = "";

  enableInlineEditing:boolean = false;
  constructor(
    
    private gridnavigationService: GridNavigationService,
    private elementRef: ElementRef
  ) {
    this.formattedAmount = this.formatAmount(this.totalAmountInGrid);
  }

  ngOnInit(): void {
    this.modifiedArray = JSON.parse(JSON.stringify(this.accountGridDetails));
 
    this.onClickAddItem();
    this.calculateTotal();    
  }

  save(){
    this.showPopup = false;   
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
    
   
    if( this.modifiedArray.length == 0 || Object.keys(this.modifiedArray[rowIndex]['pdcPayable']).length > 0){
      //this.modifiedArray.push(this.chequeObject); 
      this.modifiedArray.push({
        pdcPayable: {},
        veid: 0,
        cardType: "",
        commission: 0,
        chequeNo: "",
        chequeDate: null,
        clrDays: 0,
        bankID: 0,
        bankName: {},
        status: "",
        partyID: 0,
        description: "",
        amount: 0
      })
    
      this.currentItemTableIndex = this.modifiedArray.length - 1;
      this.modifiedArray = [...this.modifiedArray];
      if(!accountcodesel){               
        this.currentRowIndex = this.modifiedArray.length - 1;
        this.currentColIndex = 0; 
        this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
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
        this.modifiedArray[rowIndex]['pdcPayable']  = {
          "alias":item.accountcode,
          "name": item.accountname,
          "id": item.id
        };
      }
    });    
    console.log("On cheque popup selected:"+JSON.stringify(this.modifiedArray,null,2))
    this.onClickAddItem(true);
   
    const ChequeNoIndex = this.tablecolumns.findIndex(column => column.name === 'ChequeNo');
    this.currentColIndex = ChequeNoIndex - 1;
    this.gridnavigationService.focusCell(this.gridCells.toArray(),this.currentRowIndex, this.currentColIndex);   
    this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex); 

  }  

  onChangeChequeNo(event:any,rowIndex:string){
    this.changesMade = true; 
    this.modifiedArray[rowIndex]['chequeNo'] = event.target.value;
  }

  onChangeChequeDate(event:any,rowIndex:string){
    this.changesMade = true; 
    let selectedDate = event.target.value;
    this.modifiedArray[rowIndex]['chequeDate'] = selectedDate ? this.convertDate(selectedDate) : null;
  }  

  onChangeClearingDays(event:any,rowIndex:string){
    this.changesMade = true; 
    this.modifiedArray[rowIndex]['clrDays'] = event.target.value;
  }

  onChangeAmount(event:any,rowIndex:string){
    this.changesMade = true; 
    this.modifiedArray[rowIndex]['amount'] = event.target.value;
    this.calculateTotal();
  }

  onChangeDescription(event:any,rowIndex:string){
    this.changesMade = true; 
    this.modifiedArray[rowIndex]['description'] = event.target.value;
  }

  calculateTotal(){
    let totalAmount = 0;
   
    this.modifiedArray.map((item: any) => {
      totalAmount += Number(item.amount);
    });
    this.totalAmountInGrid = totalAmount;
    this.balanceAmount = -this.totalAmountInGrid;
    
    this.formattedAmount = this.formatAmount(this.totalAmountInGrid);
  }

  formatAmount(amount: number): string {
    // const formattedAmount = this.decimalPipe.transform(amount, '1.4-4');
    // return formattedAmount ? formattedAmount : '0.0000';
    const formattedAmount='0.0000';
    return formattedAmount;
    
  }
  
  onSelect(selected: any) {
  }

  onBankNameSelected(option:any,rowIndex:string){
    this.changesMade = true;
    this.bankpopupData.map((item: any) => {
      if (item.accountcode === option) {
        this.modifiedArray[rowIndex]['bankName']  = {
          "alias":item.accountcode,
          "name": item.accountname,
          "id": item.id
        };
        this.modifiedArray[rowIndex]['bankID'] = item.id;
      }
    });
  }

  convertDate(inputDate:any) {   
    const [month, day, year] = inputDate.split('/');   
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));   
    date.setUTCHours(8, 21, 47, 960);    
    
    const isoDate = date.toISOString();
    
    return isoDate;
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
