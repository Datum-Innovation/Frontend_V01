import { Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { AccountCodeDto, AccountDataDto, ACCOUNTDETAILS, BillsAndRef, BillsAndRefDto, Currency, FinanceFillById, Master, Projects } from '../model/journalvoucher.interface';
import { JournalVoucherService } from '../../services/journalvoucher.service';
import { BaseService, EndpointConstant, GridNavigationService, MenuDataService, SearchableDropdownComponent, STATUS_MESSAGES } from '@dfinance-frontend/shared';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomDialogueComponent } from 'libs/src/lib/components/custom-dialogue/custom-dialogue.component';

@Component({
  selector: 'dfinance-frontend-journalvoucher',
  templateUrl: './journalvoucher.component.html',
  styleUrls: ['./journalvoucher.component.css'],
})
export class JournalvoucherComponent {

  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  isLoading = false;
  pageId = 0;
  destroySubscription: Subject<void> = new Subject<void>();
  tempJournalList: any = [];
  showDeleteOptions: boolean = false;
  selectedJournalId!: number;
  isJournalCancelled = false;
  showTopBar: boolean = false;
  updatedProject = '';
  currentCurrencyRate = 0;
  selectedCurrencyId = 0;
  isMaximized = false;
  showLeftSection: boolean = true;
  currentJournal = {} as FinanceFillById;

  journalVoucherMaster = [] as Array<Master>
  journalVoucherForm!: FormGroup;
  currencyDropdown: any = [] as Array<Currency>;
  currentcurrencyObj = {};
  projectData = [] as Array<Projects>;
  commonFillData: any = [];
  voucherNo = 0;

  projectKeys = ['Project Code', 'Project Name', 'ID'];
  projectreturnField = 'projectname';
  accountCodeKeys = ['Account Code', 'Account Name', 'Details'];
  accountCodeExcludekeys = ['isBillWise', 'isCostCentre', 'id'];
  accountCodereturnField = 'accountCode';
  tempAccountFillDetails: any = [];
  tableHeight = 200;
  selected: any[] = [];
  today = new Date();

  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;
  multiCurrencySupport = 1;
  //tempFillDetails: Array<AccountDataDto> = [];
  fillAccountData = [] as Array<ACCOUNTDETAILS>
  tempFillDetails: any = [];

  accountCodeDto: AccountCodeDto[] = [];
  //accountData: Array<AccountDataDto> = [];
  accountData: AccountDataDto[] = [];
  accDetails: any[] = [];

  tablecolumns = [
    { name: 'SlNo', field: 'id' },
    { name: 'Account Code', field: 'accountcode' },
    { name: 'Account Name', field: 'accountname' },
    { name: 'Description', field: 'description' },
    { name: 'DueDate', field: 'duedate' },
    { name: 'Debit', field: 'debit' },
    { name: 'Credit', field: 'credit' }
  ];

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;

  @ViewChild('tableWrapper', { static: true }) tableWrapper!: ElementRef;
  @ViewChildren('summaryCell') summaryCells!: QueryList<ElementRef>;
  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;

  constructor(
    private journalVoucherService: JournalVoucherService,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private datePipe: DatePipe,
    private baseService: BaseService,
    private gridnavigationService: GridNavigationService,
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
    this.journalVoucherForm = this.formBuilder.group({
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
    this.onClickNewJournalVoucher();
    this.fetchCurrencyDropdown();
    this.fetchCommonFillData();
    this.fetchAccountPopup();
  }

  //fill currency Dropdown and exchange rate

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
            this.journalVoucherForm.patchValue({
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
    this.journalVoucherForm.patchValue({
      currency: this.selectedCurrencyId,
      exchangerate: this.currentCurrencyRate
    })
  }

  saveCurrencyRate() {
    //currency id and currency rate 
    const exchangeRateValue = this.journalVoucherForm.get('exchangerate')?.value;
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

  filterJournal(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempJournalList.filter(function (d: any) {
      const trNoMatch = d.TransactionNo.toString().toLowerCase().includes(val.toLowerCase());
      return trNoMatch || !val;
    });
    this.journalVoucherMaster = temp;
  }

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
  fetchJrVoucherMaster(): void {
    this.isLoading = true;
    this.journalVoucherService
      .getDetails(EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true')
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.journalVoucherMaster = response?.data;
          this.firstJournal = this.journalVoucherMaster[0].ID
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  onClickJournal(event: any): void {
    if (event.type === 'click') {
      this.selectedJournalId = event.row.ID;
      // this.emptyAllSummaryTotalsAndObjects();
      this.fetchJournalVoucherById();
    }
  }

  onClickNewJournalVoucher() {
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
    this.journalVoucherForm.reset();
    this.selectedJournalId = 0;
    this.accDetails = [];
    this.updatedProject = "";
    this.isJournalCancelled = false;
    // this.fillAccountData=[];
    if (this.isInputDisabled == true) {

      this.disableFormControls();
      this.selectedJournalId = this.firstJournal;
      this.fetchJournalVoucherById();

    }
    else {
      this.selectedJournalId = 0;     
      this.journalVoucherForm.patchValue({
        voucherdate: this.today
      });

      this.enableFormControls();
      this.tempFillDetails = [];
      this.accDetails = [];
      this.addRow();
      this.fetchCommonFillData();
      this.fetchAccountPopup();


    }
    return true;
  }

  enableFormControls() {
    this.journalVoucherForm.get('currency')?.enable();
    this.journalVoucherForm.get('project')?.enable();
    this.journalVoucherForm.get('reference')?.enable();
    this.journalVoucherForm.get('narration')?.enable();
    this.journalVoucherForm.get('voucherdate')?.enable();
    this.journalVoucherForm.get('exchangerate')?.enable();
  }

  disableFormControls() {
    this.journalVoucherForm.get('currency')?.disable();
    this.journalVoucherForm.get('project')?.disable();
    this.journalVoucherForm.get('reference')?.disable();
    this.journalVoucherForm.get('narration')?.disable();
    this.journalVoucherForm.get('voucherdate')?.disable();
    this.journalVoucherForm.get('exchangerate')?.disable();
  }




  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }




  onScroll(event: any) {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    this.showTopBar = scrollTop > 50 ? true : false;  // Show the bar when scrolled more than 50px
  }

  scrollToTop() {
    const scrollDuration = 600; // Duration in milliseconds
    const startPosition = this.scrollContainer.nativeElement.scrollTop;
    const startTime = performance.now();

    const scrollStep = (timestamp: any) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / scrollDuration, 1);
      const currentScroll = startPosition * (1 - progress);

      this.scrollContainer.nativeElement.scrollTop = currentScroll;

      if (progress < 1) {
        requestAnimationFrame(scrollStep);
      }
    };

    requestAnimationFrame(scrollStep);
  }

  onProjectSelected(option: string): any {
    this.updatedProject = option;
    this.journalVoucherForm.patchValue({
      project: option,
    });
    //this.moveFocusToDropdown('supplier');
  }



  fetchCommonFillData() {
    this.journalVoucherService
      .getDetails(EndpointConstant.FILLCOMMONPURCHASEDATA + this.pageId + '&voucherId=' + this.voucherNo)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.commonFillData = response?.data;
          //set project data..
          if (this.commonFillData.costCentre && this.commonFillData.costCentre.length > 0) {
            this.projectData = this.commonFillData.costCentre.map((item: any) => ({
              projectcode: item.code,
              projectname: item.description,
              id: item.id
            }));
          }
          //setting voucher data..
          this.setVoucherData();

        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  vocherName = "";
  formVoucherNo: any = 0;

  setVoucherData() {
    //set voucher name and number...
    this.vocherName = this.commonFillData.vNo?.code;
    this.journalVoucherForm.patchValue({
      vouchername: this.vocherName,
      voucherno: this.commonFillData.vNo?.result,
    });
    this.formVoucherNo = this.commonFillData.vNo?.result;
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

  enableInlineEditing: boolean = false;
  currentRowIndex: number = -1;
  currentColIndex: number = 0;
  currentColumname: any = "";


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


  onPurchaseTabChange(event: MatTabChangeEvent) {

  }



  handleDoubleClick(event: any) {
    if (this.currentColumname != 'accountname' && this.currentColumname != 'amount') {
      this.enableInlineEditing = true;
    }
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
  }

  //fill journal voucher by id
  fetchJournalVoucherById(): void {
    this.journalVoucherService
      .getDetails(EndpointConstant.FILLPURCHASEBYID + this.selectedJournalId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentJournal = response?.data;
          this.FillJournalDetails();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  FillJournalDetails() {
    let transactionDetails = this.currentJournal?.transaction.fillTransactions;
    let transactionEntries: any = this.currentJournal?.transaction.fillTransactionEntries;
    this.referenceData = this.currentJournal?.transaction.fillVoucherAllocationUsingRef;
    this.journalVoucherForm.patchValue({
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
          billandRef: trn.referenceNo ?? null // Map reference if necessary
        };

        // Push the mapped data to accDetails
        this.accDetails.push(newRow);
      });

      // Update the tempFillDetails array
      this.tempFillDetails = [...this.accDetails];

      // Dynamically adjust table height
      this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60);
      // Log for debugging      
    } else {
      console.warn('No transaction entries found to populate the grid.');
    }
  }



  //account grid begins
  currentItemTableIndex: number | null = null;


  scrollToCell(rowIndex: number, colIndex: number): void {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  // tempFillDetails: any = [];
  accountDetailsObj: any = {
    "accountCode": {},
    "description": "",
    "dueDate": "",
    "amount": null,
    "debit": null,
    "credit": null,
    "billandRef": [{}]
  }


  // accountDto: AccountDataDto = {
  //   accountCode: {
  //     id: 0,
  //     code: "",
  //     name: "",
  //     description: ""
  //   },
  //   description: "",
  //   dueDate: null,
  //   amount: null,
  //   debit: null,
  //   credit: null,
  //   billandRef: null

  // }


  // addRow(accCodeSel = false, event?: KeyboardEvent) {
  //   // Check if all account codes are filled
  //   const allAccCodesFilled = this.accDetails.every(
  //     acc => acc.accountCode.code && acc.accountCode.code.trim() !== ''
  //   );

  //   if (!allAccCodesFilled) {
  //     if (event && event.key === 'Enter') {
  //       this.currentColIndex = -1;
  //       this.currentRowIndex = -1;
  //       this.focusOnTabIndex(13);
  //     }
  //     return false;
  //   }

  //   // Create a new row with default values
  //   const newRow: AccountDataDto = {
  //     accountCode: { id: 0, code: '', name: '', description: '' },
  //     description: '',
  //     dueDate: null,
  //     amount: null,
  //     debit: null,
  //     credit: null,
  //     billandRef: [],
  //   };

  //   // Push the new row to accDetails
  //   this.accDetails.push(newRow);

  //   // Update indices and table height
  //   this.currentItemTableIndex = this.accDetails.length - 1;
  //   this.tempFillDetails = [...this.accDetails]; // Update temp array if necessary
  //   this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60); // Update table height dynamically

  //   if (!accCodeSel) {
  //     this.currentRowIndex++;
  //     this.currentColIndex = 0;
  //     this.scrollToCell(this.currentRowIndex, this.currentColIndex); // Scroll to the new cell
  //   }

  //   return true; // Signal success
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

    this.accDetails.push(this.accountDetailsObj);

    this.currentItemTableIndex = this.accDetails.length - 1;

    this.accDetails = [...this.accDetails];

    this.tempFillDetails = [...this.accDetails];

    if (!itemcodesel) {

      //set row and column index.... 

      this.currentRowIndex++;

      this.currentColIndex = 0;

      this.scrollToCell(this.currentRowIndex, this.currentColIndex);// Reset column index to 0 for the new row 

    }

    // Increase table height dynamically, assuming rowHeight = 50px 

    this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60); // Header and footer height = 100px 



    return true;

  }



  onChangedescp(rowIndex: any, event: any) {
    let desc = event.target.value;
    this.accDetails[rowIndex]['description'] = desc;
    this.tempFillDetails[rowIndex]['description'] = desc;
  }
  onClickInput(event: any, rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    this.handleKeysForInlineEditing();

    setTimeout(() => {
      this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }

  //account popup
  fetchAccountPopup(): void {
    this.journalVoucherService
      .getDetails(EndpointConstant.ACCOUNTCODEPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.fillAccountData = response?.data.map((acc: any) => ({
            accountCode: acc.accountCode,
            accountName: acc.accountName,
            id: acc.id,
            details:acc.description
          }));
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An error occurred', error);
        },
      });
  }


  onAccountCodeSelected(option: any, rowIndex: number) {
    if (option && option !== "") {
      // Find the selected account from fillAccountData
      const selectedAccountObj = this.fillAccountData.find(
        (accInfo: any) => accInfo.accountCode === option
      );
  
      if (selectedAccountObj) {
        // Ensure accountData is initialized
        if (!this.accountData) {
          this.accountData = [];
        } 
        
        // Update the specific row in accountData
        this.accountData[rowIndex] = {
          ...this.accountData[rowIndex],
          accountCode: {
            id: selectedAccountObj.id,
            code: selectedAccountObj.accountCode,
            name: selectedAccountObj.accountName,
            description: selectedAccountObj.details,
          },
          description: this.accountData[rowIndex]?.description??null, 
          amount: this.accountData[rowIndex]?.amount ?? null,
          debit: this.accountData[rowIndex]?.debit ?? null,
          credit: this.accountData[rowIndex]?.credit ?? null,
          dueDate: this.accountData[rowIndex]?.dueDate ?? null,
          billandRef: this.selectedAdvanceData ?? null,
        };
  
        
        this.accDetails = [...this.accDetails];
        // Add or update accountData rows into accDetails
        if (this.accDetails[rowIndex]) {
          // Update the row if it already exists
          this.accDetails[rowIndex] = { ...this.accountData[rowIndex] };
        } else {
          // Add a new row if it doesn't exist
          this.accDetails.push({ ...this.accountData[rowIndex] });
        }
  
        // Remove invalid rows if necessary
        this.accDetails = this.accDetails.filter(
          (row) => row.accountCode && Object.keys(row.accountCode).length > 0
        );
  
       
  
        // Update tempFillDetails if required
        this.tempFillDetails = [...this.accDetails];
      }
  
      // Add a new empty row if required
      this.addRow(true);
  
      // Recalculate the balance
      this.setBalance(rowIndex);
    }
  }
  

  

  debitValue = 0;
  creditValue = 0;
  DrCr = "";
  // Method to handle credit input changes
  onInputCredit(event: any, rowIndex: number) {
    const value = event.target.value;
    if (!this.isValidNumber(value)){
      alert("Credit must be a number");
      return;
    }
    let accountId = this.accDetails[rowIndex].accountCode.id;
    let DrCr = "D";
    this.checkAdvanceAmount(accountId, rowIndex, DrCr)
    
   // this.accDetails[rowIndex].credit=value;
    this.tempFillDetails[rowIndex].credit = value;
    this.creditValue = value;
    this.accDetails[rowIndex].debit = null;
    this.tempFillDetails[rowIndex].debit = this.accDetails[rowIndex].debit; // Clear the debit field
    this.advancePayableAmount = parseFloat(value);


  }



  // Method to handle debit input changes
  onInputDebit(event: any, rowIndex: number) {
    const value = event.target.value;
    if (!this.isValidNumber(value)){
      alert("Debit must be a number");
      return;
    }
    let accountId = this.accDetails[rowIndex].accountCode.id;
    let DrCr = "C";
    this.checkAdvanceAmount(accountId, rowIndex, DrCr)
   
  //  this.accDetails[rowIndex].debit = value;
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

  setBalance(rowIndex: number) {
    this.debitValue = this.calculateDebitTotal();
    this.creditValue = this.calculateCreditTotal();

    if (this.debitValue > 0 && this.debitValue > this.creditValue) {
      //if(this.accDetails[rowIndex].credit===null)
      // {
      this.accDetails[rowIndex].credit = this.debitValue - this.creditValue;
      this.accDetails[rowIndex].debit = null;
      // this.creditValue+=this.creditValue;
      this.DrCr = "C";
      // }
    }
    else if (this.creditValue > 0 && this.creditValue > this.debitValue) {
      //if(this.accDetails[rowIndex].debit===null)
      // {
      this.accDetails[rowIndex].debit = this.creditValue - this.debitValue;
      this.accDetails[rowIndex].credit = null;
      this.DrCr = "D";
      // }
    }

    //}
  }

  calculateDebitTotal() {
    let total = 0.0000;
    this.accDetails.forEach(function (item) {
      total = total + Number(item.debit);
    });
    return total;
    //return this.baseService.formatInput(total);
  }
  calculateCreditTotal() {
    let total = 0.0000;
    this.accDetails.forEach(function (item) {
      total = total + Number(item.credit);
    });
    return total;
    //return this.baseService.formatInput(total);
  }

  //save journal voucher

  selectedProjectObj: any = {};
  isUpdate: boolean = false;
  firstJournal!: number

  onClickSaveJournalVoucher() {    
    if (this.journalVoucherForm.value.project) {
      this.projectData.forEach((element: any) => {
        if (element.projectname == this.journalVoucherForm.value.project) {
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
    const payload = {
      "id": this.selectedJournalId ? this.selectedJournalId : 0,
      "voucherNo": this.formVoucherNo,
      "voucherDate": this.journalVoucherForm.value.voucherdate,
      "narration": this.journalVoucherForm.value.narration,
      "costCentre": this.selectedProjectObj,
      "referenceNo": this.journalVoucherForm.value.reference,
      "currency": this.currentcurrencyObj,
      "exchangeRate": 1,
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
          this.selectedJournalId = this.firstJournal;
          //this.fetchJournalVoucherById();
          this.fetchJrVoucherMaster();
          this.setInitialState();
          this.onClickNewJournalVoucher();
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
          this.selectedJournalId = this.firstJournal;
          this.fetchJournalVoucherById();
          this.fetchJrVoucherMaster();
          this.setInitialState();
          this.onClickNewJournalVoucher();
        }
      });
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

  //edit journal voucher
  onClickEditJournalVoucher() {
  
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
    this.fetchJournalVoucherById();
    // this.fetchCommonFillData();
    // this.fetchAccountPopup();


    return true;
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
      this.accountData[rowIndex] = {
        ...this.accountData[rowIndex],
        billandRef: response?.selectedAdvanceData ?? null,
        // advanceAmountObj: response.advanceData ?? null,
      };
      this.accDetails = [...this.accDetails]; // Update grid data
    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showAdvanceDetails = false;
  }
  


  setVoucherAllocationUsingReference() {
    if (this.referenceData) {
      this.advancePayableAmount = this.referenceData.amount;
    }
  }


  checkAdvanceAmount(accountId: number, rowIndex: number, DrCr: any) {   
    let voucherDate = this.journalVoucherForm.get('voucherdate')?.value;

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
            this.accountData[rowIndex].billandRef = advanceData;
           
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
        if(this.accountData[rowIndex].billandRef.length<1)
        this.showAdvanceDetails = false;
      else
      this.showAdvanceDetails = true;

    }

  }

  //delete journal
  showDeletePopup = false;

  onClickDeleteJournal(event: Event) {
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
    this.journalVoucherService.deleteDetails(EndpointConstant.DELETEPURCHASE + this.selectedJournalId + '&pageId=' + this.pageId)
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
          this.selectedJournalId = 0;
          this.showDeletePopup = false;
          this.fetchJrVoucherMaster();
          this.setInitialState();
          this.onClickNewJournalVoucher();
        }
      });
  }

  //cancel journal

  showCancelPopup = false;
  cancelReason: string = "";

  onClickCancelJournal(event: Event) {
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
    this.journalVoucherService.updateDetails(EndpointConstant.CANCELPURCHASE + this.selectedJournalId + '&pageId=' + this.pageId + '&reason=' + this.cancelReason, {})
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
          this.selectedJournalId = 0;
          this.showCancelPopup = false;
          this.fetchJrVoucherMaster();
          this.setInitialState();
          this.onClickNewJournalVoucher();
        }
      });
  }

  closeCancelPopup() {
    this.showCancelPopup = false;
  }

  //shortcut keys

  setSummaryCellWidths() {
    setTimeout(() => {
      if (this.tableWrapper && this.summaryCells) {

        const tableWrapperElement = this.tableWrapper.nativeElement;
        const totalWidth = tableWrapperElement.offsetWidth;
        const totalColumns = this.summaryCells.length;
        const tableHeaderCells = this.tableWrapper.nativeElement.querySelectorAll('datatable-body-cell');

        this.summaryCells.forEach((cell, index) => {
          const columnWidth = (totalWidth / totalColumns) + 10;
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

  toggleLeftSection() {
    this.showLeftSection = !this.showLeftSection;
    // Trigger the recalculation on window resize
    setTimeout(() => this.ngxTable.recalculate(), 0);
    setTimeout(() => this.setSummaryCellWidths(), 0);
  }
  onKeyDown(event: KeyboardEvent) {
    if (event.altKey && event.ctrlKey && event.key === 'm') {
      event.preventDefault();
      this.toggleLeftSection();
    }
    if (event.ctrlKey) {
      return true;
    }
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
          if (this.currentRowIndex < this.tempFillDetails.length - 1) {
            this.currentRowIndex++;
            this.scrollToCell(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }
          // this.gridnavigationService.moveToNextRow(this.tempItemFillDetails, this.focusGridCell.bind(this));
        }
        break;

      case 'ArrowUp':
        if (this.enableInlineEditing == false && this.currentColumname != 'id') {
          event.preventDefault();
          if (this.currentRowIndex > 0) {
            this.currentRowIndex--;
            this.scrollToCell(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }
          //this.gridnavigationService.moveToPreviousRow(this.focusGridCell.bind(this));
        }
        break;


      case 'Delete':
        if (!this.enableInlineEditing) {
          event.preventDefault();
          //call delete function to delete current row.
          this.deleteItemGrid(this.currentRowIndex);
        }
        break;
      case 'Enter':
        event.preventDefault();

        this.enableInlineEditing = false;
        if (this.currentColIndex < this.tablecolumns.length - 1) {
          this.currentColIndex++;
          this.scrollToCell(this.currentRowIndex, this.currentColIndex);
          this.enableInlineEditing = false;
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          let currentCoulmn = this.tablecolumns[this.currentColIndex];


        } else {
          if (this.currentRowIndex < this.tempFillDetails.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCell(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
            // focusCell(this.currentRowIndex, this.currentColIndex);
          } else {
            this.addRow(false, event);
            this.enableInlineEditing = false;
          }
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        }
        break;
      case 'ArrowRight':
        if (cursorPosition == targetlength) {
          event.preventDefault();
          if (this.currentColIndex < this.tablecolumns.length - 1) {
            this.currentColIndex++;
            this.scrollToCell(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
          }
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
        }
        break;

      case 'ArrowLeft':
        if (cursorPosition == 0) {
          event.preventDefault();
          if (this.currentColIndex > 0) {
            this.currentColIndex--;
            this.scrollToCell(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
            this.handleKeysForInlineEditing();
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }
        }
        break;

      case 'Tab':
        if (event.shiftKey) {
          // Logic for Shift+Tab
          event.preventDefault(); // Prevent the default Shift+Tab behavior

        } else {
          event.preventDefault();
          this.enableInlineEditing = false;

          let currentCoulmn = this.tablecolumns[this.currentColIndex];

          if (this.currentRowIndex < this.tempFillDetails.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCell(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          } else {
            this.addRow();
            this.enableInlineEditing = false;
          }
        }

        break;
      case 'PageDown':
        event.preventDefault();
        const cellId = (event.target as HTMLElement).id;
        const cellElement = document.getElementById(cellId);
        if (cellElement) {
          const columnName = cellElement.getAttribute('data-column-name');
          if (columnName == 'accountname') {
            this.enableInlineEditing = true;
            this.currentColumname = columnName;
            // Add a small timeout to ensure the DOM updates before triggering the dropdown keydown event
            setTimeout(() => {
              this.callKeydownEventToDropdown(cellId + columnName, event);
            }, 0);
          }
        }
        break;
    }
    return true;
  }

  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
  }

  //delete the row from item grid

  selectedRowIndex: any = -1;
  noGridItem = true;

  deleteItemGrid(index: any) {
    if (confirm("Are you sure you want to delete this details?")) {
      if (this.accDetails.length == 1) {
        this.noGridItem = true;
        this.accDetails = [];
        this.accDetails.push(this.accountData);
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

  callKeydownEventToDropdown(fieldName: any, event: KeyboardEvent): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.onKeyDown(event);
    }

  }

}
