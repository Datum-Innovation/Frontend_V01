import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { GridNavigationService } from '@dfinance-frontend/shared';

@Component({
  selector: 'dfinance-frontend-item-details-popup',
  templateUrl: './item-details-popup.component.html',
  styleUrls: ['./item-details-popup.component.css'],
})
export class ItemDetailsPopupComponent {  
  @Input() expireItemDetails:any = [];
  showPopup = true;
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  itemDetails:any = []; 
  @Output() close = new EventEmitter<any[]>();
  @ViewChild('okbutton') okButton!: ElementRef;
  @ViewChild('cancelbutton') cancelbutton!: ElementRef;
  @Output() changeExpiry = new EventEmitter<string>();
  

  changesMade = false;

  tablecolumns = [
    { name: 'ID', field: 'id'},
    { name: 'ItemCode', field: 'itemcode' },
    { name: 'ItemName', field: 'itemname' },
    { name: 'ManufactureDate', field: 'manufacturedate' },
    { name: 'ExpiryDate', field: 'expirydate' }
  ];
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname:any = "";
  enableInlineEditing:boolean = false;

  constructor(
    private datePipe: DatePipe,
    private gridnavigationService: GridNavigationService,
    private elementRef: ElementRef
  ) {
  }

  ngOnInit() {    
    this.currentRowIndex = this.expireItemDetails.length - 1;
    this.currentColIndex = 0;
  }

  save(){
    this.showPopup = false;
    this.close.emit(this.expireItemDetails);    
  }
  cancelItems(){
    this.showPopup = false;
    if(this.changesMade == true){
      if(confirm('Do you want to save data edited?')){
        this.close.emit(this.expireItemDetails);    
        return true;
      } else{
        this.close.emit([]); 
      }
    }
    this.close.emit([]);    
    return true;
  }

  onChangeManufactureDate(event:any,rowIndex:any){
    let manufactureinput = event.target.value;
    this.manageChangeManufactureDate(manufactureinput,rowIndex);    
  }

  manageChangeManufactureDate(manufactureinput:any,rowIndex:any){
    this.changesMade = true;
    this.expireItemDetails[rowIndex]['manufactureDate'] = new Date(manufactureinput);
    const [day, month, year] = manufactureinput.split('/').map((part: any) => parseInt(part, 10));
    let manufactureDate = new Date(year, month - 1, day);
    let expiryPeriod = this.expireItemDetails[rowIndex]['expiryPeriod'];
    if(this.expireItemDetails[rowIndex]['expiryDate'] != null){
      if(confirm('Do you want to replace expiry date with default value?')){
        //update expiry date
        const result = new Date(manufactureDate);
        let addedDate = result.setDate(result.getDate() + expiryPeriod);
        this.expireItemDetails[rowIndex]['expiryDate'] = new Date(addedDate);
        this.changeExpiry.emit(this.expireItemDetails[rowIndex]);
      }
    } else{
      //update expiry date..
      const result = new Date(manufactureDate);
      let addedDate = result.setDate(result.getDate() + expiryPeriod);
      this.expireItemDetails[rowIndex]['expiryDate'] = new Date(addedDate);
      this.changeExpiry.emit(this.expireItemDetails[rowIndex]);
    }
  }

  onChangeExpireDate(event:any,rowIndex:any){
    let expireDate = event.target.value;
    this.manageExpiryDateChange(expireDate,rowIndex);    
  }
  
  manageExpiryDateChange(expireDate:any,rowIndex:any){
    this.changesMade = true;
    this.expireItemDetails[rowIndex]['expiryDate'] = expireDate;
    this.changeExpiry.emit(this.expireItemDetails[rowIndex]);
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
          if (this.currentRowIndex < this.expireItemDetails.length - 1) {
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
          //check column and their function while editing ...
          this.checkCoulmnFunction();          

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

      case 'Enter':
        event.preventDefault(); 
        this.checkCoulmnFunction();
        this.enableInlineEditing = false; 
        if (this.currentColIndex < this.tablecolumns.length - 1) {
          this.currentColIndex++;
          this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
          this.enableInlineEditing = false;
          this.handleKeysForInlineEditingAcc();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);          

        } else {
          if (this.currentRowIndex < this.expireItemDetails.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCellAcc(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            // focusCell(this.currentRowIndex, this.currentColIndex);
          } else {
            // this.onClickAddItem();
            this.enableInlineEditing = false;
          } 
          this.handleKeysForInlineEditingAcc();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        } 
          break;
      case 'Tab':
          this.checkCoulmnFunction();
          event.preventDefault();         
          this.enableInlineEditing = false; 
          this.currentRowIndex = -1;
          this.currentColIndex = -1;
          this.movefocusToOkButton();
          // if (this.currentRowIndex < this.expireItemDetails.length - 1) {
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
            if(this.enableInlineEditing == false && (columnName != 'itemname' && columnName != 'itemcode' && columnName != 'id' )){
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
                    //   this.expireItemDetails[this.currentRowIndex][columnKeyName]['unit'] = event.key;
                    // } else if(columnName == 'pricecategory'){
                    //   this.expireItemDetails[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    // } else if(columnName == 'sizemasterid'){
                    //   this.expireItemDetails[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    // } else{

                      let tempRow = { ...this.expireItemDetails[this.currentRowIndex] };
                      tempRow[columnKeyName] = event.key;
                      this.expireItemDetails[this.currentRowIndex] = tempRow;
                      this.setFocusToInput(cellId);
                    // }    
                   

                  }
                  this.expireItemDetails = [...this.expireItemDetails];
                } 
              }, 0);
              
            }  
          }  
        break;
    }
    return true;
  }

  checkCoulmnFunction(){
    //manage if column is manufacture date ...
    if(this.currentColumname == 'manufacturedate' && this.enableInlineEditing == true){
      const cellId = `accountcell-${this.currentRowIndex}-${this.currentColIndex}`;
      const cellElement = document.getElementById(cellId) as HTMLInputElement;
      if (cellElement) {
        const cellValue = cellElement.value;
        this.manageChangeManufactureDate(cellValue,this.currentRowIndex);    
      }            
    }

    //manage if column is expiry date ...
    if(this.currentColumname == 'expirydate' && this.enableInlineEditing == true){
      const cellId = `accountcell-${this.currentRowIndex}-${this.currentColIndex}`;
      const cellElement = document.getElementById(cellId) as HTMLInputElement; 
      if (cellElement) {
        const cellValue = cellElement.value; 
        this.manageExpiryDateChange(cellValue,this.currentRowIndex);    
      }            
    }
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
    if(this.currentColumname != 'itemcode' && this.currentColumname != 'itemname' && this.currentColumname != 'id'){
      this.enableInlineEditing  = true;
    }    
  }

  onColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.gridnavigationService.moveToNextRow(this.expireItemDetails, this.focusGridCell.bind(this));
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
      // case 'Tab':
      //   event.preventDefault();
      //   this.gridnavigationService.handleNavigationKey(this.tablecolumns, this.expireItemDetails, this.focusGridCell.bind(this), this.onClickAddItem.bind(this));
      //   break;
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
