import { Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ACCOUNTDETAILS, BillsAndRef, Currency, FinanceFillById, Master, Projects } from '../model/journalvoucher.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseService, EndpointConstant, GridNavigationService, MenuDataService, SearchableDropdownComponent, STATUS_MESSAGES } from '@dfinance-frontend/shared';
import { JournalVoucherService } from '../../services/journalvoucher.service';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';
import { DatatableComponent } from '@swimlane/ngx-datatable';

@Component({
  selector: 'dfinance-frontend-contravoucher',
  templateUrl: './contravoucher.component.html',
  styleUrls: ['./contravoucher.component.css'],
})
export class ContravoucherComponent {

  pageId = 0;
  voucherNo = 0;
  destroySubscription: Subject<void> = new Subject<void>();

  isLoading = false;
  isInputDisabled: boolean = true;
  showLeftSection: boolean = true;
  isMaximized = false;
  firstContra!: number
  isUpdate: boolean = false;

  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  isContraCancelled = false;
  noGridItem = true;

  //for currency dropdown
  currentCurrencyRate = 0;
  selectedCurrencyId = 0;
  multiCurrencySupport = 1;
  currencyDropdown: any = [] as Array<Currency>;
  currentcurrencyObj = {};

  tempContraList: any = [];
  contraVoucherMaster = [] as Array<Master>

  selectedContraId!: number;

  showDeleteOptions: boolean = false;
  today = new Date();


  /*****account grid*****/
  //for account popup
  accountCodeKeys = ['Account Code', 'Account Name', 'Details'];
  accountCodeExcludekeys = ['isBillWise', 'isCostCentre', 'id'];
  accountCodereturnField = 'accountCode';
  fillAccountData = [] as Array<ACCOUNTDETAILS>

  tempFillDetails: any = [];
  accDetails: any[] = [];
  selected: any[] = [];
  tableHeight = 200;
  tablecolumns = [
    { name: 'SlNo', field: 'id' },
    { name: 'Account Code', field: 'accountcode' },
    { name: 'Account Name', field: 'accountname' },
    { name: 'Description', field: 'description' },
    { name: 'DueDate', field: 'duedate' },
    { name: 'Debit', field: 'debit' },
    { name: 'Credit', field: 'credit' }
  ];

  enableInlineEditing: boolean = false;
  currentRowIndex: number = -1;
  currentColIndex: number = 0;
  currentColumname: any = "";
  currentContra = {} as FinanceFillById;
  selectedRowIndex: any = -1;

  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;
  @ViewChild('tableWrapper', { static: true }) tableWrapper!: ElementRef;
  @ViewChild('tableSummary', { static: true }) tableSummary!: ElementRef;
  @ViewChildren('summaryCell') summaryCells!: QueryList<ElementRef>;


  //for commondata-voucher number and cost centre
  projectData = [] as Array<Projects>;
  projectreturnField = 'projectname';
  projectKeys = ['Project Code', 'Project Name', 'ID'];
  updatedProject = '';
  commonFillData: any = [];
  vocherName = "";
  formVoucherNo: any = 0;
  selectedProjectObj: any = {};

  //for permission checking
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;

  showTopBar: boolean = false;
  showBottomBar: boolean = false;

  contraVoucherForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private gridnavigationService: GridNavigationService,
    private journalVoucherService: JournalVoucherService,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private baseService: BaseService,
    private renderer: Renderer2,
    private datePipe: DatePipe,
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
    if (queryParams && queryParams['voucherNo']) {
      this.voucherNo = queryParams['voucherNo'];
    }
  }

  ngOnInit(): void {
    this.contraVoucherForm = this.formBuilder.group({
      vouchername: [{ value: '', disabled: true }],
      voucherno: [{ value: '', disabled: true }],
      currency: [{ value: '', disabled: this.isInputDisabled }],
      exchangerate: [{ value: '', disabled: this.isInputDisabled }],
      project: [{ value: '', disabled: this.isInputDisabled }],
      reference: [{ value: '', disabled: this.isInputDisabled }],
      narration: [{ value: '', disabled: this.isInputDisabled }],
      voucherdate: [{ value: this.today, disabled: this.isInputDisabled }],

    });
    this.fetchJrVoucherMaster();
    this.onClickNewContraVoucher()
    this.fetchCurrencyDropdown();
    this.fetchCommonFillData();
    this.fetchAccountPopup();
  }

  //for permission checking
  fetchMenuDataPermissions() {
    let menuData = this.menudataService.getMenuDataFromStorage(Number(this.pageId));
    this.isView = menuData.isView;
    this.isCreate = menuData.isCreate;
    this.isEdit = menuData.isEdit;
    this.isDelete = menuData.isDelete;
    this.isCancel = menuData.isCancel;
    this.isEditApproved = menuData.isEditApproved;
    this.isHigherApproved = menuData.isHigherApproved;
  }


  filterContra(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempContraList.filter(function (d: any) {
      const trNoMatch = d.TransactionNo.toString().toLowerCase().includes(val.toLowerCase());
      return trNoMatch || !val;
    });
    this.contraVoucherMaster = temp;
  }
  onScroll(event: any) {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    this.showTopBar = scrollTop > 50 ? true : false;  // Show the bar when scrolled more than 50px
  }

  onFormKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key == 'Enter') {
      event.preventDefault();
      this.focusOnTabIndex(index);
    }
  }

  focusOnTabIndex(tabIndex: number): void {
    const element = document.querySelector(`[tabindex="${tabIndex}"]`) as HTMLElement;
    if (element) {
      element.focus(); // Focus the element with the given tabindex
    }
  }

  //project popup
  onProjectSelected(option: string): any {
    this.updatedProject = option;
    this.contraVoucherForm.patchValue({
      project: option,
    });
    //this.moveFocusToDropdown('supplier');
  }

  onClickNewContraVoucher() {
    if (!this.isCreate) {
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
    this.contraVoucherForm.reset();
    this.selectedContraId = 0;
    this.updatedProject = "";
    this.accDetails = [];
    this.isContraCancelled = false;
    this.fillAccountData = [];
    if (this.isInputDisabled == true) {
      this.disableFormControls();
      this.selectedContraId = this.firstContra;
      this.fetchContraVoucherById();
    }
    else {
      this.selectedContraId = 0;
      this.contraVoucherForm.patchValue({
        voucherdate: this.today
      });

      this.enableFormControls();
      this.tempFillDetails = [];
      this.accDetails = [];
      this.debitValue=0;
      this.creditValue=0;
      this.addRow();
      this.fetchCommonFillData();
      this.fetchAccountPopup();


    }
    return true;
  }

  onClickEditContra() {
    if (!this.isEdit) {
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    if (this.isInputDisabled == false) {
      this.enableFormControls();

    } else {
      this.disableFormControls();
    }
    this.fetchContraVoucherById();
    return true;
  }

  enableFormControls() {
    this.contraVoucherForm.get('currency')?.enable();
    this.contraVoucherForm.get('project')?.enable();
    this.contraVoucherForm.get('reference')?.enable();
    this.contraVoucherForm.get('narration')?.enable();
    this.contraVoucherForm.get('voucherdate')?.enable();
    this.contraVoucherForm.get('exchangerate')?.enable();
  }
  disableFormControls() {
    this.contraVoucherForm.get('currency')?.disable();
    this.contraVoucherForm.get('project')?.disable();
    this.contraVoucherForm.get('reference')?.disable();
    this.contraVoucherForm.get('narration')?.disable();
    this.contraVoucherForm.get('voucherdate')?.disable();
    this.contraVoucherForm.get('exchangerate')?.disable();
  }
  onClickContra(event: any): void {
    if (event.type === 'click') {
      this.selectedContraId = event.row.ID;
      // this.emptyAllSummaryTotalsAndObjects();
      this.fetchContraVoucherById();
    }
  }


  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }

  //left master fill
  fetchJrVoucherMaster(): void {
    this.isLoading = true;
    this.journalVoucherService
      .getDetails(EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true')
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.contraVoucherMaster = response?.data;
          this.firstContra = this.contraVoucherMaster[0].ID
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  //fill voucher number and cost centre
  fetchCommonFillData() {
    this.journalVoucherService.getDetails(EndpointConstant.FILLCOMMONPURCHASEDATA + this.pageId + '&voucherId=' + this.voucherNo)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.commonFillData = response?.data;
          if (this.commonFillData.costCentre && this.commonFillData.costCentre.length > 0) {
            this.projectData = this.commonFillData.costCentre.map((item: any) => ({
              projectcode: item.code,
              projectname: item.description,
              id: item.id
            }));
          }
          this.vocherName = this.commonFillData.vNo?.code;
          this.contraVoucherForm.patchValue({
            vouchername: this.commonFillData.vNo?.code,
            voucherno: this.commonFillData.vNo?.result
          });
          this.formVoucherNo = this.commonFillData.vNo?.result;
        }
      })
  }

  //fill currency dropdown and exchangerate
  fetchCurrencyDropdown() {
    if (this.multiCurrencySupport) {
      this.journalVoucherService
        .getDetails(EndpointConstant.FILLMULTICURRENCYDROPDOWN)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            this.currencyDropdown = response?.data;
            this.currentCurrencyRate = this.currencyDropdown?.[0].currencyRate;
            this.currentcurrencyObj = {
              "id": this.currencyDropdown?.[0].currencyID,
              "value": this.currencyDropdown?.[0].abbreviation
            };
            this.selectedCurrencyId = this.currencyDropdown?.[0].currencyID;
            this.contraVoucherForm.patchValue({
              currency: this.selectedCurrencyId,
              exchangerate: this.currentCurrencyRate
            })
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
  }

  onChangeCurrency(event: any) {
    let currencyId = event.target.value;
    let currencyObj = this.currencyDropdown.find((currency: any) => currency.currencyID == currencyId);
    this.currentCurrencyRate = currencyObj.currencyRate;
    this.currentcurrencyObj = {
      "id": currencyObj.currencyID,
      "value": currencyObj.abbreviation
    };
    this.selectedCurrencyId = currencyObj.currencyID;
    this.contraVoucherForm.patchValue({
      currency: this.selectedCurrencyId,
      exchangerate: this.currentCurrencyRate
    })
  }

  saveCurrencyRate() {
    //currency id and currency rate 
    const exchangeRateValue = this.contraVoucherForm.get('exchangerate')?.value;
    if (confirm('Are you sure you want to update exchange rate for this currency?')) {
      this.journalVoucherService.updateDetails(EndpointConstant.UPDATEEXCHANGERATE + this.selectedCurrencyId + '&exchRate=' + exchangeRateValue, {})
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            if (response.httpCode == 200) {
              this.baseService.showCustomDialogue('Rate updated');
            } else {
              this.baseService.showCustomDialogue('Please try again');
            }

          },
          error: (error) => {
            this.baseService.showCustomDialogue('Please try again');
          },
        });
    }
  }

  //get MultiCurrencySupport settings
  settings: any;

  fetchSettings() {
    const sessionSettings = this.baseService.getLocalStorgeItem('settings');
    this.settings = JSON.parse(sessionSettings);

    // Use reduce to find the relevant settings in one pass
    const { MultiCurrencySupport } = this.settings.reduce(
      (acc: any, setting: any) => {
        switch (setting.Key) {

          case 'MultiCurrencySupport':
            acc.MultiCurrencySupport = setting.Value;
            break;
        }
        return acc;
      },
      {
        MultiCurrencySupport: 0,
      }
    );
    this.multiCurrencySupport = MultiCurrencySupport;
  }



  //account grid
  handleDoubleClick(event: any) {
    if (this.currentColumname != 'accountname' && this.currentColumname != 'amount') {
      this.enableInlineEditing = true;
    }
  }

  onClickSpan(event: any, rowIndex: number, colIndex: number): void {
    this.enableInlineEditing = false;
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditing();

    setTimeout(() => {
      this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }
  handleKeysForInlineEditing() {
    // Handle other keys for inline editing
    const cellid = "cell-" + this.currentRowIndex + "-" + this.currentColIndex;
    const cellelement = document.getElementById(cellid);
    if (cellelement) {
      const columnName = cellelement.getAttribute('data-column-name');
      if (columnName != null) {
        this.currentColumname = columnName;
      }
    }
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
  }

  onClickInput(event: any, rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    this.handleKeysForInlineEditing();

    setTimeout(() => {
      this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }



  accountDetailsObj: any = {
    "accountCode": {},
    "description": "",
    "dueDate": "",
    "amount": null,
    "debit": null,
    "credit": null,
    "billandRef": [{}]
  }
  currentItemTableIndex: number | null = null;

  scrollToCell(rowIndex: number, colIndex: number): void {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // add new row in the grid
  // addRow(itemcodesel = false, event?: KeyboardEvent) {
  //   const allItemCodesFilled = this.accDetails.every(item => item.accountCode.code && item.accountCode.code.trim() !== '');
  //   if (!allItemCodesFilled) {
  //     if (event && event.key === 'Enter') {
  //       this.currentColIndex = -1;
  //       this.currentRowIndex = -1;
  //       this.focusOnTabIndex(13);
  //     }

  //     return false; // Exit the function if any itemCode is empty 
  //   }

  //   this.accDetails.push(this.accountDetailsObj);
  //   this.currentItemTableIndex = this.accDetails.length - 1;
  //   this.accDetails = [...this.accDetails];
  //   this.tempFillDetails = [...this.accDetails];
  //   if (!itemcodesel) {     

  //     this.currentRowIndex++;
  //     this.currentColIndex = 0;
  //     this.scrollToCell(this.currentRowIndex, this.currentColIndex);
  //   } 
  //   this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60); 
  //   return true;  
  // }

  addRow(itemcodesel = false, event?: KeyboardEvent) {
    const allItemCodesFilled = this.accDetails.every(item => item.accountCode.code && item.accountCode.code.trim() !== '');

    if (!allItemCodesFilled) {
      if (event && event.key === 'Enter') {
        this.currentColIndex = -1;
        this.currentRowIndex = -1;
        this.focusOnTabIndex(13);
      }
      return false; // Exit the function if any itemCode is empty 
    }

    // Push a fresh copy of the object to avoid shared references
    const newRow = JSON.parse(JSON.stringify(this.accountDetailsObj));
    this.accDetails.push(newRow);

    this.currentItemTableIndex = this.accDetails.length - 1;
    this.accDetails = [...this.accDetails];
    this.tempFillDetails = [...this.accDetails];

    if (!itemcodesel) {
      this.currentRowIndex++;
      this.currentColIndex = 0;
      this.scrollToCell(this.currentRowIndex, this.currentColIndex);
    }

    this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60);
    return true;
  }



  //fill account pop up
  fetchAccountPopup(): void {
    this.journalVoucherService
      .getDetails(EndpointConstant.FILLCONTRAACCOUNTS)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.fillAccountData = response?.data.map((acc: any) => ({
            accountCode: acc.accountCode,
            accountName: acc.accountName,
            id: acc.id,
            details: acc.description
          }));
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An error occurred', error);
        },
      });
  }

  // onAccountCodeSelected(option: any, rowIndex: number) {

  //   if (option && option !== ""){
  //     let selectedAccountObj: any = {};
  //     this.fillAccountData.forEach((accInfo:any)=>{
  //       if (accInfo.accountCode === option) { 
  //         selectedAccountObj = { 
  //             accountCode: { 
  //                 id: accInfo.id,      
  //                 name: accInfo.accountName,  
  //                 code: accInfo.accountCode,   
  //                 description: accInfo.details    
  //             }, 
  //             description: "", 
  //             dueDate: "" || null,   
  //             debit: 0 as number,      
  //             credit: 0 as number    
  //         }; 
  //     } 
  //     });
  //     if (selectedAccountObj.accountCode) { 
  //       this.accDetails[rowIndex] = selectedAccountObj; 
  //       this.accDetails = [...this.accDetails];  
  //       this.tempFillDetails = [...this.accDetails]; 
  //   }
  //   }
  //   this.setBalance(rowIndex);
  //   this.addRow();

  // }

  onAccountCodeSelected(option: any, rowIndex: number) {
    if (option && option !== "") {
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
            description: null,
            dueDate: null,
            debit: null,
            credit: null
          };
        }
      });

      if (selectedAccountObj.accountCode) {
        this.accDetails[rowIndex] = selectedAccountObj;
        this.accDetails = [...this.accDetails];
        this.tempFillDetails = [...this.accDetails];
      }
    }

    this.setBalance(rowIndex);

    // Add a fresh new row after setting balance
    this.addRow();
  }


  setInitialState() {
    this.isNewBtnDisabled = false;
    this.isEditBtnDisabled = false;
    this.isDeleteBtnDisabled = false;
    this.isSaveBtnDisabled = true;
    this.isInputDisabled = true;
    this.isUpdate = false;
    this.disableFormControls();
  }

  //change in description
  onChangedescp(rowIndex: any, event: any) {
    let desc = event.target.value;
    this.accDetails[rowIndex]['description'] = desc;
    this.tempFillDetails[rowIndex]['description'] = desc;
  }

  //change in duedate
  onChangeDate(rowIndex: any, event: any) {
    let date = event.target.value;
    this.tempFillDetails[rowIndex]['dueDate'] = date;
  }
  updateDueDate(newDate: string, row: any) {
    if (newDate) {
      // Assuming you want to store the date in 'DD/MM/YYYY' format
      const parts = newDate.split('-');
      row.dueDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      row.dueDate = '';  // Handle empty date
    }
  }
  // Function to convert the date into 'YYYY-MM-DD' format for the input field
  convertToDateInputFormat(dateString: string): string {
    if (!dateString) return '';  // Return empty if no date exists

    const parts = dateString.split('/');
    if (parts.length === 3) {
      // Assuming the date is in 'DD/MM/YYYY' format, convert it to 'YYYY-MM-DD'
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // If it's already in 'YYYY-MM-DD', just return it
    return dateString;
  }

  debitValue = 0;
  creditValue = 0;
  DrCr = ""

  // Method to handle debit input changes
  onInputDebit(event: any, rowIndex: number) {
    const value = event.target.value;
    // if (!this.isValidNumber(value)){
    //   alert("Debit must be a number");
    //   return;
    // }
    let accountId = this.accDetails[rowIndex].accountCode.id;
    let DrCr = "C";
    this.checkAdvanceAmount(accountId, rowIndex, DrCr)

    this.tempFillDetails[rowIndex].debit = value;
    this.debitValue = value;
    this.accDetails[rowIndex].credit = null;

    this.tempFillDetails[rowIndex].credit = this.accDetails[rowIndex].credit;// Clear the credit field
    this.advancePayableAmount = parseFloat(value);
  }
  isValidNumber(value: string): boolean {
    // Regex to check valid decimal numbers
    const validNum = /^[0-9]+(\.[0-9]*)?$/;

    return validNum.test(value);
  }

  // Method to handle credit input changes
  onInputCredit(event: any, rowIndex: number) {
    const value = event.target.value;
    // if (!this.isValidNumber(value)){
    //   alert("Credit must be a number");
    //   return;
    // }
    let accountId = this.accDetails[rowIndex].accountCode.id;
    let DrCr = "D";
    this.checkAdvanceAmount(accountId, rowIndex, DrCr)
    this.accDetails[rowIndex].credit = value;
    this.tempFillDetails[rowIndex].credit = value;
    this.creditValue = value;
    this.accDetails[rowIndex].debit = null;
    this.tempFillDetails[rowIndex].debit = this.accDetails[rowIndex].debit; // Clear the debit field
    this.advancePayableAmount = parseFloat(value);


  }

  setBalance(rowIndex: number) {
    this.debitValue = this.calculateDebitTotal();
    this.creditValue = this.calculateCreditTotal();

    if (this.debitValue > 0 && this.debitValue > this.creditValue) {
      this.accDetails[rowIndex].credit = this.debitValue - this.creditValue;
      this.accDetails[rowIndex].debit = null;
      this.DrCr = "C";
    }
    else if (this.creditValue > 0 && this.creditValue > this.debitValue) {
      this.accDetails[rowIndex].debit = this.creditValue - this.debitValue;
      this.accDetails[rowIndex].credit = null;
      this.DrCr = "D";
    }

  }
  calculateDebitTotal() {
    let total = 0.0000;
    this.accDetails.forEach(function (item) {
      total = total + Number(item.debit);
    });
    return total;
  }
  calculateCreditTotal() {
    let total = 0.0000;
    this.accDetails.forEach(function (item) {
      total = total + Number(item.credit);
    });
    return total;
  }

  //fill contra voucher by id
  fetchContraVoucherById(): void {
    this.journalVoucherService
      .getDetails(EndpointConstant.FILLPURCHASEBYID + this.selectedContraId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentContra = response?.data;
          this.FillContraDetails();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  FillContraDetails() {
    let transactionDetails = this.currentContra?.transaction.fillTransactions;
    let transactionEntries: any = this.currentContra?.transaction.fillTransactionEntries;
    //this.referenceData = this.currentContra?.transaction.fillVoucherAllocationUsingRef;
    this.contraVoucherForm.patchValue({
      vouchername: this.vocherName,
      voucherno: transactionDetails.transactionNo,
      voucherdate: transactionDetails.date ? new Date(transactionDetails.date) : null,
      reference: transactionDetails.referenceNo,
      narration: transactionDetails.commonNarration,
      currency: transactionDetails.currencyID,
      exchangerate: transactionDetails.exchangeRate
    });
    this.formVoucherNo = transactionDetails.transactionNo;
    //set project data...
    if (transactionDetails.projectName != null) {
      this.onProjectSelected(transactionDetails.projectName);
    }
    // this.ClearFields();
    this.setGridDetailsFromFill(transactionEntries);
    this.addRow();

  }

  setGridDetailsFromFill(transactionEntries: any) {
    if (transactionEntries && transactionEntries.length > 0) {
      // Clear existing grid data
      this.accDetails = [];

      // Loop through transactionEntries and map data to grid format
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
          billandRef: trn.referenceNo ?? null 
        };

        // Push the mapped data to accDetails
        this.accDetails.push(newRow);
      });

      // Update the tempFillDetails array
      this.tempFillDetails = [...this.accDetails];

      this.debitValue = this.accDetails.reduce((sum, row) => {
        return sum + (row.debit || 0); // Add 0 if debit is null or undefined
      }, 0);

      this.creditValue = this.accDetails.reduce((sum, row) => {
        return sum + (row.credit || 0); // Add 0 if debit is null or undefined
      }, 0);

      // Dynamically adjust table height
      this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60);
      // Log for debugging      
    } else {
      console.warn('No transaction entries found to populate the grid.');
    }
  }

  //save contra voucher
  onClickSaveContraVoucher() {
    if (this.contraVoucherForm.value.project) {
      this.projectData.forEach((element: any) => {
        if (element.projectname == this.contraVoucherForm.value.project) {
          this.selectedProjectObj = {
            "id": element.id,
            "name": element.projectcode,
            "code": element.projectname,
            "description": ""
          };
        }
      });
    }
    const filteredDetails = this.accDetails.filter((row) => row.accountCode && row.accountCode.code);
    if (filteredDetails.length < 1) {
      alert("Account Details are empty");
      return;
    }
    const totalDebit = filteredDetails.reduce((sum, row) => {
      const debitValue = parseFloat(row.debit) || 0;
      return sum + debitValue;
    }, 0);
    const totalCredit = filteredDetails.reduce((sum, row) => {
      const creditValue = parseFloat(row.credit) || 0;
      return sum + creditValue;
    }, 0);
    if (totalCredit != totalDebit) {
      alert("Debit and Credit values must tally !!!");
      return;
    }

    if (totalCredit <= 0 || totalDebit <= 0) {
      alert("Amount must be greater than zero");
      return;
    }
    const payload = {
      "id": this.selectedContraId ? this.selectedContraId : 0,
      "voucherNo": this.formVoucherNo,
      "voucherDate": this.contraVoucherForm.value.voucherdate,
      "narration": this.contraVoucherForm.value.narration,
      "costCentre": this.selectedProjectObj,
      "referenceNo": this.contraVoucherForm.value.reference,
      "currency": this.currentcurrencyObj,
      "exchangeRate": this.contraVoucherForm.value.exchangeRate,
      "accountData": filteredDetails,

    };
    if (this.isUpdate) {
      this.updateCallback(payload);
    } else {
      this.createCallback(payload);
    }
    return true;
  }

  createCallback(payload: any) {

    this.journalVoucherService.saveDetails(EndpointConstant.SAVEJOURNAL + this.pageId + '&VoucherId=' + this.voucherNo, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status];
          alert(message);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Journal Voucher', error);
        },
        complete: () => {
          this.selectedContraId = this.firstContra;
          //this.fetchJournalVoucherById();
          this.fetchJrVoucherMaster();
          this.setInitialState();
          this.onClickNewContraVoucher();
        }
      });
  }

  updateCallback(payload: any) {
    this.journalVoucherService.updateDetails(EndpointConstant.UPDATEJOURNAL + this.pageId + '&voucherId=' + this.voucherNo, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status];
          alert(message);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error in Updating Journal Voucher', error);
        },
        complete: () => {
          this.selectedContraId = this.firstContra;
          this.fetchContraVoucherById();
          this.fetchJrVoucherMaster();
          this.setInitialState();
          this.onClickNewContraVoucher();
        }
      });
  }

  //Advance popup

  showAdvanceDetails = false;
  advanceAmountObj: any = [];
  advanceAmount = 0.0000;
  allocationAmt = 0;
  selectedAdvanceData: any = [];
  advancePayableAmount = 0.00;
  referenceData: any = {};
  billAndRef: Array<BillsAndRef> = [];

  closeAdvancePopup(response: any, rowIndex: number) {
    if (Object.keys(response).length > 0) {
      this.accDetails[rowIndex] = {
        ...this.accDetails[rowIndex],
        billandRef: response?.selectedAdvanceData ?? null,
        //advanceAmountObj: response.advanceData ?? null,
      };
      this.accDetails = [...this.accDetails]; // Update grid data
    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showAdvanceDetails = false;
  }

  checkAdvanceAmount(accountId: number, rowIndex: number, DrCr: any) {
    let voucherDate = this.contraVoucherForm.get('voucherdate')?.value;

    if (!voucherDate) {
      alert('Invalid Date');
      return false;
    }
    voucherDate = this.datePipe.transform(voucherDate, 'MM-dd-YYYY');

    // Call the API to fetch advance details
    this.journalVoucherService
      .getDetails(EndpointConstant.FILLADVANCE + accountId + '&voucherId=' + this.voucherNo + '&date=' + voucherDate + '&drcr=' + DrCr)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          const advanceData = response?.data;

          if (advanceData && Array.isArray(advanceData)) {
            // Update the advanceAmountObj for the specific row
            this.accDetails[rowIndex].billandRef = advanceData;

          }

        },
        error: (error) => {
          console.error('An Error Occurred:', error);
        },
      });

    return true;
  }

  onClickAdvanceAmountOption(event: KeyboardEvent, rowIndex: number): void {

    if (event.key === 'Enter' || event.key === 'Tab') {
      this.allocationAmt = this.accDetails[rowIndex].credit;
      event.preventDefault();
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
      if (this.accDetails[rowIndex].billandRef.length < 1)
        this.showAdvanceDetails = false;
      else
        this.showAdvanceDetails = true;

    }

  }

  //delete contra voucher
  showDeletePopup = false;
  onClickDeleteContra(event: Event) {
    console.log("Hi");
    event.preventDefault();
    if (!this.isDelete) {
      alert('Permission Denied!');
      return false;
    }
    this.showDeletePopup = true;
    this.showDeleteOptions = false;
    setTimeout(() => {
      if (this.reasonInput) {
        this.reasonInput.nativeElement.focus();
      }
    }, 0);
    return true;
  }

  closeDeletePopup() {
    this.showDeletePopup = false;
  }

  confirmDelete() {
    this.journalVoucherService.deleteDetails(EndpointConstant.DELETEPURCHASE + this.selectedContraId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status];
          alert(message);

        },
        error: () => {
          this.isLoading = false;
          console.error('Error Deleting Journal Voucher');
          alert('Failed to Delete Journal Voucher.');
        },
        complete: () => {
          this.selectedContraId = 0;
          this.showDeletePopup = false;
          this.fetchJrVoucherMaster();
          this.setInitialState();
          this.onClickNewContraVoucher();
        }
      });
  }

  //cancel contra voucher
  showCancelPopup = false;
  cancelReason: string = "";
  onClickCancelContra(event: Event) {
    event.preventDefault();
    if (!this.isCancel) {
      alert('Permission Denied!');
      return false;
    }
    this.showCancelPopup = true;
    this.toggleDeleteOptions();
    return true;
  }
  confirmCancel() {
    this.journalVoucherService.updateDetails(EndpointConstant.CANCELPURCHASE + this.selectedContraId + '&pageId=' + this.pageId + '&reason=' + this.cancelReason, {})
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.showDeletePopup = false;
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status];
          alert(message);
        },
        error: () => {
          this.isLoading = false;
          console.error('Error Cancelling Journal Voucher');
          alert('Failed to Cancel Journal Voucher.');
        },
        complete: () => {
          this.cancelReason = "";
          this.selectedContraId = 0;
          this.showCancelPopup = false;
          this.fetchJrVoucherMaster();
          this.setInitialState();
          this.onClickNewContraVoucher();
        }
      });
  }

  closeCancelPopup() {
    this.showCancelPopup = false;
  }

  //shortcut keys

  //delete row from grid
  deleteItemGrid(index: any) {
    if (confirm("Are you sure you want to delete this details?")) {
      if (this.accDetails.length == 1) {
        this.noGridItem = true;
        this.accDetails = [];
        this.accDetails.push(this.accountDetailsObj);
      } else if (index !== -1) {
        this.accDetails.splice(index, 1);
        this.selected = [];
      }
      this.accDetails = [...this.accDetails];
      this.tempFillDetails = [...this.accDetails];
      this.selectedRowIndex = -1
    }
    return true;
  }
  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
  }
  callKeydownEventToDropdown(fieldName: any, event: KeyboardEvent): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.onKeyDown(event);
    }
  }

  toggleLeftSection() {
    this.showLeftSection = !this.showLeftSection;
    // Trigger the recalculation on window resize
    setTimeout(() => this.ngxTable.recalculate(), 0);
    setTimeout(() => this.setSummaryCellWidths(), 0);
  }

  setSummaryCellWidths() {
    setTimeout(() => {
      if (this.tableWrapper && this.summaryCells) {

        const tableWrapperElement = this.tableWrapper.nativeElement;
        const totalWidth = tableWrapperElement.offsetWidth;
        const totalColumns = this.summaryCells.length;
         const tableHeaderCells = this.tableWrapper.nativeElement.querySelectorAll('datatable-body-cell');
       
        this.summaryCells.forEach((cell, index) => {
            const columnWidth = (totalWidth/totalColumns)+10;
         // tableHeaderCells[index].style.width = `${columnWidth}px`;
          // if (headerCell) {
            cell.nativeElement.style.width = `${columnWidth}px`;

            // Set the width of the input element inside the summary cell, if it exists
              const inputElement = cell.nativeElement.querySelector('input');
              if (inputElement) {
                inputElement.style.width = `${columnWidth}px`;
              }

              // Set the width of the div element inside the summary cell, if it exists
              const divElement = cell.nativeElement.querySelector('div');
              if (divElement) {
                divElement.style.width = `${columnWidth}px`;
              }

          //}
        });
      
      }
    }, 0);
  } 
  selectedIRowIndex=1;
  onKeyDown(event: KeyboardEvent) {    

    this.selectedIRowIndex = -1;    
    if (event.altKey && event.ctrlKey && event.key === 'm') {  

      event.preventDefault(); 
      this.toggleLeftSection(); 
    } 
    if (event.ctrlKey && event.key === 'Enter') {     

      if (this.currentRowIndex < this.tempFillDetails.length - 1) { 
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
  
    if (targetElement instanceof HTMLInputElement || targetElement instanceof HTMLTextAreaElement) { 
      if(targetElement.selectionStart != null){ 
        cursorPosition = targetElement.selectionStart; 
      }      
      targetlength = targetElement.value.length;     
    } 
 
  if (targetElement instanceof HTMLInputElement && (targetElement.name === 'debit' || targetElement.name === 'credit')) {  

    const key = event.key;   

    if (!/^[0-9]$/.test(key) && key !== 'Backspace' && key !== 'Delete' && key !== 'Tab' && key !== 'ArrowLeft' && key !== 'ArrowRight') { 
      event.preventDefault();  // Prevent non-numeric input 
    } 
  } 

    switch (event.key) { 
        case 'ArrowDown': 
        if(this.enableInlineEditing == false){ 
          event.preventDefault(); 
          if (this.currentRowIndex < this.tempFillDetails.length - 1) { 
            this.currentRowIndex++; 
            this.scrollToCell(this.currentRowIndex,this.currentColIndex); 
            this.enableInlineEditing = false; 
            this.focusGridCell(this.currentRowIndex, this.currentColIndex); 
          }          
         
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

        } 

        break; 

 

        case 'ArrowRight': 
          if(cursorPosition == targetlength){ 
            event.preventDefault(); 
            if (this.currentColIndex < this.tablecolumns.length - 1) { 
              this.currentColIndex++; 
              this.scrollToCell(this.currentRowIndex,this.currentColIndex); 
              this.enableInlineEditing = false;             }         
            this.handleKeysForInlineEditing(); 
            this.focusGridCell(this.currentRowIndex, this.currentColIndex); 
          } 

          break;  

        case 'ArrowLeft':  
               if(cursorPosition == 0 && this.currentColumname != 'accountcode'){ 
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
          this.deleteItemGrid(this.currentRowIndex); 
        } 
        break; 
        case 'Escape': 
        case 'Esc':  
        if(!this.enableInlineEditing){ 
          event.preventDefault(); 
         
          if(this.tempFillDetails.length > 1){ 
            let index = this.tempFillDetails.length - 2; 
            this.deleteItemGrid(index); 
          }           
        } 
        break; 

        case 'Enter': 
          event.preventDefault();   
          this.enableInlineEditing = false;   
          if (this.currentColIndex < this.tablecolumns.length - 1) { 
            this.currentColIndex++; 
            this.scrollToCell(this.currentRowIndex,this.currentColIndex); 
            this.enableInlineEditing = false; 
            this.handleKeysForInlineEditing(); 
            this.focusGridCell(this.currentRowIndex, this.currentColIndex); 
            let currentCoulmn = this.tablecolumns[this.currentColIndex];           

          } else { 

            if (this.currentRowIndex < this.tempFillDetails.length - 1) { 
              this.currentRowIndex++; 
              this.currentColIndex = 0; 
              this.scrollToCell(this.currentRowIndex,this.currentColIndex); 
              this.enableInlineEditing = false;             
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

          event.preventDefault(); 
        } else { 
          event.preventDefault();   
          this.enableInlineEditing = false;  
          if (this.currentRowIndex < this.tempFillDetails.length - 1) { 
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
          const columnName = cellElement.getAttribute('data-column-name');{ 
          if(columnName == 'accountcode' ) 
          this.enableInlineEditing = true; 
          this.currentColumname = columnName; 
          setTimeout(() => { 
            this.callKeydownEventToDropdown(cellId + columnName, event); 
          }, 0); 
        } 
      }         
    break; 
    } 
    return true; 
  } 

  onColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.gridnavigationService.moveToNextRow(this.tempFillDetails, this.focusGridCell.bind(this));
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
        this.gridnavigationService.handleNavigationKey(this.tablecolumns, this.tempFillDetails, this.focusGridCell.bind(this), this.addRow.bind(this));
        break;
    }
  }
}
