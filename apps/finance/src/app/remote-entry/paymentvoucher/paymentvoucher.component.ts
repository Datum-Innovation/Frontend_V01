import { Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Purchase } from '../model/creditnote.interface';
import { ACCOUNTDETAILS, bankPopup, BillsAndRef, CardPopup, ChequePopup, Currency, Department, EpayPopup, FinanceFillById, Master, Projects } from '../model/journalvoucher.interface';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { FinanceVoucherService } from '../../services/financevoucher.service';
import { BaseService, EndpointConstant, GridNavigationService, MenuDataService, STATUS_MESSAGES } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CashPopup } from '../model/financevouchers.interface';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'dfinance-frontend-paymentvoucher',
  templateUrl: './paymentvoucher.component.html',
  styleUrls: ['./paymentvoucher.component.css'],
})
export class PaymentvoucherComponent {

  destroySubscription: Subject<void> = new Subject<void>();
  isMaximized = false;
  isLoading = false;
  isInputDisabled: boolean = true;

  tempPaymentList: any = [];
  paymentMaster = [] as Array<Master>;
  selectedleftrow: any = [];
  SelectionType = SelectionType;
  firstPayment!: number
  selected: any[] = [];

  isUpdate: boolean = false;
  pageId = 0;
  voucherNo = 0;

  //for permission checking
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  //for button enabling 
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  isPaymentCancelled = false;
  showDeleteOptions: boolean = false;

  selectedPaymentId!: number;
  today = new Date();
  tableHeight = 200;

  //currency dropdown
  multiCurrencySupport = 1;
  currencyDropdown: any = [] as Array<Currency>;
  currentCurrencyRate = 0;
  currentcurrencyObj = {};
  selectedCurrencyId = 0;

  //department popup
  departmentData: any = [];
  fillDepartment = [] as Array<Department>
  updatedDepartment = '';
  departmentKeys = ['ID', 'Department']
  departmentreturnField = 'name';
  selectedDepartmentObj: any = {};

  //account grid
  tempFillDetails: any = [];
  accDetails: any[] = [];
  currentRowIndex: number = -1;
  currentColIndex: number = 0;
  currentColumname: any = "";
  enableInlineEditing: boolean = false;

  //payment grid
  paymentFillDetails: any = [];
  payDetails: any[] = [];

  //account popup
  fillAccountData = [] as Array<ACCOUNTDETAILS>
  accountCodeKeys = ['Account Code', 'Account Name', 'Details'];
  accountCodeExcludekeys = ['isBillWise', 'isCostCentre', 'id'];
  accountCodereturnField = 'accountCode';
  currentItemTableIndex: number | null = null;

  //Advance popup

  showAdvanceDetails = false;
  advanceAmountObj: any = [];
  advanceAmount = 0.0000;
  allocationAmt = 0;
  selectedAdvanceData: any = [];
  advancePayableAmount = 0.00;
  referenceData: any = {};
  fillBillAndRefData: any = {};
  billAndRef: Array<BillsAndRef> = [];
  refNos: any;

  //cash popup
  cashPopupObj = [] as Array<CashPopup>;
  cashPopupGridDetails: any = [];
  showCashPopup = false;
  cashAmount: any = 0.0000;

  //card popup
  cardPopupObj = [] as Array<CardPopup>;
  cardPopupGridDetails: any = [];
  showCardPopup = false;
  cardAmount: any = 0.0000;

  //cheque popup
  chequePopupObj = [] as Array<ChequePopup>;
  chequePopupGridDetails: any = [];
  showChequePopup = false;
  chequeAmount: any = 0.0000;
  bankPopupObj = [] as Array<bankPopup>;

  //epay popup
  epayPopupObj = [] as Array<EpayPopup>;
  epayPopupGridDetails: any = [];
  showEpayPopup = false;
  epayAmount: any = 0.0000;

  isDefaultCash = false;


  accountDetailsObj: any = {
    "accountCode": {},
    "description": "",
    "dueDate": "",
    "amount": null,
    "debit": null,
    "credit": null,
    "billandRef": [{}]
  }

  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;

  showTopBar: boolean = false;
  showBottomBar: boolean = false;
  showLeftSection: boolean = true;

  //for commondata-voucher number and cost centre
  projectData = [] as Array<Projects>;
  projectreturnField = 'projectname';
  projectKeys = ['Project Code', 'Project Name', 'ID'];
  updatedProject = '';
  commonFillData: any = [];
  vocherName = "";
  formVoucherNo: any = 0;
  selectedProjectObj: any = {};

  paymentVoucherForm!: FormGroup;

  tablecolumns = [
    { name: 'SlNo', field: 'id' },
    { name: 'Account Code', field: 'accountcode' },
    { name: 'Account Name', field: 'accountname' },
    { name: 'Description', field: 'description' },
    { name: 'DueDate', field: 'duedate' },
    { name: 'Debit', field: 'debit' },
  ];

  paymenttablecolumns = [
    { name: 'SlNo', field: 'id' },
    { name: 'Account Name', field: 'accountname' },
    { name: 'Description', field: 'description' },
    { name: 'Amount', field: 'amount' },
    { name: 'TranType', field: 'trantype' },
  ]

  constructor(
    private financeVoucherService: FinanceVoucherService,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private baseService: BaseService,
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private gridnavigationService: GridNavigationService,
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

  ngOnInit() {

    this.paymentVoucherForm = this.formBuilder.group({
      vouchername: [{ value: '', disabled: true }],
      voucherno: [{ value: '', disabled: true }],
      currency: [{ value: '', disabled: this.isInputDisabled }],
      exchangerate: [{ value: '', disabled: this.isInputDisabled }],
      costcentre: [{ value: '', disabled: this.isInputDisabled }],
      referenceno: [{ value: '', disabled: this.isInputDisabled }],
      narration: [{ value: '', disabled: this.isInputDisabled }],
      voucherdate: [{ value: this.today, disabled: this.isInputDisabled }],
      department: [{ value: '', disabled: this.isInputDisabled }]
    })

    this.fetchPaymentVoucherMaster();
    this.onClickNewPaymentVoucher();
    this.fetchCurrencyDropdown();
    this.fetchCommonFillData();
    this.fetchDepartmentData();
    this.fetchAccountPopup();
    this.fetchCashPopup();
    this.fetchCardPopup();
    this.fetchBankDetails();
    this.fetchChequePopup();
    this.fetchEpayPopup();
    this.fetchDefaultCashAccount();
    this.fetchDefaultCardAccount()

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
  filterPayment(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempPaymentList.filter(function (d: any) {
      const trNoMatch = d.TransactionNo.toString().toLowerCase().includes(val.toLowerCase());
      return trNoMatch || !val;
    });
    this.paymentMaster = temp;
  }

  onSelectLeftTable(event: any) {
  }

  fetchPaymentVoucherMaster(): void {
    this.isLoading = true;
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true')
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.paymentMaster = response?.data;
          this.firstPayment = this.paymentMaster[0].ID
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  //currency 
  fetchCurrencyDropdown() {
    if (this.multiCurrencySupport) {
      this.financeVoucherService
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
  }

  saveCurrencyRate() {
    //currency id and currency rate 
    if (confirm('Are you sure you want to update exchange rate for this currency?')) {
      this.financeVoucherService.updateDetails(EndpointConstant.UPDATEEXCHANGERATE + this.selectedCurrencyId + '&exchRate=' + this.currentCurrencyRate, {})
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

  //fill voucher number and cost centre
  fetchCommonFillData() {
    this.financeVoucherService.getDetails(EndpointConstant.FILLCOMMONPURCHASEDATA + this.pageId + '&voucherId=' + this.voucherNo)
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
          this.paymentVoucherForm.patchValue({
            vouchername: this.commonFillData.vNo?.code,
            voucherno: this.commonFillData.vNo?.result
          });
          this.formVoucherNo = this.commonFillData.vNo?.result;
        }
      })
  }

  //project popup
  onProjectSelected(option: string): any {
    this.updatedProject = option;
    this.paymentVoucherForm.patchValue({
      costcentre: option,
    });
    //this.moveFocusToDropdown('supplier');
  }

  //fill department popup
  fetchDepartmentData() {
    this.financeVoucherService.getDetails(EndpointConstant.DEPARTMENTPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.departmentData = response?.data;
          if (this.departmentData.length > 0) {
            this.fillDepartment = this.departmentData.map((item: any) => ({
              id: item.id,
              name: item.name
            }));
          }

        }
      })
  }

  onDepartmentSelected(option: string): any {
    this.updatedDepartment = option;
    this.paymentVoucherForm.patchValue({
      department: option,
    });
    //this.moveFocusToDropdown('supplier');
  }

  onClickNewPaymentVoucher() {
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
    this.paymentVoucherForm.reset();
    this.selectedPaymentId = 0;
    this.updatedProject = "";
    this.isPaymentCancelled = false;
    this.accDetails = [];


    // this.fillAccountData = [];
    if (this.isInputDisabled == true) {
      this.disableFormControls();
      this.selectedPaymentId = this.firstPayment;
      this.fetchPaymentVoucherById();
    }
    else {
      this.selectedPaymentId = 0;
      this.paymentVoucherForm.patchValue({
        voucherdate: this.today
      });

      this.enableFormControls();
      this.tempFillDetails = [];
      this.paymentFillDetails = [];
      this.accDetails = [];
      //this.debitValue=0;
      //this.creditValue=0;
      this.addRow();
      this.fetchCommonFillData();
      this.cashPopupGridDetails = [];
      this.cardPopupGridDetails = [];
      //this.fetchAccountPopup();
    }
    return true;
  }

  enableFormControls() {
    this.paymentVoucherForm.get('currency')?.enable();
    this.paymentVoucherForm.get('costcentre')?.enable();
    this.paymentVoucherForm.get('referenceno')?.enable();
    this.paymentVoucherForm.get('narration')?.enable();
    this.paymentVoucherForm.get('voucherdate')?.enable();
    this.paymentVoucherForm.get('exchangerate')?.enable();
    this.paymentVoucherForm.get('department')?.enable();
  }
  disableFormControls() {
    this.paymentVoucherForm.get('currency')?.disable();
    this.paymentVoucherForm.get('costcentre')?.disable();
    this.paymentVoucherForm.get('referenceno')?.disable();
    this.paymentVoucherForm.get('narration')?.disable();
    this.paymentVoucherForm.get('voucherdate')?.disable();
    this.paymentVoucherForm.get('exchangerate')?.disable();
    this.paymentVoucherForm.get('department')?.disable();
  }


  //delete and cancel payment voucher
  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }



  onClickPrint() {
    console.log('print');
  }

  onClickPreview() {
    console.log('preview');
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


  //grid begins
  onPaymentTabChange(event: MatTabChangeEvent) {

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

  //shortcut keys
  selectedIDRowIndex = -1;
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  @ViewChild('tableWrapper', { static: true }) tableWrapper!: ElementRef;
  @ViewChildren('summaryCell') summaryCells!: QueryList<ElementRef>;
  noGridItem = true;
  selectedRowIndex: any = -1;

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

  deleteItemGrid(index: any, showConfirm = true) {
    if (showConfirm) {
      if (confirm("Are you sure you want to delete this details?")) {
        this.removeGridItems(index);
      }
    } else {
      this.removeGridItems(index);
    }
  }

  removeGridItems(index: any) {
    if (this.accDetails.length == 1) {
      this.noGridItem = true;
      this.accDetails = [];
      this.accDetails.push(this.accountDetailsObj);
    } else if (index == this.accDetails.length - 1) {
      this.accDetails.splice(index, 1);
      this.selected = [];
      this.accDetails.push(this.accountDetailsObj);
    } else if (index !== -1) {
      this.accDetails.splice(index, 1);
      this.selected = [];
    }

    this.accDetails = [...this.accDetails];
    this.tempFillDetails = [...this.accDetails];
    this.selectedRowIndex = -1
  }

  onKeyDown(event: KeyboardEvent) {
    this.selectedIDRowIndex = -1;
    if (event.altKey && event.ctrlKey && event.key === 'm') {
      event.preventDefault();
      this.toggleLeftSection();
    }

    if (event.ctrlKey && event.key === 'Enter') {
      // Logic for Ctrl+Enter
      if (this.currentRowIndex < this.tempFillDetails.length - 1) {
        this.currentRowIndex++;
        this.currentColIndex = 1;
        this.scrollToCell(this.currentRowIndex, this.currentColIndex);
        this.enableInlineEditing = false;
        this.focusGridCell(this.currentRowIndex, this.currentColIndex);
      } else {
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
    }
    return true;
  }

  handleDoubleClick(event: any) {
    if (this.currentColumname != 'accountname' && this.currentColumname != 'amount') {
      this.enableInlineEditing = true;
    }
  }

  //fill account pop up
  fetchAccountPopup(): void {
    this.financeVoucherService
      .getDetails(EndpointConstant.ACCOUNTCODEPOPUP)
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
            amount: null,
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



    // Add a fresh new row after setting balance
    this.addRow();
  }
  scrollToCell(rowIndex: number, colIndex: number): void {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
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
  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
  }

  onClickInput(event: any, rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    this.handleKeysForInlineEditing();

    setTimeout(() => {
      this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
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

  onChangeDebit(event: any, rowIndex: number) {
    let accountId = this.accDetails[rowIndex].accountCode.id;
    let DrCr = "C";
    this.checkAdvanceAmount(accountId, rowIndex, DrCr)
    let debit = event.target.value;
    this.tempFillDetails[rowIndex]['debit'] = debit;
    this.accDetails[rowIndex]['debit'] = debit;
    this.accDetails[rowIndex]['amount'] = debit;

    this.advancePayableAmount = parseFloat(debit);
  }

  updateDueDate(newDate: string, row: any) {
    if (newDate) {
      // Assuming you want to store the date in 'DD/MM/YYYY' format
      const parts = newDate.split('-');
      row.dueDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      row.dueDate = '';
    }
  }
  // Function to convert the date into 'YYYY-MM-DD' format for the input field
  convertToDateInputFormat(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('/');
    if (parts.length === 3) {
      // Assuming the date is in 'DD/MM/YYYY' format, convert it to 'YYYY-MM-DD'
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // If it's already in 'YYYY-MM-DD', just return it
    return dateString;
  }

  //bill and reference
  // onClickAdvanceAmountOption(event: KeyboardEvent, rowIndex: number): void {

  //   if (event.key === 'Enter' || event.key === 'Tab') {
  //     this.allocationAmt = this.accDetails[rowIndex].credit;
  //     event.preventDefault();
  //     this.renderer.setStyle(document.body, 'overflow', 'hidden');
  //     if (this.accDetails[rowIndex].billandRef.length < 1)
  //       this.showAdvanceDetails = false;
  //     else
  //       this.showAdvanceDetails = true;
  //   }
  // }

  onClickAdvanceAmountOption(event: MouseEvent, rowIndex: number): void {
    this.allocationAmt = this.accDetails[rowIndex].credit;
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  
    if (this.accDetails[rowIndex].billandRef.length < 1) {
      this.showAdvanceDetails = false;
    } else {
      this.showAdvanceDetails = true;
    }
  }
  

  tempBillandRef: any = [];

  closeAdvancePopup(response: any, rowIndex: number) {
    if (Object.keys(response).length > 0) {
      // this.accDetails[rowIndex] = {
      //   ...this.accDetails[rowIndex],
      //   billandRef: response?.selectedAdvanceData ?? null,       
      // };
      this.accDetails = [...this.accDetails];

      this.tempBillandRef = [
        ...this.tempBillandRef,
        ...response.selectedAdvanceData
      ];
      console.log("Bill andRef:" + JSON.stringify(this.tempBillandRef))
      this.refNos = this.tempBillandRef
        .map((item: any) => item.vNo) // Map to the vNo field
        .filter((vNo: string | null | undefined) => !!vNo) // Remove null or undefined vNo values
        .join(',');
      console.log("Ref" + this.refNos)
      this.paymentVoucherForm.patchValue({
        referenceno: this.refNos
      });

    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showAdvanceDetails = false;
  }
  flag = 0;
  //allocation: any[]
  checkAdvanceAmount(accountId: number, rowIndex: number, DrCr: any) {

    let voucherDate = this.paymentVoucherForm.get('voucherdate')?.value;

    if (!voucherDate) {
      alert('Invalid Date');
      return false;
    }
    voucherDate = this.datePipe.transform(voucherDate, 'MM-dd-YYYY');

    // Call the API to fetch advance details
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLADVANCE + accountId + '&voucherId=' + this.voucherNo + '&date=' + voucherDate + '&drcr=' + DrCr)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          const advanceData = response?.data;
          /// load getbyid 
          ///II - sucess  
          /// 2.1= getuser advancedpaymentlist[]   => dta[alocatedinvoice]= [ 5 ]
          ///forach (advcnepaymentlist 10 ) if alocatedin == advacepamentlist { advacepamentlist => checked , aloocatedamount ,balance }
          // ustep :voucherdeatils[]
          if (this.flag === 1) {
            this.accDetails[rowIndex].billandRef = this.fillBillAndRefData;
          }
          else {
            if (advanceData && Array.isArray(advanceData)) {
              // Update the advanceAmountObj for the specific row
              this.accDetails[rowIndex].billandRef = advanceData;

            }
          }


        },

        error: (error) => {
          console.error('An Error Occurred:', error);
        },
      });

    return true;
  }


  //cash popup
  fetchCashPopup() {
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLCASHPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data
          // console.log("CAsh popup:"+JSON.stringify( responseData ,null,2))
          this.cashPopupObj = responseData.map((item: any) => ({
            "accountcode": item.alias,
            "accountname": item.name,
            "id": item.id
          }));
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  closeCashPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showCashPopup = false;

  }
  saveCashPopup(response: any) {
    this.cashAmount = response?.totalamount;
    if (Object.keys(response).length > 0) {
      this.cashPopupGridDetails = response?.gridDetails;
    }
    this.payDetails = [];
    this.cashPopupGridDetails.forEach((item: any) => {
      const newRow = {
        accountname: item.accountCode.name,
        description: item.description ?? '',
        amount: item.amount ?? null,
        trantype: "Cash"
      };
      this.payDetails.push(newRow);
    })
    this.paymentFillDetails = this.paymentFillDetails.filter((item: any) => item.trantype !== 'Cash');
    this.paymentFillDetails = [...this.paymentFillDetails, ...this.payDetails];
    this.showCashPopup = false;
  }
  openCashPopup() {
    const totalDebit = this.accDetails.reduce((sum, item) => {
      return sum + (Number(item.debit) || 0); // Convert to number to ensure numeric addition
    }, 0);
    const totalCredit = this.paymentFillDetails.reduce((sum: number, item: any) => {
      return sum + (Number(item.amount) || 0);
    }, 0);

    console.log("totalDebit",totalDebit)
    console.log("totalCredit",totalCredit)
    this.balanceAmount = totalDebit - totalCredit;
    console.log("balanceAmount",this.balanceAmount)
    console.log("cashPopupGridDetails",this.cashPopupGridDetails.length)
    if (this.cashPopupGridDetails.length == 0 && this.balanceAmount > 0) {
      if (this.isDefaultCash) {
        this.setDefaultAmounttoCash(this.balanceAmount);
      } else {
        if (confirm('Do you want to allocate the balance amount to default cash account')) {
          this.setDefaultAmounttoCash(this.balanceAmount);
        }
      }
    }
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showCashPopup = true;

  }

  //default cash system

  fetchPayType() {
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLPAYTYPE)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data;
          if (responseData) {
            // this.payTypeObj = response?.data.payType;
            this.isDefaultCash = response?.data.defaultCash;

          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  defaultCardAccount: any = {};
  defaultCashAccount: any = {};
  balanceAmount = 0.0000;
  totalAmountPaid = 0.0000;
  grandTotal = 0.0000;

  setDefaultAmounttoCash(bal: number) {
    this.cashPopupGridDetails.push({
      id: this.defaultCashAccount[0].id,
      accountCode: {
        alias: this.defaultCashAccount[0].accountCode,
        name: this.defaultCashAccount[0].accountName,
        id: this.defaultCashAccount[0].id
      },
      description: "",
      amount: bal,
      payableAccount: {}
    });
  }

  // settingCashAmountOnSave(){
  //   this.setDefaultAmounttoCash();    
  //     }

  convertAmount(amount: any): number {
    return Number(amount?.toString().replace(/,/g, '') || 0);
  }
  fetchDefaultCashAccount() {
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLDEFAULTCASHACCOUNT)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.defaultCashAccount = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  //card popup
  fetchCardPopup() {
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLCARDPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data
          this.cardPopupObj = responseData.map((item: any) => ({
            "accountcode": item.alias,
            "accountname": item.name,
            "id": item.id
          }));
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  openCardPopup() {

    const totalDebit = this.accDetails.reduce((sum, item) => {
      return sum + (Number(item.debit) || 0); // Convert to number to ensure numeric addition
    }, 0);
    const totalCredit = this.paymentFillDetails.reduce((sum: number, item: any) => {
      return sum + (Number(item.amount) || 0);
    }, 0);

    this.balanceAmount = totalDebit - totalCredit;

    if (this.cardPopupGridDetails.length == 0 && this.balanceAmount > 0) {
      if (confirm('Do you want to allocate the balance amount to default card account')) {
        this.setDefaultAmounttoCard(this.balanceAmount);
      }
    }
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showCardPopup = true;
  }

  fetchDefaultCardAccount() {
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLDEFAULTCARDACCOUNT)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.defaultCardAccount = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  setDefaultAmounttoCard(bal: number) {
    this.cardPopupGridDetails.push({
      id: this.defaultCardAccount[0].id,
      accountCode: {
        alias: this.defaultCardAccount[0].accountCode,
        name: this.defaultCardAccount[0].accountName,
        id: this.defaultCardAccount[0].id
      },
      description: "",
      amount: bal,
      payableAccount: {}
    });
  }

  saveCardPopup(response: any) {
    this.cardAmount = response?.totalamount;
    if (Object.keys(response).length > 0) {
      this.cardPopupGridDetails = response?.gridDetails;
      //this.calculateBalanceAndPaidAmount();
    }

    this.renderer.removeStyle(document.body, 'overflow');

    this.payDetails = [];
    this.cardPopupGridDetails.forEach((item: any) => {
      const newRow = {
        accountname: item.accountCode.name,
        description: item.description ?? '',
        amount: item.amount ?? null,
        trantype: "Card"
      };
      this.payDetails.push(newRow);
    })
    this.paymentFillDetails = this.paymentFillDetails.filter((item: any) => item.trantype !== 'Card');
    this.paymentFillDetails = [...this.paymentFillDetails, ...this.payDetails];
    this.showCardPopup = false;
  }

  closeCardPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showCardPopup = false;
  }

  //epay popup

  openEpayPopup() {
    this.showEpayPopup = true;
  }

  fetchEpayPopup() {
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLEPAYPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data
          // console.log("CAsh popup:"+JSON.stringify( responseData ,null,2))
          this.epayPopupObj = responseData.map((item: any) => ({
            "accountcode": item.alias,
            "accountname": item.name,
            "id": item.id
          }));
          console.log("Epay popup Data:" + JSON.stringify(this.epayPopupObj, null, 2))
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  saveEpayPopup(response: any) {
    this.epayAmount = response?.totalamount;
    if (Object.keys(response).length > 0) {
      this.epayPopupGridDetails = response?.gridDetails;
    }
    console.log("EpayGrid:" + JSON.stringify(this.epayPopupGridDetails, null, 2))
    this.renderer.removeStyle(document.body, 'overflow');
    this.payDetails = [];
    this.epayPopupGridDetails.forEach((item: any) => {
      const newRow = {
        accountname: item.accountCode.name,
        description: item.description ?? '',
        amount: item.amount ?? null,
        trantype: "Online"
      };
      this.payDetails.push(newRow);
    })
    this.paymentFillDetails = this.paymentFillDetails.filter((item: any) => item.trantype !== 'Online');
    this.paymentFillDetails = [...this.paymentFillDetails, ...this.payDetails];
    this.showEpayPopup = false;
  }

  closeEpayPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showEpayPopup = false;
  }

  //cheque popup
  fetchBankDetails() {//fill bank popup in cheque
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLBANKPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data
          this.bankPopupObj = responseData.map((item: any) => ({
            "accountcode": item.alias,
            "accountname": item.name,
            "id": item.id
          }));
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchChequePopup() {
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLCHEQUEPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data
          this.chequePopupObj = responseData.map((item: any) => ({
            "accountcode": item.alias,
            "accountname": item.name,
            "id": item.id
          }));
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }


  openChequePopup() {
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showChequePopup = true;
  }

  closeChequePopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showChequePopup = false;
  }

  saveChequePopup(response: any) {
    this.chequeAmount = response?.totalamount;
    if (Object.keys(response).length > 0) {
      this.chequePopupGridDetails = response?.gridDetails;
      //this.calculateBalanceAndPaidAmount();
    }

    this.renderer.removeStyle(document.body, 'overflow');
    console.log(" this.chequePopupGridDetails" + JSON.stringify(this.chequePopupGridDetails, null, 2))
    this.payDetails = [];
    this.chequePopupGridDetails.forEach((item: any) => {
      const newRow = {
        accountname: item.pdcPayable.name,
        description: item.description ?? '',
        amount: item.amount ?? null,
        trantype: "Cheque"
      };
      this.payDetails.push(newRow);
    })
    this.paymentFillDetails = this.paymentFillDetails.filter((item: any) => item.trantype !== 'Cheque');
    this.paymentFillDetails = [...this.paymentFillDetails, ...this.payDetails];
    this.showChequePopup = false;
  }

  //save payment voucher
  onClickSavePaymentVoucher() {
    if (this.paymentVoucherForm.value.costcentre) {
      this.projectData.forEach((element: any) => {
        if (element.projectname == this.paymentVoucherForm.value.costcentre) {
          this.selectedProjectObj = {
            "id": element.id,
            "name": element.projectcode,
            "code": element.projectname,
            "description": ""
          };
        }
      });
    }

    if (this.paymentVoucherForm.value.department) {
      this.fillDepartment.forEach((element: any) => {
        if (element.name == this.paymentVoucherForm.value.department) {
          this.selectedDepartmentObj = {
            "id": element.id,
            "name": element.name,
          };
        }
      });
    }

    const filteredDetails = this.accDetails.filter((row) => row.accountCode && row.accountCode.code);
    if (filteredDetails.length < 1) {
      alert("Account Details are empty");
      return;
    }

    const payload = {
      "id": this.selectedPaymentId ? this.selectedPaymentId : 0,
      "voucherNo": this.formVoucherNo,
      "voucherDate": this.paymentVoucherForm.value.voucherdate,
      "narration": this.paymentVoucherForm.value.narration,
      "costCentre": this.selectedProjectObj,
      "department": this.selectedDepartmentObj,
      "referenceNo": this.paymentVoucherForm.value.reference,
      "currency": this.currentcurrencyObj,
      "exchangeRate": this.paymentVoucherForm.value.exchangeRate,
      "accountDetails": filteredDetails,
      "paydetails": [],
      "billandRef": this.tempBillandRef,
      "cash": this.cashPopupGridDetails,
      "card": this.cardPopupGridDetails,
      "epay": this.epayPopupGridDetails,
      "cheque": this.chequePopupGridDetails
    };
    if (this.isUpdate) {
      this.updateCallback(payload);
    } else {
      this.createCallback(payload);
    }
    return true;
  }

  createCallback(payload: any) {
    console.log("Payload:" + JSON.stringify(payload, null, 2))
    console.log("API url:" + EndpointConstant.SAVEPAYMENTVOUHER + this.pageId + '&voucherId=' + this.voucherNo)
    this.financeVoucherService.saveDetails(EndpointConstant.SAVEPAYMENTVOUHER + this.pageId + '&voucherId=' + this.voucherNo, payload)
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
          console.error('Error saving Payment Voucher', error);
        },
        complete: () => {
          this.selectedPaymentId = this.firstPayment;
          //this.fetchJournalVoucherById();
          this.fetchPaymentVoucherMaster();
          this.setInitialState();
          this.onClickNewPaymentVoucher();
        }
      });
  }

  updateCallback(payload: any) {
    console.log("Payload:" + JSON.stringify(payload, null, 2))
    this.financeVoucherService.updateDetails(EndpointConstant.UPDATEPAYMENTVOUHER + this.pageId + '&voucherId=' + this.voucherNo, payload)
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
          this.selectedPaymentId = this.firstPayment;
          //this.fetchContraVoucherById();
          this.fetchPaymentVoucherMaster();
          this.setInitialState();
          this.onClickNewPaymentVoucher();
        }
      });
  }

  //fill payment voucher by id
  currentPayment = {} as FinanceFillById;

  onClickPayment(event: any): void {
    if (event.type === 'click') {
      this.selectedPaymentId = event.row.ID;
      // this.emptyAllSummaryTotalsAndObjects();
      this.fetchPaymentVoucherById();
    }
  }


  fetchPaymentVoucherById(): void {
    this.flag = 1;
    this.financeVoucherService
      .getDetails(EndpointConstant.FILLPURCHASEBYID + this.selectedPaymentId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentPayment = response?.data;
          this.FillPaymentVoucherDetails();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });

    this.financeVoucherService.getDetails(EndpointConstant.FILLVOUCHERALLOCATION + this.selectedPaymentId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (responseData) => {
          this.fillBillAndRefData = responseData.data;

        },
        error: (error) => {
          console.error('An Error Occured', error);
        }
      })
  }

  FillPaymentVoucherDetails() {
    let transactionDetails = this.currentPayment?.transaction.fillTransactions;
    let transactionEntries: any = this.currentPayment?.transaction.fillTransactionEntries;
    let transactionAdditionals = this.currentPayment?.transaction.fillAdditionals;
    let accountEntries = transactionEntries.filter((entry: any) => entry.tranType === null);
    let paymentEntries = transactionEntries.filter((entry: any) => entry.tranType !== null);
    let chequeData = this.currentPayment?.transaction.fillCheques;
    // let cashEntries=transactionEntries.filter((entry: any) => entry.tranType === 'Cash');
    // console.log("PAyment Entries:"+JSON.stringify(paymentEntries,null,2))
    this.referenceData = this.currentPayment?.transaction.fillVoucherAllocationUsingRef;

    //console.log("Allocation Data:"+JSON.stringify( this.referenceData))
    this.paymentVoucherForm.patchValue({
      vouchername: this.vocherName,
      voucherno: transactionDetails.transactionNo,
      voucherdate: transactionDetails.date ? new Date(transactionDetails.date) : null,
      referenceno: transactionDetails.referenceNo,
      narration: transactionDetails.commonNarration,
      currency: transactionDetails.currencyID,
      exchangerate: transactionDetails.exchangeRate,
    });
    this.formVoucherNo = transactionDetails.transactionNo;
    this.isPaymentCancelled = transactionDetails.cancelled;
    //set project data...
    if (transactionDetails.projectName != null) {
      this.onProjectSelected(transactionDetails.projectName);
    }

    if (transactionAdditionals.departmentID != null) {
      this.onDepartmentSelected(transactionAdditionals.department);
    }
    this.FillCashOrCardData(transactionEntries);
    this.FillAccountGridDetails(accountEntries);
    this.FillPaymentGridDetails(paymentEntries);
    this.FillChequeData(chequeData)
    this.addRow();
  }

  //fills the payment grid details
  FillPaymentGridDetails(paymentEntries: any) {
    if (paymentEntries && paymentEntries.length > 0) {
      this.payDetails = [];
      this.paymentFillDetails = [];
      paymentEntries.forEach((trn: any) => {
        const newRow = {
          accountname: trn.name,
          description: trn.description ?? '',
          amount: trn.amount ?? null,
          trantype: trn.tranType
        };
        this.payDetails.push(newRow);
      });
      this.paymentFillDetails = [...this.payDetails];
      this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60);
    }
  }

  //fills the account grid details
  // FillAccountGridDetails(transactionEntries: any) {


  //   if (transactionEntries && transactionEntries.length > 0) {  

  //     this.accDetails = [];    
  //     transactionEntries.forEach((trn: any) => {
  //       let allocationData=this.referenceData.filter((ref:any)=>ref.accountID===transactionEntries.accountId);
  //       const newRow = {
  //         accountCode: {
  //           id: trn.accountId,
  //           code: trn.alias.toString(), 
  //           name: trn.name,
  //           description: trn.description ?? ''
  //         },
  //         description: trn.description ?? '',
  //         amount: trn.amount ?? null,
  //         debit: trn.debit ?? null,
  //         dueDate: trn.dueDate ? new Date(trn.dueDate) : null,
  //         billandRef: allocationData?? null 
  //       };      
  //       this.accDetails.push(newRow);
  //     });

  //     this.tempFillDetails = [...this.accDetails];

  //     this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60);         
  //   } else {
  //     console.warn('No transaction entries found to populate the grid.');
  //   }
  // }

  FillAccountGridDetails(transactionEntries: any) {
    if (transactionEntries && transactionEntries.length > 0) {
      this.accDetails = [];

      // Ensure referenceData is an array
      if (!Array.isArray(this.referenceData)) {
        console.error('referenceData is not an array. Initializing as empty array.');
        this.referenceData = [];
      }

      transactionEntries.forEach((trn: any) => {
        const allocationData = this.referenceData.filter((ref: any) => ref.accountID === trn.accountId);

        const newRow = {
          accountCode: {
            id: trn.accountId,
            code: trn.alias.toString(),
            name: trn.name,
            description: trn.description ?? ''
          },
          description: trn.description ?? '',
          amount: trn.amount ?? null,
          debit: trn.debit ?? null,
          dueDate: trn.dueDate ? new Date(trn.dueDate) : null,
          billandRef: allocationData.length > 0 ? allocationData : null
        };

        this.accDetails.push(newRow);
      });

      this.tempFillDetails = [...this.accDetails];
      this.tableHeight = Math.max(200, this.accDetails.length * 30 + 60);
    } else {
      console.warn('No transaction entries found to populate the grid.');
    }
  }


  //fill the popups of cash and card
  FillCashOrCardData(entries: any) {
    console.log("Entries:" + JSON.stringify(entries, null, 2))
    this.cashAmount = 0;
    this.cardAmount = 0;
    this.cashPopupGridDetails = [];
    this.chequePopupGridDetails = [];
    this.cardPopupGridDetails = [];
    if (entries) {
      entries.forEach((paymentData: any) => {
        let accountData = {
          "accountCode": {
            "alias": paymentData.alias.toString(),
            "name": paymentData.name,
            "id": paymentData.accountId
          },
          "description": paymentData.description,
          "amount": paymentData.amount,
          "payableAccount": {}
        };

        if (paymentData.tranType == 'Cash') {
          this.cashAmount = this.cashAmount + Number(paymentData.amount);
          this.cashPopupGridDetails.push(accountData);
          console.log("Fill Cash popup :" + JSON.stringify(this.cashPopupGridDetails, null, 2))
        }
        if (paymentData.tranType == 'Card') {
          console.log("Fill Card popup :")
          this.cardAmount = this.cardAmount + Number(paymentData.amount);
          this.cardPopupGridDetails.push(accountData);
          console.log(JSON.stringify(this.cardPopupGridDetails, null, 2))
        }

        if (paymentData.tranType == 'Online') {
          console.log("Fill Epay popup :")
          this.epayAmount = this.epayAmount + Number(paymentData.amount);
          this.epayPopupGridDetails.push(accountData);
          console.log(JSON.stringify(this.epayPopupGridDetails, null, 2))
        }
      });
    }
  }

  //fills the cheque popup data
  FillChequeData(chequeInfo: any) {
    this.chequeAmount = 0;
    if (chequeInfo) {
      chequeInfo.forEach((chequeData: any) => {
        this.chequeAmount = this.chequeAmount + Number(chequeData.chqAmount);
        let bankinfo: any = {};
        this.bankPopupObj.map((item: any) => {
          if (item.id == chequeData.bankID) {
            bankinfo = {
              "alias": item.accountcode,
              "name": item.accountname,
              "id": item.id
            };
          }
        });
        let pdcPayableinfo: any = {};
        this.chequePopupObj.map((pdc: any) => {
          if (pdc.id == chequeData.pdcAccountId) {
            pdcPayableinfo = {
              "alias": pdc.accountcode,
              "name": pdc.accountname,
              "id": pdc.id
            };
          }
        });
        let chequeObj = {
          "pdcPayable": pdcPayableinfo,
          "veid": chequeData.veid,
          "cardType": chequeData.cardType,
          "commission": 0,
          "chequeNo": chequeData.chequeNo,
          "chequeDate": new Date(chequeData.chequeDate),
          "clrDays": chequeData.clrDays,
          "bankID": chequeData.bankID,
          "bankName": bankinfo,
          "status": "",
          "partyID": chequeData.partyID,
          "description": chequeData.description,
          "amount": chequeData.chqAmount
        };
        this.chequePopupGridDetails.push(chequeObj);
        console.log("After fetch cheque data:" + JSON.stringify(this.chequePopupGridDetails, null, 2))
      });
    }
    console.log("Fill cheque popup :" + JSON.stringify(this.chequePopupGridDetails, null, 2))


  }

  onClickEditPaymentVoucher() {
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
    this.fetchPaymentVoucherById();
    return true;
  }

  //delete payment voucher
  showDeletePopup = false;
  onClickDeletePaymentVoucher(event: Event) {
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
    this.financeVoucherService.deleteDetails(EndpointConstant.DELETEPURCHASE + this.selectedPaymentId + '&pageId=' + this.pageId)
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
          this.selectedPaymentId = 0;
          this.showDeletePopup = false;
          this.fetchPaymentVoucherMaster();
          this.setInitialState();
          this.onClickNewPaymentVoucher();
        }
      });
  }


  //cancel payment voucher

  showCancelPopup = false;
  cancelReason: string = "";

  onClickCancelPaymentVoucher(event: Event) {
    event.preventDefault();
    if (!this.isCancel) {
      alert('Permission Denied!');
      return false;
    }
    this.showCancelPopup = true;
    this.toggleDeleteOptions();
    return true;
  }

  closeCancelPopup() {
    this.showCancelPopup = false;
  }
  confirmCancel() {
    this.financeVoucherService.updateDetails(EndpointConstant.CANCELPURCHASE + this.selectedPaymentId + '&pageId=' + this.pageId + '&reason=' + this.cancelReason, {})
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
          this.selectedPaymentId = 0;
          this.showCancelPopup = false;
          this.fetchPaymentVoucherMaster();
          this.setInitialState();
          this.onClickNewPaymentVoucher();
        }
      });
  }




}
