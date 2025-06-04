import { Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { AccountDataDto, ACCOUNTDETAILS, BillandReference, CREDITNOTE, CUSTOMER, FillTransactionEntries, PARTICULARS, Purchase } from '../model/creditnote.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CreditNoteService } from '../../services/creditnote.service';
import { EndpointConstant, GridNavigationService, MenuDataService, SearchableDropdownComponent, STATUS_MESSAGES } from '@dfinance-frontend/shared';
import { ActivatedRoute } from '@angular/router';
import { elementAt, Subject, takeUntil } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDatepicker } from '@angular/material/datepicker';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'dfinance-frontend-creditnote',
  templateUrl: './creditnote.component.html',
  styleUrls: ['./creditnote.component.css'],
})
export class CreditnoteComponent {

  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('gridInput', { static: false }) gridInput!: ElementRef;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChild('picker') picker!: MatDatepicker<Date>;
  @ViewChild('picker', { static: false }) pickers: MatDatepicker<Date>[] = [];
  @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;

  //form
  CreditNoteForm!:FormGroup

  //common
  isLoading = false;
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  enableInlineEditing:boolean = false;
  isUpdate: boolean = false;
  isCreditCancelled = false;
  isMaximized = false;
  showDeleteOptions: boolean = false;
  destroySubscription: Subject<void> = new Subject<void>();
  isPartySelected:boolean = false;   //used for select party
  tableHeight = 200; 
  selected: any[] = [];
  showTopBar: boolean = false;
  showBottomBar: boolean = false;
  showLeftSection:boolean = true;
   
  currentItemTableIndex: number | null = null;
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname:any = "";
  showCancelPopup = false;
  showDeletePopup = false;
  userTyping:any = false;
  noGridItem = true;
  selectedRowIndex:any = -1;

  //leftside fill

  allCreditNoteList=[] as Array<CREDITNOTE>;   //store leftside data from api
  tempCreditNoteList : any =[];   //temperory store
  firstCreditNote!:number;        //store first data

  //Initailization
  selectedCreditId!:number;   //store id from the click in left side
  pageId=0;
  voucherNo = 0;
  vocherName = "";
  selectedPartyId = 0;
  type = "CreditnoteType";    //passing in particular api
  formVoucherNo:any = 0;    //store form vno pass to payload
  today = new Date();
  
 //customer
  customerData=[] as Array<CUSTOMER>;
  updatedCustomer='';
  customerreturnField='id';
  customerKeys =['AccountCode','AccountName','Address'];
  selectedCustomerId=0;
  customerExcludekeys=['id']
  selectedCustomerObj:any = {};

  //particulars
  particularies = [] as Array<PARTICULARS>; 
  selectedparticular = {} as PARTICULARS;
  selectedParId!:string    //store the value of particular
  particularData = [] as Array<PARTICULARS>;
  selectedParticularrsObj:any = {}


  //common dada filling
  commonFillData:any = [];

  //permission checking
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  //Account details
  gridColumns:any = [];
  //accountDetails: any[] = [];
  accountDetailsObj:any ={
   "accountCode":{
     "id": 0,
     "name": "",
     "code": "",
     "description": ""
   },
   "accountName":"",
   "description": "",
   "dueDate": "",
   "debit": "",
   "credit": ""
  }
 
  fillAccountData = [] as Array<ACCOUNTDETAILS>;
  accountCodereturnField='accountCode';
  accountCodeKeys=['AccountCode','AccountName','Details'];
  accountCodeExcludekeys=['id','isBillWise','isCostCentre'];
  accDetails:any[]=[]
  tempAccFillDetails: any = [];

  //set tablecoloumn
  tablecolumns = [
    { name: 'Account Code', field: 'accountcode'},
    { name: 'Account Name', field: 'accountname' },
    { name: 'Description', field: 'description' },
    { name: 'DueDate', field: 'duedate' },
    { name: 'Debit', field: 'debit' }
  ];

  //fillbyId
  currentPurchase = {} as Purchase;
  transactionEntries:any=[]
  accid =0;




  constructor(
    private formBuilder : FormBuilder,
    private creditNoteService : CreditNoteService,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private gridnavigationService: GridNavigationService, 
    private datePipe: DatePipe,
    private renderer: Renderer2,
  ){
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];      
      this.fetchMenuDataPermissions();
    }
    if (queryParams && queryParams['voucherNo']) {
      this.voucherNo = queryParams['voucherNo'];
    }
  }


  ngOnInit(): void 
  {
    this.createForm();
    this.fetchAllCreditNote();
    this.fetchCommonFillData() ;
    this.fetchCustomer();
    this.fetchParticulars();
    this.fetchAccountDetails();
    this.onClickNewCreditNote();
   
  }

  createForm() {
    this.CreditNoteForm = this.formBuilder.group({
      vouchername: [{ value: '', disabled: true }],
      voucherno: [{ value: '', disabled: true }],
      voucherdate: [{ value: this.today, disabled: this.isInputDisabled }, Validators.required],
      customer: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      customername: [{ value: '', disabled: this.isInputDisabled }],
      reference: [{ value: '', disabled: this.isInputDisabled }],
      particulars: [{ value: '', disabled: this.isInputDisabled }],
      narration: [{ value: '', disabled: this.isInputDisabled }]
    });
  }
  
  

  setInitialState() {
  this.isNewBtnDisabled = false;
  this.isEditBtnDisabled = false;
  this.isDeleteBtnDisabled = false;
  this.isSaveBtnDisabled = true;
  this.isInputDisabled = true;
  this.isUpdate = false;
  this.disbaleFormControls();
  }


  enableFormControls() {
    this.CreditNoteForm.get('voucherdate')?.enable();
    this.CreditNoteForm.get('customer')?.enable();
    this.CreditNoteForm.get('customername')?.enable();
    this.CreditNoteForm.get('reference')?.enable();
    this.CreditNoteForm.get('particulars')?.enable();
    this.CreditNoteForm.get('narration')?.enable();
    
  }

   disbaleFormControls() {
    this.CreditNoteForm.get('voucherdate')?.disable();
    this.CreditNoteForm.get('customer')?.disable();
    this.CreditNoteForm.get('customername')?.disable();
    this.CreditNoteForm.get('reference')?.disable();
    this.CreditNoteForm.get('particulars')?.disable();
    this.CreditNoteForm.get('narration')?.disable();
  }
  

   fetchMenuDataPermissions(){
    let menuData = this.menudataService.getMenuDataFromStorage(Number(this.pageId));
    this.isView = menuData.isView;
    this.isCreate = menuData.isCreate;
    this.isEdit = menuData.isEdit;
    this.isDelete = menuData.isDelete;
    this.isCancel = menuData.isCancel;
    this.isEditApproved = menuData.isEditApproved;
    this.isHigherApproved = menuData.isHigherApproved;
  }


  fetchCustomer(){
    this.creditNoteService
    .getDetails(EndpointConstant.FILLCUSTOMERCN + this.voucherNo)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        let responseData = response?.data;
        this.customerData = responseData.map((item: any) => ({
          AccountCode: item.code,
          AccountName: item.name,
          Address: item.description,
          id:item.id
        }));
        this.customerData = response?.data;
       
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }


  fetchAccountDetails() {
    this.creditNoteService.getDetails(EndpointConstant.FILLACCOUNTDATA)
      .subscribe({
        next: (response) => {
          if (response && response.data) {
            let responseData = response.data;
            let itemData = responseData.map((item: any) => {
              return {
                accountCode: item.accountCode.toString(),
                accountName: item.accountName,
                details: item.details,
                id: item.id,
                isBillIse: item.isBillWise,
                isCostcentre: item.isCostCentre
              };
            });
            this.fillAccountData = responseData;
          } else {
            console.error("Error: Response or response data is undefined.");
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An error occurred:', error);
        },
        complete: () => {
          console.log('Observable completed.');
        }
      });
  }
  
handleDoubleClick(event: any) {
   if (this.currentColumname !== 'accountname') {
    this.enableInlineEditing = true;
   }
}


onPurchaseTabChange(event: MatTabChangeEvent) {
  this.showBottomBar = false;
   this.onScroll("");
 }



onInputBlur(rowIndex: number) {
  // Update the row's dueDate in the model when the input loses focus
  this.accDetails[rowIndex]['dueDate'] = new Date(this.accDetails[rowIndex]['dueDate']).toISOString();
}

updateDueDate(newDate: any, row: any) {
  if (newDate) {
    // Assuming you want to store the date in 'DD/MM/YYYY' format
    const parts = newDate.split('-');
    row.dueDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
  } else {
    row.dueDate = '';  // Handle empty date
  }
}


convertToDateInputFormat(dateString: string): string {
  if (!dateString) return ''; 
  const parts = dateString.split('/');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
}



  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
  }

  onClickSpan(event:any, rowIndex: number, colIndex: number): void {
    this.enableInlineEditing = false;
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    this.handleKeysForInlineEditing();
    setTimeout(() => {
        this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }


  handleKeysForInlineEditing(){
    // Handle other keys for inline editing
    const cellid = "cell-"+this.currentRowIndex+"-"+this.currentColIndex;
    const cellelement = document.getElementById(cellid);
    if (cellelement) {
      const columnName = cellelement.getAttribute('data-column-name');
      if(columnName != null){
        this.currentColumname = columnName;
      }
    } 
  }

 
  selectedIDRowIndex = -1;
  onKeyDown(event: KeyboardEvent) {
    this.selectedIDRowIndex = -1;
    //handle CTl+Alt+m key .
    if (event.altKey && event.ctrlKey && event.key === 'm') {
      event.preventDefault();
      
    }

    if (event.ctrlKey && event.key === 'Enter') {
      // Logic for Ctrl+Enter
      if (this.currentRowIndex < this.tempAccFillDetails.length - 1) {
        this.currentRowIndex++;
        this.currentColIndex = 1;
        this.scrollToCell(this.currentRowIndex,this.currentColIndex);
        this.enableInlineEditing = false;
        this.focusGridCell(this.currentRowIndex, this.currentColIndex);
      } else{
        this.addRow();
        this.enableInlineEditing = false;
      }
    }

    if (event.ctrlKey) {
      return true;
    } 
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
          if (this.currentRowIndex < this.tempAccFillDetails.length - 1) {
            this.currentRowIndex++;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }          
          // this.gridnavigationService.moveToNextRow(this.tempItemFillDetails, this.focusGridCell.bind(this));
        }
         break;
       

      case 'ArrowUp':
        if(this.enableInlineEditing == false  && this.currentColumname != 'id'){
          event.preventDefault();
          if (this.currentRowIndex > 0) {
            this.currentRowIndex--;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }          
          //this.gridnavigationService.moveToPreviousRow(this.focusGridCell.bind(this));
        }
        break;

      case 'ArrowRight':
        if(cursorPosition == targetlength){
          event.preventDefault();
          if (this.currentColIndex < this.tablecolumns.length - 1) {
            this.currentColIndex++;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
          }        
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        }
        break;

      case 'ArrowLeft':
        if(cursorPosition == 0 && this.currentColumname != 'itemcode'){
          event.preventDefault();
          if (this.currentColIndex > 0) {
            this.currentColIndex--;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;          
            this.handleKeysForInlineEditing();
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }
        }
        break;

      case 'Delete':
        if(!this.enableInlineEditing){
          event.preventDefault();
          //call delete function to delete current row.
          this.deleteItemGrid(this.currentRowIndex);
        }
      break;

      case 'Escape':
      case 'Esc': 
        if(!this.enableInlineEditing){
          event.preventDefault();
          //call delete function to delete current row.
          if(this.tempAccFillDetails.length > 1){
            let index = this.tempAccFillDetails.length - 2;
            this.deleteItemGrid(index);
          }          
        }
      break;
      
      case 'Enter':
        event.preventDefault();

        this.enableInlineEditing = false;
        if(this.currentColumname == 'accountcode' && this.tempAccFillDetails[this.currentRowIndex]['accountCode'] == ""){
          // const matchExists = this.fillItemDataOptions.some(option => option['itemCode'] == this.tempItemFillDetails[this.currentRowIndex]['itemCode']);
          // if(!matchExists){
          //   this.deleteItemGrid(this.currentRowIndex,false);
          //   break;
          // }         
        }
        if (this.currentColIndex < this.tablecolumns.length - 1) {
          this.currentColIndex++;
          this.scrollToCell(this.currentRowIndex,this.currentColIndex);
          this.enableInlineEditing = false;
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          let currentCoulmn = this.tablecolumns[this.currentColIndex];
          //enter functionality if current column is qty...
          if(currentCoulmn.field == 'qty'){
            // check qty is Zero if yes move to those columns else move to next code ...
            if(this.tempAccFillDetails[this.currentRowIndex]['rate'] == 0){
              //show rate this.baseService.showCustomDialogue...
              //this.onMouseLeaveQty(this.currentRowIndex,Event);
            }
          }

        } else {
          if (this.currentRowIndex < this.tempAccFillDetails.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            // focusCell(this.currentRowIndex, this.currentColIndex);
          } else {
            this.addRow(false,event);
            this.enableInlineEditing = false;
          } 
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        } 
          break;
      case 'Tab':

        if (event.shiftKey) {
          // Logic for Shift+Tab
          event.preventDefault(); // Prevent the default Shift+Tab behavior
          this.moveFocusToDropdown('customer'); // Move focus to the supplier input or other logic
        } else {
          event.preventDefault();         
          this.enableInlineEditing = false; 
          if(this.currentColumname == 'accountcode' && this.tempAccFillDetails[this.currentRowIndex]['accountCode'] == ""){
            // const matchExists = this.fillItemDataOptions.some(option => option['itemCode'] == this.tempItemFillDetails[this.currentRowIndex]['itemCode']);
            // if(!matchExists){
            //   this.deleteItemGrid(this.currentRowIndex,false);
            //   break;
            // }         
          }

         
          
          

          if (this.currentRowIndex < this.tempAccFillDetails.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 1;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          } else{
            this.addRow();
            this.enableInlineEditing = false;
          }
        }       

        break;
      case 'Shift': 
      break;

      case 'Ctrl': 
      break;

      case 'Alt': 
      break;

      case 'F5':
        event.preventDefault();
      break;

      case 'F6':
      break;

      case 'F7':
      break;
      case 'F8':
      break;
      case 'F2':
      break;
      case 'F9':
      break;

      case 'PageDown':
        event.preventDefault();
        const cellId = (event.target as HTMLElement).id;
        const cellElement = document.getElementById(cellId);
        if (cellElement) {
          const columnName = cellElement.getAttribute('data-column-name');
          if(columnName == 'accountcode'){
            this.enableInlineEditing = true;
            this.currentColumname = columnName;
            // Add a small timeout to ensure the DOM updates before triggering the dropdown keydown event
            setTimeout(() => {
              this.callKeydownEventToDropdown(cellId + columnName, event);
            }, 0);
          }
        }        
      break;

      default:
        if(!this.isInputDisabled){
          // Handle other keys for inline editing
          const cellId = (event.target as HTMLElement).id;
          const cellElement = document.getElementById(cellId);
          if (cellElement) {
            const columnName = cellElement.getAttribute('data-column-name');
            const columnKeyName = cellElement.getAttribute('data-column-key-name');
            if(columnName != null){
              this.currentColumname = columnName;
            }
            if(this.enableInlineEditing == false  && (columnName != 'accountname')){
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
                    if(columnName == 'duedate'){
                      this.tempAccFillDetails[this.currentRowIndex][columnKeyName]['duedate'] = event.key;
                    } else if(columnName == 'debit'){
                      this.tempAccFillDetails[this.currentRowIndex][columnKeyName]['debit'] = event.key;
                    }  else{
                      let tempRow = { ...this.tempAccFillDetails[this.currentRowIndex] };
                      tempRow[columnKeyName] = event.key;
                      this.tempAccFillDetails[this.currentRowIndex] = tempRow;
                    }              
                  }
                  this.tempAccFillDetails = [...this.tempAccFillDetails];
                } 
              }, 0);
              
            }  
          }  
        }
        break;
    }
    return true;
  }

  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;
  callKeydownEventToDropdown(fieldName:any,event:KeyboardEvent): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.onKeyDown(event);
    }
  }












  deleteItemGrid(index: any) {
    if (confirm("Are you sure you want to delete this details?")) {
      if ( this.accDetails.length == 1) {
        this.noGridItem = true;
        this.accDetails = [];
        this.accDetails.push(this.accountDetailsObj);
      } else if (index !== -1) {
        this.accDetails.splice(index, 1);
        this.selected = [];
      }
      this.accDetails = [...this.accDetails];
      this.tempAccFillDetails = [...this.accDetails];
      //this.deleteExpiryItems(index);
      this.selectedRowIndex = -1
    }
    return true;
  }

  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
  }


  fetchAllCreditNote():void
  {
    this.isLoading = true;
    this.creditNoteService.getDetails(EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true')
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        this.allCreditNoteList = response?.data;
       // this.tempCreditNoteList =  this.allCreditNoteList[0].ID;
       this.tempCreditNoteList = [...this.allCreditNoteList];
        this.firstCreditNote = this.allCreditNoteList[0].ID;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('An Error Occured', error);
      },
    });
  }


  onClickNewCreditNote(){
    if(!this.isCreate){
      alert('Permission Denied!');
      return false;
    }
    if (this.isInputDisabled == false) {
      if (!confirm("Are you sure you want to cancel the New mode?")) {
        return false;
      }
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.CreditNoteForm.reset();
    this.updatedCustomer="";
    this.selectedCreditId = 0;
    this.accDetails=[];  //adding an empty grid row
   
    if(this.isInputDisabled == true){
      this.disbaleFormControls();
      this.selectedCreditId=this.firstCreditNote;
      this.fetchAllCreditNoteById();
    }
    else{
      this.enableFormControls();  
      this.tempAccFillDetails=[];
      this.accDetails=[];  //adding an empty grid row
    

    this.CreditNoteForm.patchValue({
      voucherdate: this.today,
    });
   
    //this.currentItemTableIndex = 0;

    this.fetchCommonFillData();
    //this.fetchAccountDetails();

    this.addRow(); 
  }
    return true;
  }


  onClickCreditNote(event:any): void
  {
    if(event.type === 'click')
    {
      this.selectedCreditId = event.row.ID;
      this.fetchAllCreditNoteById();
    }
  }


  fetchAllCreditNoteById():void{
    this.creditNoteService
    .getDetails(EndpointConstant.FILLPURCHASEBYID + this.selectedCreditId + '&pageId=' + this.pageId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        
        this.currentPurchase = response?.data;
        this.FillCreditNoteDetails();        
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
  }


  FillCreditNoteDetails(){
    let transactionDetails = this.currentPurchase?.transaction.fillTransactions;  
    this.transactionEntries = this.currentPurchase?.transaction.fillTransactionEntries;
    let transactionAddditional = this.currentPurchase?.transaction.fillAdditionals;
    const particularsList = this.particularData; 
    const selectedparticular = particularsList.find(particular => particular.id === transactionAddditional?.typeID);
    this.accid=transactionDetails.accountID;
    this.referenceData = this.currentPurchase?.transaction.fillVoucherAllocationUsingRef;

    this.CreditNoteForm.patchValue({
      vouchername: this.vocherName,
      voucherno: transactionDetails.transactionNo,
      voucherdate: transactionDetails.date ? new Date(transactionDetails.date) : null,
      customer: transactionDetails.accountName,
      
      customername: transactionDetails.accountName,
      reference: transactionDetails.referenceNo,
      particulars: selectedparticular ? selectedparticular.value : '',
      narration: transactionDetails.commonNarration
    });
   

    this.formVoucherNo=transactionDetails.transactionNo;
    //set transaction is cancelled or not...
    this.isCreditCancelled = transactionDetails.cancelled;
    //set customer data...
    this.onCustomerSelected(transactionDetails.accountID);

    this.setGridDetailsFromFill(this.transactionEntries);

  }



  setGridDetailsFromFill(transactionEntries: any) { 
    if (transactionEntries && transactionEntries.length > 0) { 
      this.accDetails = []; 
      transactionEntries = transactionEntries.filter((acc: any) => acc.accountId !== this.accid);
      transactionEntries.forEach((trn: any) => { 
        const newRow = { 
          accountCode: { 
            id: trn.accountId, 
            code: trn.alias.toString(), // Assuming 'alias' is the account code 
            name: trn.name, 
            description: trn.description ?? '' 
          }, 

          description: trn.description ?? '', 
          amount: trn.amount ?? null, 
          debit: trn.debit ?? null, 
          credit: trn.credit ?? null, 
          dueDate: trn.dueDate ? new Date(trn.dueDate) : null, 
          //billandRef: trn.referenceNo ?? null // Map reference if necessary 

        }; 
        this.accDetails.push(newRow); 
      }); 
     const extraRow = { 
      accountCode: { 
        id: null, 
        code: '', 
        name: '', 
        description: ''
      }, 
      description: '', 
      amount: null, 
      debit: null, 
      credit: null, 
      dueDate: null, 
      billandRef: null 
    };
    this.accDetails.push(extraRow); 
      this.tempAccFillDetails = [...this.accDetails]; 
      this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60); 
      //console.log('Grid populated with transaction entries:', this.accDetails); 
    } else { 
      console.warn('No transaction entries found to populate the grid.'); 
    } 
  } 
  
 

  


  onCustomerSelected(option: any): any {
    this.selectedCustomerId = option;
    this.customerData.forEach((item) => {
      if (item.id === option) {
        this.CreditNoteForm.patchValue({
          customer: item.name,
          customername :item.name
        });
        this.updatedCustomer = item.name;
        this.selectedCustomerObj = {
          "id": item.id,
          "name": item.name,
          "code": item.code,
          "description": item.description
        };
        //console.log("selcustOBJ=>"+this.selectedCustomerObj)
        this.checkAdvanceAmount(this.selectedCustomerObj.id);
        this.isPartySelected = true;
        this.moveFocusToItemGrid();
      }
    });
  }



  onClickEditCreditNote(){
    if(!this.isEdit){
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    //this.accDetails=[];
    //this.tempAccFillDetails=[];
    if (this.isInputDisabled == false) {
      this.enableFormControls();
    } else {
      this.disbaleFormControls();
    }
    this.fetchAllCreditNoteById();
    this.addRow();
    return true;
  }


  onAccountCodeSelected(option: any, rowIndex: number) {
    if (option !== "") {
        let selectedAccountObj: any = {};
        this.fillAccountData.forEach((accInfo: any) => {
            if (accInfo.accountCode === option) {
                selectedAccountObj = {
                    accountCode: {
                        id: accInfo.id,               
                        name: accInfo.accountName,     
                        code: accInfo.accountCode,    
                        description: accInfo.details   
                    },
                    description: "",
                    dueDate: "" || null,  
                    debit: 0 as number,      
                    credit: 0 as number    
                };

                // Ensure accountName is not included in the final object
                //selectedAccountObj.accountName = "";  
            }
        });

       
        if (selectedAccountObj.accountCode) {
            this.accDetails[rowIndex] = selectedAccountObj;
            this.accDetails = [...this.accDetails]; 
            this.tempAccFillDetails = [...this.accDetails]; 

            //console.log("tempAccFillDetails="+JSON.stringify(this.tempAccFillDetails,null,2))
            
        }
    } 
    
     // If needed, add a new row in the UI
     this.addRow(true);
}



onClickSaveCreditNote(){
  if(this.CreditNoteForm.get('customer')?.value == null){
    alert('Party is Mandatory');
    this.moveFocusToDropdown('customer');
    return false;
  } 

  const date=this.CreditNoteForm.get('voucherdate')?.value
  if(date === null){
    alert("Voucher Date is Mandatory")
  }

  if(this.accDetails[0].accountCode.code === null || this.accDetails[0].accountCode.code === "" ){
    alert("Account cannot be empty. Please add an account");
    return false;
  }

  if(this.accDetails[0].accountCode.debit === null || this.accDetails[0].accountCode.debit === "" ){
    alert("Amount cannot be null. Please enter amount");
    return false;
  }
  //set particular data..
  if (this.CreditNoteForm.get('particulars')?.value) {
  const selectedParticularId = this.CreditNoteForm.get('particulars')?.value;
  
  const foundElement = this.particularData.find((element: any) => element.value === selectedParticularId);
  if (foundElement) {
    this.selectedParticularrsObj = {
      id: foundElement.id,
      value: foundElement.value
    };
  } else {
  
    this.selectedParticularrsObj = {}; 
  }
}

// const filteredDetails = this.tempFillDetails.filter((row) => row.accountCode && row.accountCode.code);
// console.log(this.tempFillDetails);

 //removing last entry from account details ..
 this.accDetails.pop();

 const payload = {
   "id": this.selectedCreditId ? this.selectedCreditId : 0,
   "voucherNo": this.formVoucherNo,
   "voucherDate": this.CreditNoteForm.value.voucherdate,
   "reference": this.CreditNoteForm.value.reference,
   "party":this.selectedCustomerObj,
   "particulars":this.selectedParticularrsObj,
   "narration":this.CreditNoteForm.value.narration,
   "accountDetails":this.accDetails,
   
   "billandRef": this.selectedAdvanceData
  
 
};
if (this.isUpdate) {
this.updateCallback(payload);
} else {
this.createCallback(payload);
}
return true;
}


updateCallback(payload: any) {
  this.creditNoteService.updateDetails(EndpointConstant.UPDATECREDITNOTE+this.pageId+'&voucherId='+this.voucherNo, payload)
  .pipe(takeUntil(this.destroySubscription))
  .subscribe({
    next: (response) => {
      this.isLoading = false;
      const status = response.httpCode as keyof typeof STATUS_MESSAGES;
      const message =STATUS_MESSAGES[status] ; 
      alert(message); 
      this.selectedCreditId = 0;
      this.selectedCreditId = this.firstCreditNote;
      this.setInitialState();
      this.onClickNewCreditNote();
    },
    error: (error) => {
      this.isLoading = false;
      alert('Please try again');
    },
  });
}

createCallback(payload: any) {
console.log("entering here!!!!!!!!!!!!!!!!")
console.log("payload="+JSON.stringify(payload,null,2))
this.creditNoteService.saveDetails(EndpointConstant.SAVECREDIT + this.pageId+ '&VoucherId=' +this.voucherNo, payload)
  .pipe(takeUntil(this.destroySubscription))
  .subscribe({
    next: (response) => {
      const status = response.httpCode as keyof typeof STATUS_MESSAGES;
      const message =STATUS_MESSAGES[status] ; 
      alert(message); 
      this.selectedCreditId= this.firstCreditNote;
      this.fetchAllCreditNote();
      this.setInitialState();
      this.onClickNewCreditNote();
  },
    error: (error) => {
      this.isLoading = false;
      console.error('Error saving creditnote', error);
    },
  });
}


  onChangedescp(rowIndex: any, event: any) {
    let desc = event.target.value;
    this.accDetails[rowIndex]['description']=desc;
  }
  onChangeduedate(rowIndex: any, event: any) {
      let date = event.target.value;
      this.accDetails[rowIndex]['dueDate'] = date;
  }



  addRow(itemcodesel = false,event?: KeyboardEvent) {
    const allItemCodesFilled = this.accDetails.every(item => item.accountCode.code && item.accountCode.code.trim() !== '');
    if (!allItemCodesFilled) {      
      if (event && event.key === 'Enter') {
        
      this.currentColIndex = -1;
      this.currentRowIndex = -1;
        this.focusOnTabIndex(13);        
      }
      return false; // Exit the function if any itemCode is empty
    }
    this.accDetails.push(this.accountDetailsObj);
    this.currentItemTableIndex = this.accDetails.length - 1;
    this.accDetails = [...this.accDetails];
    this.tempAccFillDetails = [...this.accDetails];
    if(!itemcodesel){
      //set row and column index....
      this.currentRowIndex++;
      this.currentColIndex = 0; 
      this.scrollToCell(this.currentRowIndex,this.currentColIndex);// Reset column index to 0 for the new row
    }   
     // Increase table height dynamically, assuming rowHeight = 50px
     this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60); // Header and footer height = 100px

    return true;
  }

  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }


  moveFocusToDropdown(fieldName:any): void {
    // Find the dropdown with fieldName and focus it
    // const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    // if (fieldDropdown) {
    //   fieldDropdown.focusInput();
    // }
  }

  
  fetchParticulars(): void {
    this.creditNoteService
      .getDetails(EndpointConstant.FILLPARTICULAR + this.type)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          
          if (response?.isValid && response?.data?.length > 0) {
            this.particularies = response.data[0];
            this.particularData = this.particularies;
            if (this.particularData?.length > 0) {
              this.CreditNoteForm.patchValue({
                particulars: this.particularData[0].id 
              });
            }
            //console.log("Particular data: ", this.particularData);
          } else {
            console.warn('Invalid response or no data available');
          }
        },
        error: (error) => {
          console.error('An Error Occurred', error);
        },
      });
  }
  

  onChangeParticulars(){
    
  }

  onParticularSelect(): void {
    this.selectedParId = this.CreditNoteForm?.get('particulars')?.value;
    this.selectedparticular = this.particularies?.find(obj => obj?.value == this.selectedParId) as PARTICULARS;
  }


  onFormKeyDown(event: KeyboardEvent,index:number): void {
    if(event.key == 'Enter'){
      event.preventDefault(); 
      this.focusOnTabIndex(index);
    }
  }  


  // Function to move focus to an element with a specific tabindex
  focusOnTabIndex(tabIndex: number): void {
    const element = document.querySelector(`[tabindex="${tabIndex}"]`) as HTMLElement;
    if (element) {
      element.focus(); // Focus the element with the given tabindex
    }
  }

  onScroll(event: any) {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    this.showTopBar = scrollTop > 50;  // Show the bar when scrolled more than 50px
    //  this.showBottomBar = scrollTop === 0; // Show the bar when the scroll reaches the top
    // Check if the scroll height exceeds the client height
     const container = this.scrollContainer.nativeElement;
     this.showBottomBar = container.scrollHeight > container.clientHeight;
  }

 

  fetchCommonFillData() {
    this.creditNoteService.getDetails(EndpointConstant.FILLCOMMONPURCHASEDATA + this.pageId + '&voucherId=' + this.voucherNo)
    .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.commonFillData = response?.data;
           this.setVoucherData();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  setVoucherData(){
    //set voucher name and number...
    this.vocherName = this.commonFillData.vNo?.code;
    this.CreditNoteForm.patchValue({
      vouchername: this.vocherName,
      voucherno: this.commonFillData.vNo?.result,
    });
    this.formVoucherNo = this.commonFillData.vNo?.result;
  }

  moveFocusToItemGrid(){
    this.currentColIndex = 1;
    this.currentRowIndex = 0;
    this.scrollToCell(this.currentRowIndex,this.currentColIndex);
    this.enableInlineEditing = false;
    this.focusGridCell(this.currentRowIndex, this.currentColIndex);
  }

  onColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        //this.gridnavigationService.moveToNextRow(this.tempFillDetails, this.focusGridCell.bind(this));
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
        this.gridnavigationService.handleNavigationKey(this.tablecolumns, this.tempAccFillDetails, this.focusGridCell.bind(this), this.addRow.bind(this));
        break;
    }
  }

  onClickInput(event:any, rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditing();

    setTimeout(() => {
        this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }

  onInputDiscount(rowIndex: number, event: any) {
    this.userTyping = true; // Set the flag when user is typing
  }


  dateValidator(event: any) {
    let expiryDate = event.target.value;
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
    const valid = regex.test(expiryDate.value);
    if (expiryDate && !valid) {
      alert('Invalid Date');
    }
  }


  formatDate(event: any) {
    let value = event.target.value;
    value = value.replace(/\D/g, ''); // Remove non-numeric characters
    if (value.length > 2 && value.length <= 4) {
      value = value.slice(0, 2) + '/' + value.slice(2); // Add '/' after month
    } else if (value.length > 4 && value.length <= 6) {
      value = value.slice(0, 5) + '/' + value.slice(5); // Add '/' after year
    }
    event.target.value = value;
  }


  scrollToCell(rowIndex: number, colIndex: number): void {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }


  onClickDeleteCreditNote(event: Event) {
    event.preventDefault();
    if (!this.isDelete) {
      alert('Permission Denied!');
      return false;
    }
    this.showDeletePopup = true;
    this.showDeleteOptions = false;
    //this.confirmDelete();
    setTimeout(() => {
      if (this.reasonInput) {
        this.reasonInput.nativeElement.focus();
      }
    }, 0);
    return true;
  }

  onClickCancelCreditNote(event: Event) {
    event.preventDefault();
    if (!this.isCancel) {
      alert('Permission Denied!');
      return false;
    }
    this.showCancelPopup = true;
    //this.confirmCancel();
    this.toggleDeleteOptions();
    return true;
  }

  confirmDelete() {
    this.creditNoteService.deleteDetails(EndpointConstant.DELETEPURCHASE + this.selectedCreditId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.showDeletePopup = false;
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status] ;
          alert(message);
          this.selectedCreditId = 0;
          this.showDeletePopup = false;
          this.fetchAllCreditNote();
          this.setInitialState();
          this.onClickNewCreditNote();
        },
        error: (error) => {
          this.isLoading = false;
          alert('Please try again');
        },
      });
  }

  closeDeletePopup() {
    this.showDeletePopup = false;
  }

  confirmCancel() {
    this.creditNoteService.updateDetails(EndpointConstant.CANCELPURCHASE + this.selectedCreditId + '&reason=' + this.cancelReason + '&pageId=' + this.pageId, {})
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status] ;
          alert(message);
          this.cancelReason = "";
          this.selectedCreditId = 0;
          this.showCancelPopup = false;
          this.fetchAllCreditNote();
          this.setInitialState();
          this.onClickNewCreditNote();
        },
        error: (error) => {
          alert('Please try again');
        },
      });
  }

  closeCancelPopup() {
    this.showCancelPopup = false;
  }

  cancelReason: string = "";
  referenceData:any = {};

 //advance 
  showAdvanceDetails = false;
  advanceAmountObj:any = [];
  advanceAmount = 0.0000;
  selectedAdvanceData:any = [];
  advancePayableAmount = 0.00;

  onClickAdvanceAmountOption(event: KeyboardEvent, rowIndex: number): void { 

    if (event.key === 'Enter' || event.key === 'Tab') {  
      //this.allocationAmt=this.accDetails[rowIndex].credit; 
            event.preventDefault(); 
            this.renderer.setStyle(document.body, 'overflow', 'hidden');  
           // this.showAdvanceDetails = true; 
           // this.advancePayableAmount=this.allocationAmt 
           if (this.advanceAmountObj && this.advanceAmountObj.length > 0) {
            this.showAdvanceDetails = true;
          } else {
            
            //console.log("No advance data available for this customer.");
            this.showAdvanceDetails = false;  
          }
    } 

  } 



  checkAdvanceAmount(a:number) {
    let voucherDate = this.CreditNoteForm.get('voucherdate')?.value;
    if (voucherDate == null) {
      alert('Invalid Date');
      return false;
    }
    voucherDate = this.datePipe.transform(voucherDate, 'MM-dd-YYYY');
    let creditId = this.selectedCustomerId ? this.selectedCustomerId : 0;
    this.creditNoteService
      .getDetails(EndpointConstant.FILLADVANCE + creditId + '&voucherId=' + this.voucherNo + '&date=' + voucherDate)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          //console.log("BILLANDREF=>"+EndpointConstant.FILLADVANCE + creditId + '&voucherId=' + this.voucherNo + '&date=' + voucherDate)
            this.advanceAmountObj = response?.data;

            //console.log("refdata="+JSON.stringify(this.referenceData))

            //console.log("ADV DATA="+JSON.stringify(this.selectedAdvanceData,null,2))
            if (this.selectedAdvanceData && this.selectedAdvanceData.length > 0) {
              //console.log("advobj" + JSON.stringify(this.advanceAmountObj, null, 2));
              this.advanceAmountObj.forEach((element: any) => {
                const selectedItems = this.selectedAdvanceData.filter((v: any) => v.selection === true);
                selectedItems.forEach((selectedItem: any) => {
                  if (element.vid === selectedItem.vid) {
                    // Add the corresponding amount to allocated
                    element.allocated += selectedItem.amount;
                    //console.log(`Updated allocated for vid ${selectedItem.vid}: ` + element.allocated);
                  }
                });
            
                //console.log("advobj loop after update: " + JSON.stringify(this.advanceAmountObj, null, 2));
              });
            }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
    return true;
  }


  closeAdvancePopup(response: any,rowIndex: number) {   // This function is called when the popup is closed
    if (Object.keys(response).length > 0) {
      this.advanceAmount = response.allocatedAmount;
      //console.log("Checking the data to pass to payload on close of the advance popup =>", response);
  
    
      if (response?.selectedAdvanceData && response.selectedAdvanceData.length > 0) {
        this.selectedAdvanceData = [...this.selectedAdvanceData, ...response.selectedAdvanceData];
      }
      this.advanceAmountObj = response.advanceData;
      // console.log("EACH TIME ADDING ADV="+JSON.stringify(this.advanceAmountObj,null,2))
      // console.log("Checking the updated selectedAdvanceData before passing to payload =>", JSON.stringify(this.selectedAdvanceData, null, 2));

      const totalAmount = this.advanceAmountObj.reduce((sum:number, currentItem:any) => sum + currentItem.amount, 0);
      this.accDetails[rowIndex]['debit'] =totalAmount;
      //console.log("Total amount calculated and assigned to debit field:", totalAmount);
    }
  

    // Close the popup and remove overflow styling
    this.renderer.removeStyle(document.body, 'overflow');
    this.showAdvanceDetails = false;
  }
  

  

  onUpdateAmount(event: any) {
    const { amount } = event; 
    const rowIndex = this.currentRowIndex; 
    this.accDetails[rowIndex]['debit'] = parseFloat(amount);
    this.advancePayableAmount = parseFloat(amount);
    this.accDetails = [...this.accDetails];
    //console.log(`Updated debit for row ${rowIndex}:`, amount);
  }



  remainingAmount: number = 0;

  onChangedebit(rowIndex: any, event: any) {
    let debit = event.target.value;
    this.accDetails[rowIndex]['debit'] = debit; console.log(debit)
      this.advancePayableAmount = parseFloat(debit);
      //console.log(`Debit for row ${rowIndex}:`, debit);
      //this.remainingAmount = this.advancePayableAmount;
  
      this.checkAdvanceAmount( debit );
   
      // After updating the debit value, update the advance payable amount
      //this.updateAdvancePayableAmount(debit);
  }




  ngOnDestroy(): void {
    this.destroySubscription.next();
    this.destroySubscription.complete();
    // Destroy DataTables when the component is destroyed
    // if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
    //   $(this.table.nativeElement).DataTable().destroy();
    // }
  }


 


}

 