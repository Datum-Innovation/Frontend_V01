import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { PurchaseService } from '../../../services/purchase.service';
import { BaseService, EndpointConstant, GridNavigationService } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { SelectionType } from '@swimlane/ngx-datatable';

@Component({
  selector: 'dfinance-frontend-item-price-popup',
  templateUrl: './item-price-popup.component.html',
  styleUrls: ['./item-price-popup.component.css'],
})
export class ItemPricePopupComponent {
  destroySubscription: Subject<void> = new Subject<void>();
  @Input() itemUnitData:any = [];
  @Input() itemID:any = 0;
  showPopup = true;
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  itemDetails:any = []; 
  @Output() close = new EventEmitter<any[]>();
  @Output() changeExpiry = new EventEmitter<string>();
  @ViewChild('okbutton') okButton!: ElementRef;
  @ViewChild('cancelbutton') cancelbutton!: ElementRef;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  selected: any = [];
  SelectionType = SelectionType;
  changesMade = false;
  tablecolumns = [
    { name: 'ID', field: 'id'},
    { name: 'Unit', field: 'unit' },
    { name: 'Purchase Rate', field: 'purchaserate' },
    { name: 'Selling Price', field: 'sellingprice' },
    { name: 'MRP', field: 'mrp' },
    { name: 'BranchID', field: 'branchid' }
  ];
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname:any = "";
  enableInlineEditing:boolean = false;
  constructor(
    private datePipe: DatePipe,
    private PurchaseService: PurchaseService,    
    private gridnavigationService: GridNavigationService,    
    private elementRef: ElementRef,
    private baseService:BaseService
  ) {
  }

  ngOnInit() {  
  }

  save(){
    let payload:any = [];

    this.itemUnitData.forEach((unit:any) => {
      let unitObj = {
        "unitID": unit.id,
        "unit": {
          "unit": unit.unit,
          "basicUnit": unit.basicUnit,
          "factor": unit.factor
        },
        "basicUnit": unit.basicUnit,
        "factor": unit.factor,
        "purchaseRate": unit.purchaseRate,
        "sellingPrice": unit.sellingPrice,
        "mrp": unit.mrp,
        "wholeSalePrice": unit.wholeSalePrice ?? 0,
        "retailPrice": unit.retailPrice ?? 0,
        "wholeSalePrice2": 0,
        "retailPrice2": 0,
        "lowestRate": unit.lowestRate,
        "barCode": unit.barcode,
        "active": unit.active,
        "status": 0
      }
      payload.push(unitObj);
    });
    
    this.PurchaseService.updateDetails(EndpointConstant.UPDATEITEMUNIT + this.itemID,payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.showPopup = false;
          this.close.emit(this.itemUnitData);  
        },
        error: (error) => {
          this.baseService.showCustomDialogue('Please try again');
        },
      });



  }
  cancelItems(){
    this.showPopup = false;
    this.close.emit([]);    
    return true;
  }
  onChangeField(event:any,rowIndex:any, fieldname:string){
    let changedValue = event.target.value;
    this.itemUnitData[rowIndex][fieldname] = changedValue;
    this.itemUnitData = [...this.itemUnitData];
  }
  onSelect(selected: any) {
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
          if (this.currentRowIndex < this.itemUnitData.length - 1) {
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
          if (this.currentRowIndex < this.itemUnitData.length - 1) {
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
          event.preventDefault();         
          this.enableInlineEditing = false; 
          this.currentRowIndex = -1;
          this.currentColIndex = -1;
          this.movefocusToOkButton();
          // if (this.currentRowIndex < this.itemUnitData.length - 1) {
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
            if(this.enableInlineEditing == false && (columnName != 'unit' && columnName != 'id' )){
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
                    //   this.itemUnitData[this.currentRowIndex][columnKeyName]['unit'] = event.key;
                    // } else if(columnName == 'pricecategory'){
                    //   this.itemUnitData[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    // } else if(columnName == 'sizemasterid'){
                    //   this.itemUnitData[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    // } else{

                      let tempRow = { ...this.itemUnitData[this.currentRowIndex] };
                      tempRow[columnKeyName] = event.key;
                      this.itemUnitData[this.currentRowIndex] = tempRow;
                      this.setFocusToInput(cellId);
                    // }    
                   

                  }
                  this.itemUnitData = [...this.itemUnitData];
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
    if(this.currentColumname != 'unit' && this.currentColumname != 'id'){
      this.enableInlineEditing  = true;
    }    
  }

  onColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.gridnavigationService.moveToNextRow(this.itemUnitData, this.focusGridCell.bind(this));
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
      //   this.gridnavigationService.handleNavigationKey(this.tablecolumns, this.itemUnitData, this.focusGridCell.bind(this), this.onClickAddItem.bind(this));
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
