import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { GridNavigationService } from '@dfinance-frontend/shared';

@Component({
  selector: 'dfinance-frontend-journal-advance-popup',
  templateUrl: './journal-advance-popup.component.html',
  styleUrls: ['./journal-advance-popup.component.css'],
})
export class JournalAdvancePopupComponent {

  @Input() advanceData: any = [];
  @Input() payAmount: any = 0.00;
  showPopup = true;
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  itemDetails: any = [];
  @Output() close = new EventEmitter<any[]>();
  @Output() changeExpiry = new EventEmitter<string>();
  @ViewChild('okbutton') okButton!: ElementRef;
  @ViewChild('cancelbutton') cancelbutton!: ElementRef;
  totalInvoiceAmount: number = 0.0000;
  allocatedAmount: number = 0.0000;
  balanceAmount: number = 0.0000;
  totalAmount = 0;

  changesMade = false;
  selectedAdvanceData: any = [];
  tempBalance = this.payAmount;


  tablecolumns = [
    { name: 'ID', field: 'id' },
    { name: 'Selection', field: 'selection' },
    { name: 'InvoiceNo', field: 'invoiceno' },
    { name: 'InvoiceDate', field: 'invoicedate' },
  //  { name: 'PartyInvNo', field: 'partyinvno' },
  //  { name: 'PartyInvDate', field: 'partyinvdate' },
   // { name: 'Description', field: 'description' },
   // { name: 'Account', field: 'account' },
    { name: 'InvoiceAmount', field: 'invoiceamount' },
    { name: 'Allocated', field: 'allocated' },
    { name: 'Amount', field: 'amount' },
    { name: 'Balance', field: 'balance' }
  ];
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname: any = "";
  enableInlineEditing: boolean = false;

  selectedAccountAdvances: any[] = [];


  constructor(private datePipe: DatePipe,
    private gridnavigationService: GridNavigationService,
    private elementRef: ElementRef
  ) {

  }

  ngOnInit() {
    if (this.advanceData.length > 0) {
      console.log(JSON.stringify(this.advanceData, null, 2));
      this.currentRowIndex = 0;
      this.currentColIndex = 0;
      //this.storeAdvanceData();
      this.calculateFooterValues();
    }
  }



  save() {
   // console.log("Total amount sum :"+)
    this.showPopup = false;
    this.selectedAdvanceData = this.selectedAdvanceData.filter((item: any) => item.vid && item.vid != 0)
    console.log("Selected Allocation:")
    console.log(JSON.stringify(this.selectedAdvanceData, null, 2));

    // console.log("Allocation data:")
    // console.log(JSON.stringify(this.advanceData, null, 2))

    let response: any = {
      "allocatedAmount": this.allocatedAmount,
      "advanceData": this.advanceData,
      "selectedAdvanceData": this.selectedAdvanceData.filter((item: any) => item.vid && item.vid != 0)

    }
    this.close.emit(response);
  }

  onChangePartyInvDate(event: any, rowIndex: any) {
    let partyInvDate = event.target.value;
    this.managePartyInvDateChange(partyInvDate, rowIndex);
  }

  managePartyInvDateChange(partyInvDate: any, rowIndex: any) {
    this.changesMade = true;
    this.advanceData[rowIndex]['partyInvDate'] = partyInvDate ? this.convertDate(partyInvDate) : null;
    this.advanceData = [...this.advanceData];
  }

  onChangePartyInvNo(event: any, rowIndex: any) {
    let partyInvNo = event.target.value;
    this.managePartyInvNoChange(partyInvNo, rowIndex);
  }

  managePartyInvNoChange(partyInvNo: any, rowIndex: any) {
    this.changesMade = true;
    this.advanceData[rowIndex]['partyInvNo'] = partyInvNo;
    this.advanceData = [...this.advanceData];
  }

  advBalance = 0;
  // tempBal=0;
  tempArray: any[][] = [];

  onChangeAmount(event: any, rowIndex: any) {
    // alert("Edit amount")
    let amount = event.target.value;
    this.advanceData[rowIndex]['amount'] = amount
    console.log("Edited amount:" + amount)
    let tempBal = this.advanceData[rowIndex]['billAmount'] - this.advanceData[rowIndex]['allocated']
    console.log("Balance:" + tempBal)
    if (amount > tempBal) {
      alert("Amount is must be below " + tempBal + "Update the amount")
    }
    else {
      let rowToRemove = this.advanceData[rowIndex];
      console.log("Row to remove:" + JSON.stringify(rowToRemove, null, 2))
      this.tempArray = this.tempArray.filter((advance: any) => advance !== rowToRemove);

      this.tempArray[rowIndex] = this.advanceData[rowIndex];
      this.selectedAdvanceData = this.tempArray
      console.log("After amout edit temp array:" + JSON.stringify(this.tempArray, null, 2))
      console.log("After amout edit selectedAdvanceData:" + JSON.stringify(this.selectedAdvanceData, null, 2))
    }
    this.calculateFooterValues();

  }

  // onChangeSelection(event: any, rowIndex: any) {
  //   //console.log("Bal:"+tempBal)
  //   let input = event.target as HTMLInputElement;
  //   this.advanceData[rowIndex]['selection'] = input.checked;
  //   if (input.checked == true) {
  //     let amountSum = 0;
  //     amountSum = this.advanceData.reduce((sum: number, item: any) => {
  //       return sum + (item.amount || 0);
  //     }, 0);
  //     console.log("Invoice-allocated=" + amountSum)
  //     let bal = this.payAmount - amountSum;
  //     let tempBal = 0;
  //     if(this.payAmount==0){
  //      tempBal=this.advanceData[rowIndex]['billAmount'] - this.advanceData[rowIndex]['allocated']
  //       this.advanceData[rowIndex]['amount'] = tempBal;
  //       console.log("AmountSum:"+amountSum)
  //       this.advanceData[rowIndex]['amount'] = this.payAmount
         
  //     }
  //     if (bal > 0) {
  //       tempBal = this.advanceData[rowIndex]['billAmount'] - this.advanceData[rowIndex]['allocated']
  //       if (this.payAmount > tempBal && bal > tempBal) {
  //         this.advanceData[rowIndex]['amount'] = tempBal;
  //       }
  //       else {
  //         this.advanceData[rowIndex]['amount'] = bal;
  //       }

  //       this.tempArray[rowIndex] = this.advanceData[rowIndex];
  //     }
  //     // else if(bal==0){
  //     //   tempBal=this.advanceData[rowIndex]['billAmount'] - this.advanceData[rowIndex]['allocated']
  //     //   this.advanceData[rowIndex]['amount'] = tempBal;
  //     // }
  //     // else if (bal < 0) {
  //     //   alert("Amount:"+bal)
  //     //   alert("Not possible")
  //     // }
      
  //     //this.tempArray[rowIndex] = this.advanceData[rowIndex];
  //   }
  //   else {
  //     this.advanceData[rowIndex]['amount'] = 0.00;
  //     let vidToRemove = this.advanceData[rowIndex]['vid'];
  //     this.tempArray = this.tempArray.filter((advance: any) => advance.vid !== vidToRemove);

  //   }
  //   this.calculateFooterValues();
  //   console.log("Temp array:" + JSON.stringify(this.tempArray, null, 2))
  //   this.selectedAdvanceData = this.tempArray
  //   console.log("selectedAdvanceData:" + JSON.stringify(this.selectedAdvanceData, null, 2))
  // }

  onChangeSelection(event: any, rowIndex: any) {
    //console.log("Bal:"+tempBal)
    let input = event.target as HTMLInputElement;
    this.advanceData[rowIndex]['selection'] = input.checked;
    if (input.checked == true) {
      let amountSum = 0;
      amountSum = this.advanceData.reduce((sum: number, item: any) => {
        return sum + (item.amount || 0);
      }, 0);
      console.log("Invoice-allocated=" + amountSum)
      let bal = this.payAmount - amountSum;
      let tempBal = 0;
      console.log("Pay amount:"+this.payAmount)
      if(this.payAmount==0 || this.payAmount==null){
       tempBal=this.advanceData[rowIndex]['billAmount'] - this.advanceData[rowIndex]['allocated']
        this.advanceData[rowIndex]['amount'] = tempBal;
        console.log("AmountSum:"+amountSum)
        this.tempArray[rowIndex] = this.advanceData[rowIndex];
        //this.advanceData[rowIndex]['amount'] = this.payAmount
         
      }
      if (bal > 0) {
        tempBal = this.advanceData[rowIndex]['billAmount'] - this.advanceData[rowIndex]['allocated']
        if (this.payAmount > tempBal && bal > tempBal) {
          this.advanceData[rowIndex]['amount'] = tempBal;
        }
        else {
          this.advanceData[rowIndex]['amount'] = bal;
        }

        this.tempArray[rowIndex] = this.advanceData[rowIndex];
     }
     
      
    }
    else {
      this.advanceData[rowIndex]['amount'] = 0.00;
      let vidToRemove = this.advanceData[rowIndex]['vid'];
      this.tempArray = this.tempArray.filter((advance: any) => advance.vid !== vidToRemove);

    }
    this.calculateFooterValues();
    console.log("Temp array:" + JSON.stringify(this.tempArray, null, 2))
    this.selectedAdvanceData = this.tempArray
    console.log("selectedAdvanceData:" + JSON.stringify(this.selectedAdvanceData, null, 2))
  }

  onClickSelectAll(event: any) {
    let input = event.target as HTMLInputElement;
    //this.advanceData[rowIndex]['selection'] = input.checked;
    if (input.checked == true) {
      if (confirm('Are you sure?')) {
        let input = event.target as HTMLInputElement;
        let checked = input.checked;
        //console.log("Amount:"+balanceamount)
        console.log("Advance Data:" + JSON.stringify(this.advanceData, null, 2))
        let rowIndex = 0;

        this.advanceData.forEach((advance: any) => {

          let amountSum = 0;
          amountSum = this.advanceData.reduce((sum: number, item: any) => {
            return sum + (item.amount || 0);
          }, 0);
          console.log("Invoice-allocated=" + amountSum)
          let bal = this.payAmount - amountSum;
          let tempBal = 0;
          if (bal > 0) {
            tempBal = this.advanceData[rowIndex]['billAmount'] - this.advanceData[rowIndex]['allocated']
            if (this.payAmount > tempBal && bal > tempBal) {
              this.advanceData[rowIndex]['amount'] = tempBal;
            }
            else {
              this.advanceData[rowIndex]['amount'] = bal;
            }
            this.tempArray[rowIndex] = this.advanceData[rowIndex];
            this.selectedAdvanceData = this.tempArray
            advance.selection = checked;
          }

          rowIndex++;

        });
        this.calculateFooterValues();
      }
    }
    else {
      if (confirm('Are you sure?')) {
        let rowIndex = 0;
        this.advanceData.forEach((advance: any) => {

          let input = event.target as HTMLInputElement;
          let checked = input.checked;
          this.advanceData[rowIndex]['amount'] = 0.00;
          let vidToRemove = this.advanceData[rowIndex]['vid'];
          this.tempArray = this.tempArray.filter((advance: any) => advance.vid !== vidToRemove);
          this.selectedAdvanceData = this.tempArray
          advance.selection = checked;
          rowIndex++;
        });
        
      }
    }

  }

  // onChangeSelect(event: any, rowIndex: any) {

  //   this.tempArray.push(this.advanceData[rowIndex]); // Adds advanceData[rowIndex] as a new array

  //   //console.log("Temp Array:"+JSON.stringify(this.tempArray,null,2))
  //   let sum = 0;

  //   this.tempArray.forEach(element => {

  //     //sum += element.amount;

  //   });

  //   let bal = this.payAmount - sum;
  //   if (bal == 0) {

  //   } if (bal < 0) {

  //   }

  //   //this.tempArr[200] =  this.advanceData[rowIndex]; 




  //   let input = event.target as HTMLInputElement;
  //   this.advanceData[rowIndex]['selection'] = input.checked;

  //   if (input.checked == true) {

  //     //calculate the total of amounts
  //     this.totalAmount = this.advanceData.reduce((sum: number, item: any) => {
  //       return sum + (item.amount || 0);
  //     }, 0);

  //     console.log("Total sum:" + this.totalAmount)
  //     if (this.totalAmount < this.payAmount) {

  //       this.advBalance = this.advanceData[rowIndex]['billAmount'] - this.advanceData[rowIndex]['allocated']
  //       if (this.payAmount > this.advBalance) {
  //         this.advanceData[rowIndex]['amount'] = this.advBalance;
  //         // this.totalAmount+=this.advanceData[rowIndex]['amount'] ;
  //         // this.tempBalance=this.payAmount=this.totalAmount;
  //         this.tempBalance = this.payAmount - this.advanceData[rowIndex]['amount']
  //         console.log("Balance:" + this.tempBalance)
  //       } else {
  //         this.advanceData[rowIndex]['amount'] = this.payAmount;
  //       }
  //       this.selectedAdvanceData.push(this.advanceData[rowIndex]);
  //     }
  //   }
  //   else {
  //     this.advanceData[rowIndex]['amount'] = 0.00;
  //     let vidToRemove = this.advanceData[rowIndex]['vid'];

  //     this.selectedAdvanceData = this.selectedAdvanceData.filter((advance: any) => advance.vid !== vidToRemove);

  //   }
  //   this.advanceData = [...this.advanceData];
  //   this.calculateFooterValues();
  // }



  manageAmountChange(amount: any, rowIndex: any) {
    this.changesMade = true;
    this.advanceData[rowIndex]['amount'] = parseFloat(amount);
    this.advanceData = [...this.advanceData];
    this.calculateFooterValues();
  }

  calculateFooterValues() {
    this.totalInvoiceAmount = 0.0000;
    this.allocatedAmount = 0.0000;
    this.advanceData.forEach((advance: any) => {
      this.totalInvoiceAmount = this.totalInvoiceAmount + Number(advance.billAmount);
      this.allocatedAmount = this.allocatedAmount + Number(advance.amount);
    });
    this.balanceAmount = this.payAmount - this.allocatedAmount;
  }

  // onClickSelectAll(event: Event) {
  //   if (confirm('Are you sure?')) {
  //     let input = event.target as HTMLInputElement;
  //     let checked = input.checked;
  //     let balanceamount = this.payAmount;
  //     this.advanceData.forEach((advance: any) => {
  //       advance.selection = checked;
  //       let amount = 0;
  //       if (balanceamount > 0) {
  //         if (checked == true) {
  //           if (balanceamount > advance.billAmount) {
  //             amount = advance.billAmount;
  //             advance.amount = amount;
  //           } else {
  //             amount = balanceamount;
  //             advance.amount = amount;
  //           }
  //           balanceamount = balanceamount - amount;
  //         } else {
  //           advance.amount = 0.0000;
  //         }
  //       }

  //     });
  //     this.calculateFooterValues();
  //   }
  // }



  convertDate(inputDate: any) {
    // Parse the input date (MM/DD/YYYY)
    const [month, day, year] = inputDate.split('/');

    // Create a new Date object (adjusting for 0-based month)
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));

    // Set the time to 08:21:47.960 UTC
    date.setUTCHours(8, 21, 47, 960);

    // Convert the date to ISO 8601 format
    const isoDate = date.toISOString();

    return isoDate;
  }


  closePopup() {
    this.close.emit([]);
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
  }

  onClickSpan(event: any, rowIndex: number, colIndex: number): void {
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

  handleKeysForInlineEditingAcc() {
    // Handle other keys for inline editing
    const cellid = "accountcell-" + this.currentRowIndex + "-" + this.currentColIndex;
    const cellelement = document.getElementById(cellid);
    if (cellelement) {
      const columnName = cellelement.getAttribute('data-column-name');
      if (columnName != null) {
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
      if (targetElement.selectionStart != null) {
        cursorPosition = targetElement.selectionStart;
      }
      targetlength = targetElement.value.length;
    }
    switch (event.key) {
      case 'ArrowDown':
        if (this.enableInlineEditing == false) {
          event.preventDefault();
          if (this.currentRowIndex < this.advanceData.length - 1) {
            this.currentRowIndex++;
            this.scrollToCellAcc(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }
        }
        break;


      case 'ArrowUp':
        if (this.enableInlineEditing == false) {
          event.preventDefault();
          if (this.currentRowIndex > 0) {
            this.currentRowIndex--;
            this.scrollToCellAcc(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }
        }
        break;

      case 'ArrowRight':
        if (cursorPosition == targetlength) {
          event.preventDefault();
          //check column and their function while editing ...
          this.checkCoulmnFunction();

          if (this.currentColIndex < this.tablecolumns.length - 1) {
            this.currentColIndex++;
            this.scrollToCellAcc(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
          }
          this.handleKeysForInlineEditingAcc();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        }
        break;

      case 'ArrowLeft':
        if (cursorPosition == 0) {
          event.preventDefault();
          if (this.currentColIndex > 0) {
            this.currentColIndex--;
            this.scrollToCellAcc(this.currentRowIndex, this.currentColIndex);
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
          this.scrollToCellAcc(this.currentRowIndex, this.currentColIndex);
          this.enableInlineEditing = false;
          this.handleKeysForInlineEditingAcc();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);

        } else {
          if (this.currentRowIndex < this.advanceData.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCellAcc(this.currentRowIndex, this.currentColIndex);
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
        // if (this.currentRowIndex < this.advanceData.length - 1) {
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
          if (columnName != null) {
            this.currentColumname = columnName;
          }
          if (this.enableInlineEditing == false && (columnName != 'invoiceno' && columnName != 'invoicedate' && columnName != 'description' && columnName != 'account' && columnName != 'invoiceamount' && columnName != 'allocated' && columnName != 'balance' && columnName != 'id')) {
            this.enableInlineEditing = true;
            setTimeout(() => {
              const cellElement = document.getElementById(cellId);
              let newValue = event.key; console.log(newValue); console.log(cellId);
              // Check if the key is a character key
              const isCharacterKey = event.key.length === 1;
              if ((cellElement instanceof HTMLInputElement || cellElement instanceof HTMLTextAreaElement) && isCharacterKey) {
                // If it's an input or textarea, set the value
                cellElement.value = newValue;
                if (columnKeyName !== null && columnKeyName !== undefined) {
                  // if(columnName == 'unit'){
                  //   this.advanceData[this.currentRowIndex][columnKeyName]['unit'] = event.key;
                  // } else if(columnName == 'pricecategory'){
                  //   this.advanceData[this.currentRowIndex][columnKeyName]['name'] = event.key;
                  // } else if(columnName == 'sizemasterid'){
                  //   this.advanceData[this.currentRowIndex][columnKeyName]['name'] = event.key;
                  // } else{

                  let tempRow = { ...this.advanceData[this.currentRowIndex] };
                  tempRow[columnKeyName] = event.key;
                  this.advanceData[this.currentRowIndex] = tempRow;
                  this.setFocusToInput(cellId);
                  // }    


                }
                this.advanceData = [...this.advanceData];
              }
            }, 0);

          }
        }
        break;
    }
    return true;
  }

  checkCoulmnFunction() {

    // //manage if column is partyinvno ...
    // if(this.currentColumname == 'partyinvno' && this.enableInlineEditing == true){
    //   const cellId = `accountcell-${this.currentRowIndex}-${this.currentColIndex}`;
    //   const cellElement = document.getElementById(cellId) as HTMLInputElement;
    //   if (cellElement) {
    //     const cellValue = cellElement.value;
    //     this.managePartyInvNoChange(cellValue,this.currentRowIndex);    
    //   }            
    // }

    //manage if column is partyinvdate ...
    if (this.currentColumname == 'partyinvdate' && this.enableInlineEditing == true) {
      const cellId = `accountcell-${this.currentRowIndex}-${this.currentColIndex}`;
      const cellElement = document.getElementById(cellId) as HTMLInputElement;
      if (cellElement) {
        const cellValue = cellElement.value;
        this.managePartyInvDateChange(cellValue, this.currentRowIndex);
      }
    }

    //manage if column is amount ...
    if (this.currentColumname == 'amount' && this.enableInlineEditing == true) {
      const cellId = `accountcell-${this.currentRowIndex}-${this.currentColIndex}`;
      const cellElement = document.getElementById(cellId) as HTMLInputElement;
      if (cellElement) {
        const cellValue = cellElement.value;
        this.manageAmountChange(cellValue, this.currentRowIndex);
      }
    }
  }

  movefocusToOkButton() {
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
    } else if (event.key == 'ArrowRight') {
      if (this.cancelbutton) {
        this.cancelbutton.nativeElement.focus();
      }
    }
  }

  handleCancelbuttonkeydown(event: KeyboardEvent) {
    // Check if the Enter key is pressed and the focus is on the OK button
    if (event.key === 'Enter' && document.activeElement === this.cancelbutton.nativeElement) {
      this.closePopup();
    } else if (event.key == 'ArrowLeft') {
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

  handleDoubleClick(event: any) {
    if (this.currentColumname != 'invoiceno' && this.currentColumname != 'invoicedate' && this.currentColumname != 'description' && this.currentColumname != 'account' && this.currentColumname != 'invoiceamount' && this.currentColumname != 'allocated' && this.currentColumname != 'balance' && this.currentColumname != 'id') {
      this.enableInlineEditing = true;
      setTimeout(() => {
        this.focusGridCell(this.currentRowIndex, this.currentColIndex);
      });
    }
  }

  onColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.gridnavigationService.moveToNextRow(this.advanceData, this.focusGridCell.bind(this));
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
      //   this.gridnavigationService.handleNavigationKey(this.tablecolumns, this.advanceData, this.focusGridCell.bind(this), this.onClickAddItem.bind(this));
      //   break;
    }
  }

  onClickInput(event: any, rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditingAcc();

    setTimeout(() => {
      this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }

  // deleteRow(accountId: any) {
  //   const index = this.advanceData.findIndex((account:any) => account.id === accountId);
  //   if(index == this.advanceData.length - 1){
  //     return false;
  //   } else{
  //       if (confirm("Are you sure you want to delete this details?")) {      
  //       if (index !== -1) {
  //         this.advanceData.splice(index, 1);
  //       }
  //       this.advanceData = [...this.advanceData];
  //       this.calculateFooterValues();
  //     }
  //     return true;
  //   }     
  // }

  // deleteRowFromGrid(event:any, rowIndex: number, colIndex: number):void{
  //   this.deleteRow(this.selectedAdvanceData[0].id); 
  // }

}
