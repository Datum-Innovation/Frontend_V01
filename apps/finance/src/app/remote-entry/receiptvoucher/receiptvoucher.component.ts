import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, QueryList, Renderer2, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { BaseService, CustomDialogueComponent, EndpointConstant, GridNavigationService, MainHeaderComponent, MenuDataService, PdfGenerationService, SearchableDropdownComponent, STATUS_MESSAGES } from '@dfinance-frontend/shared';
import { interval, map, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { DatatableComponent, id, SelectionType } from '@swimlane/ngx-datatable';
import { DatePipe, formatDate, formatNumber } from '@angular/common';
import {
  NativeDateAdapter, DateAdapter,
  MAT_DATE_FORMATS
} from '@angular/material/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { ReceiptvoucherService } from '../../services/receiptvoucher.service';
import { cardPopup, cashPopup, chequePopup, CostCentre, Department, ItemOptions, Items, PayType, receiptList, Reference, VoucherType } from '../model/receiptvoucher.interface';
import { ACCOUNTDETAILS, bankPopup, Currency, EpayPopup } from '../journalvoucher.interface';
import { Purchase } from '../model/creditnote.interface';

//  import { BalancedialogComponent } from '../';
declare var $: any;
export const PICK_FORMATS = {
  parse: { dateInput: { month: 'short', year: 'numeric', day: 'numeric' } },
  display: {
    dateInput: 'input',
    monthYearLabel: { year: 'numeric', month: 'short' },
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' }
  }
};

import * as QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
declare module 'jspdf' {
  interface jsPDF {
    autoTable: any; // Declaring the autoTable method for jsPDF
  }
}


class PickDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (displayFormat === 'input') {
      return formatDate(date, 'dd/MM/yyyy', this.locale);
    } else {
      return date.toDateString();
    }
  }
}

// Define the type for your rows
interface DataRow {
  name: string;
  age: number;
  job: string;
}
@Component({
  selector: 'dfinance-frontend-receiptvoucher',
  templateUrl: './receiptvoucher.component.html',
  styleUrls: ['./receiptvoucher.component.scss'],
})
export class ReceiptvoucherComponent {
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  @ViewChild('btngroup') btngroup!: ElementRef;
  @ViewChild('leftsearch') leftsearch!: ElementRef;
  @ViewChild('bottomDiv') bottomDiv!: ElementRef;
  private storageEventHandlerSales!: (event: StorageEvent) => void;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  isInputDisabled: boolean = true;
  receiptvoucherForm!: FormGroup;
  isLoading = false;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  active = true;
  unique = false;
  stockitem = true;
  isUnitsOpen = false;
  isOtherDetailsOpen = false;

  selectedReceiptvoucherId!: number;
  firstReceiptVoucher!: number;
  expiryitem = true;
  rawmaterials = true;
  finishedgoods = true;
  isUpdate: boolean = false;
  updatedBasicUnit = "";
  voucherTypeData = [] as Array<VoucherType>;

  accDetails: any[] = [];
  expireaccDetails: any[] = [];
  copyExpireaccDetails: any = [];

  searchTerm: string = '';

  tempReceiptDetails: any = [];
  showImportReferencePopup = false;
  showAdditionalDetails = false;
  showaccDetails = false;
  showAdditionalChargesPopup = false;
  showCashPopup = false;
  showCardPopup = false;
  showChequePopup = false;
  showItemAdditionalChargesPopup = false;
  showTaxPopup = false;
  showAdvanceDetails = false;


  pageId = 0;
  voucherNo = 0;
  vNoPart1 = '';
  vNoPart2 = '';

  partyId = 0;
  locId = 0;
  currentItemTableIndex: number | null = null;

  grossAmountEditSettings = false;
  isgrossAmountEditable = false;
  autoroundoffEnabled = false;
  itemExpiryManagement = false;
  showStockItemField = false;
  multiCurrencySupport = 0;
  enableSummary = true;
  summaryPosition = 'bottom';

  payTypeObj = [] as Array<PayType>;
  selectedPayType: string | undefined = "";
  selectedPayTypeObj: any = {};
  chequePopupObj = [] as Array<chequePopup>;
  chequePopupGridDetails: any = [];
  cashPopupObj = [] as Array<cashPopup>;
  cashPopupGridDetails: any = [];
  cardPopupObj = [] as Array<cardPopup>;
  cardPopupGridDetails: any = [];

  enableCreditOption = false;
  enableCashOption = false;

  today = new Date();

  selected: any[] = [];
  SelectionType = SelectionType;
  noGridItem = true;

  taxTotal = 0.0000;
  qtyTotal = 0.0000;
  FOCQtyTotal = 0.0000;
  grossAmountTotal = 0.0000;
  discountTotal = 0.0000;
  amountTotal = 0.0000;
  gridItemTotal = 0.0000;
  totalAdditioanalCharges = 0.0000;
  roundValue = 0.0000;
  cashAmount: any = 0.0000;
  cardAmount: any = 0.0000;
  chequeAmount: any = 0.0000;
  balanceAmount = 0.0000;
  totalAmountPaid = 0.0000;
  grandTotal = 0.0000;
  advanceAmount = 0.0000;



  currentBranch = 0;
  currentItemId = 0;

  advanceAmountObj: any = [];



  importedReferenceList: any = [];

  customerSupplierPageId = 0;
  itemmasterPageId = 0;

  settings: any;

  vocherName = "";

  invTransactions: any = [];
  transportationTypeArr: any = [];
  salesmanAreaArr: any = [];
  selectedtransPortationType: any = {};
  selectedSalesAreaObj: any = {};
  defaultCardAccount: any = {};
  defaultCashAccount: any = {};
  defaulthequeAccount:any={};
  defaultEpayAcount:any={};
  advancePayableAmount = 0.00;
  referenceData: any = {};
  showDeleteOptions: boolean = false;
  showDeletePopup = false;
  cancelReason: string = "";
  showCancelPopup = false;
  isReceiptVoucherCancelled = false;
  commonFillData: any = [];
  referenceListarray: any = [];
  accDetailsObj: any = {
    "accountCode": {},
    "description": "",
    "dueDate": "",
    "amount": null,
    "debit": null,
    "credit": null,
    "billandRef": [{}]
  };

  selectedAdvanceData: any = [];
  formVoucherNo: any = 0;
  isReferenceImported = false;


  pricecategoryreturnField = 'pricecategory';
  pricecategoryKeys = ['ID', 'Price Category', 'Perc', 'Rate'];


  isPartySelected: boolean = false;

  //define settings for left side datatable...
  selectedleftrow: any = [];
  //set datatable columns
  enableInlineEditing: boolean = false;
  tablecolumns = [
    { name: '', field: 'id' },
    { name: 'Account Code', field: 'accountcode' },
    { name: 'Account Name', field: 'accountname' },
    { name: 'Description', field: 'description' },
    { name: 'DueDate', field: 'duedate' },
    { name: 'Credit', field: 'credit' },
  ];

  paymenttablecolumns = [
    { name: '', field: 'id' },
    { name: 'Account Name', field: 'accountname' },
    { name: 'Description', field: 'description' },
    { name: 'Amount', field: 'amount' },
    { name: 'TranType', field: 'trantype' },
  ]

  originalTableColumns = [...this.tablecolumns];

  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('gridInput', { static: false }) gridInput!: ElementRef;
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname: any = "";

  @ViewChild('itemcodesummarycell', { static: true }) itemcodesummarycell!: TemplateRef<any>;
  @ViewChild('qtysummarycell', { static: true }) qtysummarycell!: TemplateRef<any>;
  @ViewChild('focqtysummarycell', { static: true }) focqtysummarycell!: TemplateRef<any>;
  @ViewChild('defaultSummaryCell', { static: true }) defaultSummaryCell!: TemplateRef<any>;


  @ViewChild('tableWrapper', { static: true }) tableWrapper!: ElementRef;
  @ViewChild('tableSummary', { static: true }) tableSummary!: ElementRef;
  @ViewChildren('summaryCell') summaryCells!: QueryList<ElementRef>;

  selectedTab = 1;
  showCommonPayment = true;
  showAdditionalPayment = false;

  selectedDetailTab = 1;
  showaccDetailsTab = true;
  showAdditionalDetailsTab = false;

  updatedDeliveryLocation = "";
  deliveryLocationReturnField = 'locationname';
  deliveryLocationKeys = ['ID', 'Location Name', 'Project Name', 'ContactPerson', 'Contact No', 'Address'];

  updatedVehicleNo = "";
  vehicleNoReturnField = 'vehicleNo';
  vehicleNoKeys = ['vehicleNo', 'Name', 'Code', 'ID'];

  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  tableHeight = 200;

  @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;
  isMaximized = false;
  defaultCustomer = 0;
  // Get a reference to the target div
  @ViewChild('targetDiv', { static: false }) targetDiv!: ElementRef;

  defaultQtySetting: any = "";
  prevPayType: number = 0;
  showRateWithTax: any = false;
  private subscription!: Subscription;
  selectedItemRemarks: any = "";
  showRemarksPopup: boolean = false;
  showItemRatePopup: boolean = false;
  prevTransactionData: any = [];
  itemRateItemName: any = "";

  showItemSearchPopup: boolean = false;
  itemSearchCode: any = "";
  itemSearchName: any = "";
  itemSearchPopupOptions: any = [];

  showPriceCategoryPopup: boolean = false;
  priceCategoryOptions: any = [];
  selectedIDRowIndex = -1;
  isFormDirty = false;
  isDefaultCash = false;
  prevColumnValue: any = "";
  selectedPartyId = 0;
  referenceFillData = [] as Array<Reference>;
  selectedRowIndex: any = -1;
  fillItemDataOptions = [] as Array<ItemOptions>;


  receiptMaster = [] as Array<receiptList>;

  //account grid
  tempFillDetails: any = [];

  //account popup
  fillAccountData = [] as Array<ACCOUNTDETAILS>
  accountCodeKeys = ['Account Code', 'Account Name', 'Details'];
  accountCodeExcludekeys = ['isBillWise', 'isCostCentre', 'id'];
  accountCodereturnField = 'accountCode';


  //epay popup
  epayPopupObj = [] as Array<EpayPopup>;
  epayPopupGridDetails: any = [];
  showEpayPopup = false;
  epayAmount: any = 0.0000;


  allocationAmt = 0;
  fillBillAndRefData: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private renderer: Renderer2,
    private ReceiptvoucherService: ReceiptvoucherService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private baseService: BaseService,
    private gridnavigationService: GridNavigationService,
    private menudataService: MenuDataService,
    private dialog: MatDialog,
    private el: ElementRef,
    private pdfgenerationService: PdfGenerationService
  ) {

    // Access query parameters
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
    if (queryParams && queryParams['voucherNo']) {
      this.voucherNo = queryParams['voucherNo'];
    }
    // Initialize storageEventHandler
    this.storageEventHandlerSales = this.onChangeCustomerInStorage.bind(this);
  }

  userTyping: any = false;
  tipContent: any = "";

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  showTopBar: boolean = false;
  showBottomBar: boolean = false;
  // showLeftSection:boolean = false;

  // Get a list of all SearchableDropdownComponent instances
  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;
  activePrintOption = false;
  isMobile = false;
  isTab = false;


  currencyDropdown: any = [] as Array<Currency>;
  currentCurrencyRate = 0;
  currentcurrencyObj = {};
  selectedCurrencyId = 0;


  currentReceiptvoucher = {} as Purchase;
  fillItemsData = [] as Array<Items>;

  bankPopupObj = [] as Array<bankPopup>;

  costcentreData = [] as Array<CostCentre>;
  costcentreReturnField = 'projectname';
  costcentreKeys = ['Project Code', 'Project Name', 'ID'];
  updatedCostcentre = '';


  //department popup
  departmentData: any = [];
  fillDepartment = [] as Array<Department>
  updatedDepartment = '';
  departmentKeys = ['ID', 'Department']
  departmentreturnField = 'name';
  selectedDepartmentObj: any = {};

  //payment grid
  paymentFillDetails: any = [];
  payDetails: any[] = [];

  selectedProjectObj: any = {};

  refNos: any;
  showLeftSection: boolean = true;

  base64String: string = '';
  accid!: number;
  ngOnInit(): void {
    this.receiptvoucherForm = this.formBuilder.group({
      voucherno: [{ value: '', disabled: true }],
      vouchername: [{ value: '', disabled: true }],
      voucherdate: [{ value: '', disabled: true }],
      narration: [{ value: this.today, disabled: this.isInputDisabled }, Validators.required],
      reference: [{ value: '', disabled: this.isInputDisabled }],
      costcentre: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      department: [{ value: '', disabled: this.isInputDisabled }],
      referenceno: [{ value: '', disabled: this.isInputDisabled }]
    });


    this.checkScreenSize();
    this.fetchAllReceiptVouchers();
    this.currentBranch = this.baseService.getLocalStorgeItem('current_branch') ? Number(this.baseService.getLocalStorgeItem('current_branch')) : 0;
    this.fetchSettings();
    this.onClickNewReceiptVoucher();
    this.fetchCommonFillData();
    this.fetchUserPettyCash();
    this.fetchDepartmentData();
    this.fetchAccountPopup();
    this.fetchVoucherType();
    this.fetchCurrencyDropdown();
    this.fetchPayType();
    this.fetchChequePopup();
    this.fetchEpayPopup();
    this.fetchCardPopup();
    this.fetchCashPopup();
    this.fetchBankDetails();
    this.fetchDefaultCardAccount();
    this.fetchDefaultCashAccount();
    window.addEventListener('storage', this.storageEventHandlerSales);

    // Resubscribe to valueChanges after setting initial values
    this.receiptvoucherForm.valueChanges.subscribe(() => {
      if (this.receiptvoucherForm.dirty) {
        this.isFormDirty = true;
      }
    });

    // Set up interval to call the function every 5 minutes
    this.subscription = interval(60000) // 5 minutes in milliseconds
      .subscribe(() => {
        this.fetchAllReceiptVouchers(); // Call the function every 5 minutes
      });
  }

  onScroll(event: any) {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    this.showTopBar = scrollTop > 50 ? true : false;  // Show the bar when scrolled more than 50px
  }

  onPurchaseTabChange(event: MatTabChangeEvent) {

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

  fetchAllReceiptVouchers(): void {
    // this.isLoading = true;
    this.ReceiptvoucherService
      .getDetails(EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true')
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.receiptMaster = response?.data;
          this.tempReceiptDetails = [...this.receiptMaster];
          this.firstReceiptVoucher = this.receiptMaster[0].ID;
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchSettings() {
    const sessionSettings = this.baseService.getLocalStorgeItem('settings');
    this.settings = JSON.parse(sessionSettings);

    // Use reduce to find the relevant settings in one pass
    const { grossAmountEditSettings, autoroundoffEnabled, ItemExpiryManagement, MultiCurrencySupport, SuperImposeItem } = this.settings.reduce(
      (acc: any, setting: any) => {
        switch (setting.Key) {
          case 'GrossAmountEditable':
            acc.grossAmountEditSettings = setting.Value;
            break;
          case 'InventoryToFinanceRoundOff':
            acc.autoroundoffEnabled = setting.Value;
            break;
          case 'ItemExpiryManagement':
            acc.ItemExpiryManagement = setting.Value;
            break;
          case 'MultiCurrencySupport':
            acc.MultiCurrencySupport = setting.Value;
            break;
          case 'SuperImposeItem':
            acc.SuperImposeItem = setting.Value;
            break;
        }
        return acc;
      },
      {
        grossAmountEditSettings: false,
        autoroundoffEnabled: false,
        ItemExpiryManagement: false,
        MultiCurrencySupport: 0,
        SuperImposeItem: false
      }
    );

    this.grossAmountEditSettings = grossAmountEditSettings;
    this.autoroundoffEnabled = autoroundoffEnabled;
    this.itemExpiryManagement = ItemExpiryManagement;
    this.multiCurrencySupport = MultiCurrencySupport;
    this.showStockItemField = SuperImposeItem;
  }

  onClickNewReceiptVoucher() {
    if (!this.isCreate) {
      this.baseService.showCustomDialogue('Permission Denied!');
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
    this.receiptvoucherForm.reset();
    this.selectedReceiptvoucherId = 0;
    // this.updatedCustomer = "";
    // this.updatedProject = "";
    this.accDetails = [];
    this.isReceiptVoucherCancelled = false;
    this.cashAmount = 0;
    this.cardAmount = 0;
    this.chequeAmount = 0;

    // this.fillItemsData = [];
    this.importedReferenceList = [];
    if (this.isInputDisabled == true) {
      this.disbaleFormControls();
      this.selectedReceiptvoucherId = this.firstReceiptVoucher;
      this.fetchReceiptVoucherById();
    } else {
      this.selectedReceiptvoucherId = 0;
      this.paymentFillDetails = [];
      this.receiptvoucherForm.patchValue({
        voucherdate: new Date()
      });

      this.enableFormControls();
      this.currentItemTableIndex = 0;
      //empty item detaills....
      this.tempFillDetails = [];
      this.accDetails = [];
      this.invTransactions = [];

      // empty payment popup grid details card,cash and cheque,tax ....
      this.cashPopupGridDetails = [];
      this.cardPopupGridDetails = [];
      this.chequePopupGridDetails = [];
      // this.taxPopupObj = [];
      this.advanceAmountObj = [];
      this.referenceData = [];
      this.advancePayableAmount = 0;

      // set department and this.costcentreData, naration 
      this.updatedDepartment = "";
      this.updatedCostcentre = "";


      this.addRow();
      this.fetchCommonFillData();
      this.fetchUserPettyCash();
      //set false for is party selected field to false...
      this.isPartySelected = false;
      // this.fetchParty(); 
      setTimeout(() => this.setMaxHeight(), 0);
    }
    return true;
  }

  onClickCancelReceiptVoucher(event: Event) {
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
    this.ReceiptvoucherService.updateDetails(EndpointConstant.CANCELPURCHASE + this.selectedReceiptvoucherId + '&pageId=' + this.pageId + '&reason=' + this.cancelReason, {})
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
          alert('Failed to Cancel Journal Voucher.');
        },
        complete: () => {
          this.cancelReason = "";
          this.selectedReceiptvoucherId = 0;
          this.showCancelPopup = false;
          this.fetchAllReceiptVouchers();
          this.setInitialState();
          this.onClickNewReceiptVoucher();
        }
      });
  }


  setVoucherData() {
    //set voucher name and number...
    this.vocherName = this.commonFillData.vNo?.code;
    this.receiptvoucherForm.patchValue({
      vouchername: this.vocherName,
      voucherno: this.commonFillData.vNo?.result,
    });
    this.formVoucherNo = this.commonFillData.vNo?.result;
  }


  fetchVoucherType() {
    this.partyId = this.selectedPartyId;
    this.ReceiptvoucherService
      .getDetails(EndpointConstant.FILLPURCHASEVOUCHERTYPE + this.voucherNo)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.voucherTypeData = response?.data;

        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  //fill department popup
  fetchDepartmentData() {
    this.ReceiptvoucherService.getDetails(EndpointConstant.DEPARTMENTPOPUP)
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

  //fill account pop up
  fetchAccountPopup(): void {
    this.ReceiptvoucherService
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


  fetchPayType() {
    this.ReceiptvoucherService
      .getDetails(EndpointConstant.FILLPAYTYPE)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data;
          if (responseData) {
            this.payTypeObj = response?.data.payType;
            this.isDefaultCash = response?.data.defaultCash;
            if (this.payTypeObj?.length > 0) {
              this.receiptvoucherForm.patchValue({
                paytype: this.payTypeObj[0].id
              });
              this.onChangePayType();
            }
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  onChangePayType() {
    let paytypeId = this.receiptvoucherForm.get('paytype')?.value;
    this.payTypeObj.find(paytype => {
      if (paytype.id == paytypeId) {
        this.selectedPayType = paytype.name;
        this.selectedPayTypeObj = {
          "id": paytype.id,
          "value": paytype.name
        };
      }
    });
    this.enableCreditOption = false;
    this.enableCashOption = false;
    if (this.selectedPayType == 'Credit') {
      this.enableCreditOption = true;
    } else if (this.selectedPayType == 'Cash') {
      this.enableCashOption = true;
    }
  }

  //bill and reference

  onClickAdvanceAmountOption(event: KeyboardEvent, rowIndex: number): void {
    const key = event.key;
  
    if (key === 'Enter' || key === 'Tab' || key === 'PageDown') {
      console.log(`Key pressed: ${key} at row ${rowIndex}`);
      event.preventDefault();
  
      this.allocationAmt = this.accDetails[rowIndex].credit;
  console.log("Credit amount:"+this.allocationAmt)
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
  
      if (this.accDetails[rowIndex].billandRef?.length < 1) {
        this.showAdvanceDetails = false;
      } else {
        this.showAdvanceDetails = true;
      }
    }
  }
  
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

  // onClickAdvanceAmountOption(event: KeyboardEvent, rowIndex: number): void {
  //   if (event.key === 'Enter' || event.key === 'Tab') {
  //     event.preventDefault();
  
  //     const row = this.accDetails?.[rowIndex];
  //     if (!row) {
  //       console.warn(`No row data found at index ${rowIndex}`);
  //       return;
  //     }
  
  //     this.allocationAmt = row.credit;
  
  //     this.renderer.setStyle(document.body, 'overflow', 'hidden');
  
  //     const billRefs = row.billandRef ?? [];
  //     this.showAdvanceDetails = billRefs.length > 0;
  //   }
  // }
  


  

  tempBillandRef: any = [];

  closeAdvancePopup(response: any, rowIndex: number) {
    if (Object.keys(response).length > 0) {
      this.accDetails = [...this.accDetails];

      this.tempBillandRef = [
        ...this.tempBillandRef,
        ...response.selectedAdvanceData
      ];

      let totalAmount:number = 0;
      totalAmount = this.tempBillandRef.reduce((sum:any, item:any) => {
       return sum + (item.amount || 0);
     }, 0);

     this.accDetails[rowIndex]['credit'] = totalAmount;
     this.accDetails[rowIndex]['amount'] = totalAmount;
     this.accDetails = [...this.accDetails];
     this.tempFillDetails = [...this.accDetails];

      //console.log("After selecting bill and ref:"+JSON.stringify(this.tempBillandRef,null,2))
      this.refNos = this.tempBillandRef
        .map((item: any) => item.vNo) // Map to the vNo field
        .filter((vNo: string | null | undefined) => !!vNo) // Remove null or undefined vNo values
        .join(',');
      this.receiptvoucherForm.patchValue({
        referenceno: this.refNos
      });
      //console.log("Selected BillandRef:"+JSON.stringify(this.tempBillandRef,null,2))
         
           

    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showAdvanceDetails = false;
  }
  flag = 0;
  //allocation: any[]
  checkAdvanceAmount(accountId: number, rowIndex: number, DrCr: any) {
console.log("Getting advance data")
    let voucherDate = this.receiptvoucherForm.get('voucherdate')?.value;

    if (!voucherDate) {
      alert('Invalid Date');
      return false;
    }
    voucherDate = this.datePipe.transform(voucherDate, 'MM-dd-YYYY');

    // Call the API to fetch advance details
   
    console.log("BIll and ref api:"+EndpointConstant.FILLADVANCE + accountId + '&voucherId=' + this.voucherNo + '&date=' + voucherDate + '&drcr=' + DrCr)
    this.ReceiptvoucherService  
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
            console.log("hi")
            this.accDetails[rowIndex].billandRef = this.fillBillAndRefData;
          }
          else {
            console.log("helloo")
            if (advanceData && Array.isArray(advanceData)) {
              // Update the advanceAmountObj for the specific row
              this.accDetails[rowIndex].billandRef = advanceData;

            }
          }
console.log("Advance Data:"+JSON.stringify(this.accDetails[rowIndex].billandRef,null,2))

        },

        error: (error) => {
          console.error('An Error Occurred:', error);
        },
      });

    return true;
  }





  fetchChequePopup() {
    this.ReceiptvoucherService
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

  // fetchCashPopup() {
  //   this.ReceiptvoucherService
  //     .getDetails(EndpointConstant.FILLCASHPOPUP)
  //     .pipe(takeUntil(this.destroySubscription))
  //     .subscribe({
  //       next: (response) => {
  //         let responseData = response?.data
  //         this.cashPopupObj = responseData.map((item: any) => ({
  //           "accountcode": item.alias,
  //           "accountname": item.name,
  //           "id": item.id
  //         }));
  //       },
  //       error: (error) => {
  //         console.error('An Error Occured', error);
  //       },
  //     });
  // }



  fetchCardPopup() {
    this.ReceiptvoucherService
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


  fetchDefaultCardAccount() {
    this.ReceiptvoucherService
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

  // fetchDefaultCashAccount() {
  //   this.ReceiptvoucherService
  //     .getDetails(EndpointConstant.FILLDEFAULTCASHACCOUNT)
  //     .pipe(takeUntil(this.destroySubscription))
  //     .subscribe({
  //       next: (response) => {
  //         this.defaultCashAccount = response?.data;
  //       },
  //       error: (error) => {
  //         console.error('An Error Occured', error);
  //       },
  //     });
  // }



  fetchCurrencyDropdown() {
    if (this.multiCurrencySupport) {
      this.ReceiptvoucherService
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
      this.ReceiptvoucherService.updateDetails(EndpointConstant.UPDATEEXCHANGERATE + this.selectedCurrencyId + '&exchRate=' + this.currentCurrencyRate, {})
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
    this.ReceiptvoucherService.getDetails(EndpointConstant.FILLCOMMONPURCHASEDATA + this.pageId + '&voucherId=' + this.voucherNo)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.commonFillData = response?.data;
          this.vocherName = this.commonFillData.vNo?.code;
          this.receiptvoucherForm.patchValue({
            vouchername: this.commonFillData.vNo?.code,
            voucherno: this.commonFillData.vNo?.result
          });
          this.formVoucherNo = this.commonFillData.vNo?.result;

          if (this.commonFillData.costCentre && this.commonFillData.costCentre.length > 0) {
            this.costcentreData = this.commonFillData.costCentre.map((item: any) => ({
              projectcode: item.code,
              projectname: item.description,
              id: item.id
            }));
          }

        }
      })
  }


  fetchItemFillData() {
    this.partyId = this.selectedPartyId;
    this.locId = this.receiptvoucherForm.get('warehouse')?.value;
    this.ReceiptvoucherService
      .getDetails(EndpointConstant.FILLPURCHASEITEMS + 'partyId=' + this.partyId + '&voucherId=' + this.voucherNo)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data.items;
          let itemData = responseData.map((item: any) => {
            let unitObj = item.unitPopup.find((unit: any) => unit.unit === item.item.unit);

            return {
              itemCode: item.item.itemCode,
              itemName: item.item.itemName,
              barCode: item.item.barCode,
              id: item.item.id,
              unitname: unitObj?.unit,
              stock: item.item.stock,
              rate: item.item.rate,
              purchaseRate: item.item.purchaseRate,
              unit: unitObj ? {
                unit: unitObj.unit,
                basicUnit: unitObj.basicUnit,
                factor: unitObj.factor
              } : {},
            };
          });
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }


  enableFormControls() {
    this.receiptvoucherForm.get('voucherno')?.enable();
    this.receiptvoucherForm.get('vouchername')?.enable();
    this.receiptvoucherForm.get('voucherdate')?.enable();
    this.receiptvoucherForm.get('narration')?.enable();
    this.receiptvoucherForm.get('reference')?.enable();
    this.receiptvoucherForm.get('costcentre')?.enable();
    this.receiptvoucherForm.get('department')?.enable();
    this.receiptvoucherForm.get('referenceno')?.enable();
  }

  disbaleFormControls() {
    this.receiptvoucherForm.get('voucherno')?.disable();
    this.receiptvoucherForm.get('vouchername')?.disable();
    this.receiptvoucherForm.get('voucherdate')?.disable();
    this.receiptvoucherForm.get('narration')?.disable();
    this.receiptvoucherForm.get('reference')?.disable();
    this.receiptvoucherForm.get('costcentre')?.disable();
    this.receiptvoucherForm.get('department')?.disable();
    this.receiptvoucherForm.get('referenceno')?.disable();
  }



  onClickSaveReceiptVoucher() {

    if (this.receiptvoucherForm.value.costcentre) {
      this.costcentreData.forEach((element: any) => {
        if (element.projectname == this.receiptvoucherForm.value.costcentre) {
          this.selectedProjectObj = {
            "id": element.id,
            "name": element.projectcode,
            "code": element.projectname,
            "description": ""
          };
        }
      });
    }

    if (this.receiptvoucherForm.value.department) {
      this.fillDepartment.forEach((element: any) => {
        if (element.name == this.receiptvoucherForm.value.department) {
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
    // Parse the array and update the key for each object
    this.cashPopupGridDetails = this.cashPopupGridDetails.map((item: any) => {
      const updatedItem = { ...item }; // Create a shallow copy of the object
      updatedItem["accountcode"] = updatedItem["accountCode"]; // Add new key with value
      delete updatedItem["accountCode"]; // Remove the old key
      return updatedItem;
    });

    let filteredBillandRef = this.tempBillandRef.filter((item: any) => item.amount !== 0);


    const payload = {
      "id": this.selectedReceiptvoucherId ? this.selectedReceiptvoucherId : 0,
      "voucherNo": this.formVoucherNo,
      "voucherDate": this.receiptvoucherForm.value.voucherdate,
      "narration": this.receiptvoucherForm.value.narration,
      "costCentre": this.selectedProjectObj,
      "department": this.selectedDepartmentObj,
      "referenceNo": this.receiptvoucherForm.value.referenceno,
      "currency": this.currentcurrencyObj,
      "exchangeRate": this.receiptvoucherForm.value.exchangeRate,
      "accountDetails": filteredDetails,
      "paydetails": [],
      "billandRef": filteredBillandRef,
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

  updateCallback(payload: any) {
    this.ReceiptvoucherService.updateDetails(EndpointConstant.UPDATERECEIPTVOUHER + this.pageId + '&voucherId=' + this.voucherNo, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // Handle error or show failure message
          this.baseService.showCustomDialogue(response.data);

          this.selectedReceiptvoucherId = 0;
          this.setInitialState();
          this.onClickNewReceiptVoucher();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload: any) {
   // console.log("Payload:"+JSON.stringify(payload,null,2))
    this.ReceiptvoucherService.saveDetails(EndpointConstant.SAVERECEIPTTVOUHER + this.pageId + '&voucherId=' + this.voucherNo, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.httpCode === 201) {
            // Show the confirmation dialog asking "Do you want to print?"
            this.baseService.showCustomDialogues({
              key: 'confirm', // This ensures the confirmation dialog is displayed
              title: 'Print Confirmation',
              message: 'Do you want to print?',
              onAction: (action: string) => {
                if (action === 'OK') {
                  // Automatically call print function with the ID from response
                  const saleId = response.data; // Assuming response.data contains the ID
                  if (saleId) {
                    this.onClickPrint(saleId);
                  } else {
                    console.error("Sale ID is missing in the response.");
                  }
                } else {
                  console.log('User chose not to print');
                }
              }
            });
          } else {
            // Handle error or show failure message
            this.baseService.showCustomDialogue(response.data);
          }

          // Reset or call any follow-up actions (this is for navigating to new sales or state management)
          this.selectedReceiptvoucherId = this.firstReceiptVoucher;
          this.fetchAllReceiptVouchers();
          this.setInitialState();
          this.onClickNewReceiptVoucher();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving branch', error);
        },
      });
  }




  onClickEditSales() {
    if (!this.isEdit) {
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if (this.isInputDisabled == false) {
      if (!confirm("Are you sure you want to cancel the edit?")) {
        return false;
      }
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    this.isUnitsOpen = false;
    this.isOtherDetailsOpen = false;

    if (this.isInputDisabled == false) {
      this.enableFormControls();
    } else {
      this.disbaleFormControls();
    }
    this.fetchReceiptVoucherById();
    return true;
  }




  onClickDeleteReceiptVoucher(event: Event) {
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

  confirmDelete() {
    this.ReceiptvoucherService.deleteDetails(EndpointConstant.DELETEPURCHASE + this.selectedReceiptvoucherId + '&pageId=' + this.pageId)
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
          alert('Failed to Delete Journal Voucher.');
        },
        complete: () => {
          this.selectedReceiptvoucherId = 0;
          this.showDeletePopup = false;
          this.fetchAllReceiptVouchers();
          this.setInitialState();
          this.onClickNewReceiptVoucher();
        }
      });
  }

  closeDeletePopup() {
    this.showDeletePopup = false;
  }


  onClickReceiptVoucher(event: any): void {
    if (event.type === 'click') {
      this.selectedReceiptvoucherId = event.row.ID;
      this.fetchReceiptVoucherById();
    }
  }

  fetchPaymentVoucherById(): void {
    this.flag = 1;
    this.ReceiptvoucherService
      .getDetails(EndpointConstant.FILLPURCHASEBYID + this.selectedReceiptvoucherId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentReceiptvoucher = response?.data;
          this.FillPaymentVoucherDetails();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });

    this.ReceiptvoucherService.getDetails(EndpointConstant.FILLVOUCHERALLOCATION + this.selectedReceiptvoucherId)
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
    let transactionDetails = this.currentReceiptvoucher?.transaction.fillTransactions;
    let transactionEntries: any = this.currentReceiptvoucher?.transaction.fillTransactionEntries;
    let transactionAdditionals = this.currentReceiptvoucher?.transaction.fillAdditionals;
    let accountEntries = transactionEntries.filter((entry: any) => entry.tranType === null);
    let paymentEntries = transactionEntries.filter((entry: any) => entry.tranType !== null);
    let chequeData = this.currentReceiptvoucher?.transaction.fillCheques;
    this.referenceData = this.currentReceiptvoucher?.transaction.fillVoucherAllocationUsingRef;
    this.receiptvoucherForm.patchValue({
      vouchername: this.vocherName,
      voucherno: transactionDetails.transactionNo,
      voucherdate: transactionDetails.date ? new Date(transactionDetails.date) : null,
      referenceno: transactionDetails.referenceNo,
      narration: transactionDetails.commonNarration,
      currency: transactionDetails.currencyID,
      exchangerate: transactionDetails.exchangeRate,
    });
    this.formVoucherNo = transactionDetails.transactionNo;
    this.isReceiptVoucherCancelled = transactionDetails.cancelled;
    //set project data...
    if (transactionDetails.projectName != null) {
      this.onCostcentreSelected(transactionDetails.projectName);
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

  //fill the popups of cash and card
  FillCashOrCardData(entries: any) {
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
        }
        if (paymentData.tranType == 'Card') {
          this.cardAmount = this.cardAmount + Number(paymentData.amount);
          this.cardPopupGridDetails.push(accountData);
        }

        if (paymentData.tranType == 'Online') {
          this.epayAmount = this.epayAmount + Number(paymentData.amount);
          this.epayPopupGridDetails.push(accountData);
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
      });
    }


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

  // FillAccountGridDetails(transactionEntries: any) {
  //   if (transactionEntries && transactionEntries.length > 0) {
  //     this.accDetails = [];

  //     // Ensure referenceData is an array
  //     if (!Array.isArray(this.referenceData)) {
  //       console.error('referenceData is not an array. Initializing as empty array.');
  //       this.referenceData = [];
  //     }

  //     transactionEntries.forEach((trn: any) => {
  //       const allocationData = this.referenceData.filter((ref: any) => ref.accountID === trn.accountId);

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
  //         billandRef: allocationData.length > 0 ? allocationData : null
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
          credit: trn.amount ?? null,
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

  onActiveChange(event: any) {
    this.active = event.target.checked ? true : false;
  }

  fetchReceiptVoucherById(): void {
    this.flag = 1;
    this.ReceiptvoucherService
      .getDetails(EndpointConstant.FILLPURCHASEBYID + this.selectedReceiptvoucherId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentReceiptvoucher = response?.data;
          this.FillPaymentVoucherDetails();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });

    this.ReceiptvoucherService.getDetails(EndpointConstant.FILLVOUCHERALLOCATION + this.selectedReceiptvoucherId)
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

  FillPurchaseDetails() {
    let transactionDetails = this.currentReceiptvoucher?.transaction.fillTransactions;
    let transactionAddditional = this.currentReceiptvoucher?.transaction.fillAdditionals;
    this.invTransactions = this.currentReceiptvoucher?.transaction.fillInvTransItems;
    let transactionEntries: any = this.currentReceiptvoucher?.transaction.fillTransactionEntries;
    let payment: any = this.currentReceiptvoucher?.payment.data;
    let chequeInfo: any = this.currentReceiptvoucher?.cheque.data;
    this.referenceData = this.currentReceiptvoucher?.transaction.fillVoucherAllocationUsingRef;
    this.receiptvoucherForm.patchValue({
      vouchername: this.vocherName,
      voucherno: transactionDetails.transactionNo,
      purchasedate: transactionDetails.date ? new Date(transactionDetails.date) : null,
      reference: transactionDetails.referenceNo,
      customer: transactionDetails.accountName,
      warehouse: transactionAddditional.outLocID,
      vatno: transactionAddditional.vatNo,
      partyinvoiceno: transactionAddditional.entryNo,
      partyinvoicedate: transactionAddditional.entryDate,
      description: transactionDetails.commonNarration,
      terms: transactionAddditional.terms,
      paytype: transactionAddditional.modeID,
      //duedate: transactionAddditional.dueDate ? new Date(transactionAddditional.dueDate) : null
    });

    //set currency
    this.currentcurrencyObj = {
      "id": transactionDetails.currencyID,
      "value": transactionDetails.currency
    };
    this.selectedCurrencyId = transactionDetails.currencyID;
    let currencyObj = this.currencyDropdown.find((currency: any) => currency.currencyID == this.selectedCurrencyId);
    this.currentCurrencyRate = currencyObj.currencyRate;
    this.formVoucherNo = transactionDetails.transactionNo;
    //set transaction is cancelled or not...
    this.isReceiptVoucherCancelled = transactionDetails.cancelled;

    //set payment information...
    this.setPaymentInformation(payment);
    //set cheque payment information...
    this.setChequeInformation(chequeInfo);
    //on change pay type...
    this.onChangePayType();

  }

  setPaymentInformation(payment: any) {
    this.cashAmount = 0;
    this.cardAmount = 0;
    this.cashPopupGridDetails = [];
    this.chequePopupGridDetails = [];
    this.cardPopupGridDetails = [];
    if (payment) {
      payment.forEach((paymentData: any) => {
        let accountData = {
          "accountCode": {
            "alias": paymentData.Alias.toString(),
            "name": paymentData.Name,
            "id": paymentData.AccountID
          },
          "description": paymentData.Description,
          "amount": paymentData.Amount,
          "payableAccount": {}
        };


        if (paymentData.TranType == 'Cash') {
          this.cashAmount = this.cashAmount + Number(paymentData.Amount);
          this.cashPopupGridDetails.push(accountData);
        } else if (paymentData.TranType == 'Card') {
          this.cardAmount = this.cardAmount + Number(paymentData.Amount);
          this.cardPopupGridDetails.push(accountData);
        }
      });
      this.receiptvoucherForm.patchValue({
        "card": this.cardAmount == 0 ? "" : this.baseService.formatInput(this.cardAmount),
        "cash": this.cashAmount == 0 ? "" : this.baseService.formatInput(this.cashAmount),
        "cheque": this.chequeAmount == 0 ? "" : this.baseService.formatInput(this.chequeAmount)
      });
    }
  }

  setChequeInformation(chequeInfo: any) {
    this.chequeAmount = 0;
    if (chequeInfo) {
      chequeInfo.forEach((chequeData: any) => {
        this.chequeAmount = this.chequeAmount + Number(chequeData.ChqAmount);
        let bankinfo: any = {};

        let pdcPayableinfo: any = {};
        this.chequePopupObj.map((pdc: any) => {
          if (pdc.id == chequeData.PDCAccountID) {
            pdcPayableinfo = {
              "alias": pdc.accountcode,
              "name": pdc.accountname,
              "id": pdc.id
            };
          }
        });
        let chequeObj = {
          "pdcPayable": pdcPayableinfo,
          "veid": chequeData.VEID,
          "cardType": chequeData.CardType,
          "commission": 0,
          "chequeNo": chequeData.ChequeNo,
          "chequeDate": new Date(chequeData.ChequeDate),
          "clrDays": chequeData.ClrDays,
          "bankID": chequeData.BankID,
          "bankName": bankinfo,
          "status": "",
          "partyID": chequeData.PartyID,
          "description": chequeData.Description,
          "amount": chequeData.ChqAmount
        };
        this.chequePopupGridDetails.push(chequeObj);
      });
    }
    this.receiptvoucherForm.patchValue({
      "cheque": this.chequeAmount == 0 ? "" : this.baseService.formatInput(this.chequeAmount)
    });

  }

  filterReceipt(event: any) {
    const val = event.target.value.toLowerCase();
    const temp = this.tempReceiptDetails.filter(function (d: any) {
      const trNoMatch = d.TransactionNo.toString().toLowerCase().includes(val.toLowerCase());
      return trNoMatch || !val;
    });
    this.receiptMaster = temp;
  }

  moveFocusToItemGrid() {
    this.currentColIndex = 1;
    this.currentRowIndex = 0;
    this.scrollToCell(this.currentRowIndex, this.currentColIndex);
    this.enableInlineEditing = false;
    this.focusGridCell(this.currentRowIndex, this.currentColIndex);
  }

  //project popup
  onCostcentreSelected(option: string): any {
    this.updatedCostcentre = option;
    this.receiptvoucherForm.patchValue({
      costcentre: option,
    });
    //this.moveFocusToDropdown('supplier');
  }

  onDepartmentSelected(option: any): any {
    this.updatedDepartment = option;
    this.receiptvoucherForm.patchValue({
      department: option,
    });
    //this.moveFocusToDropdown('supplier');
  }



  onAccountCodeSelected(option: any, rowIndex: number): any {
    if (option != "") {

      let selectedAccountObj: any = {};
      this.fillAccountData.forEach((accInfo: any) => {
        if (accInfo.accountCode == option) {
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
      this.addRow(true);
    } else {
      this.tempFillDetails[this.currentRowIndex]['accountCode'] = "";
    }

  }

  //change in description
  onChangeDescription(rowIndex: any, event: any) {
    let desc = event.target.value;
    this.accDetails[rowIndex]['description'] = desc;
    this.tempFillDetails[rowIndex]['description'] = desc;
  }

  //change in duedate
  onChangeDate(rowIndex: any, event: any) {
    let date = event.target.value;

    // Remove non-numeric characters
    date = date.replace(/[^0-9]/g, '');

    // Automatically add slashes
    if (date.length > 2) date = date.slice(0, 2) + '/' + date.slice(2);
    if (date.length > 5) date = date.slice(0, 5) + '/' + date.slice(5);

    // Update the input value to show formatted date
    event.target.value = date;

    // Validate date on the fly
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (dateRegex.test(date)) {
      // If valid, update the data model
      this.tempFillDetails[rowIndex]['dueDate'] = date;
      event.target.style.border = ''; // Remove error styling if any
    } else {
      // If invalid, apply error styling (optional)
      // event.target.style.border = '2px solid red';
    }
  }

  onBlurDateValidation(rowIndex: any, event: any) {
    const date = event.target.value;

    // Regex to validate date in dd/mm/yyyy format
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!dateRegex.test(date)) {
      // If invalid, show an alert
      alert('Invalid date format. Please enter a date in dd/mm/yyyy format.');

      // Optionally, clear the invalid date or highlight the input field
      event.target.style.border = '2px solid red';
      this.tempFillDetails[rowIndex]['dueDate'] = ''; // Clear the date in the model
    } else {
      // If valid, remove any error styling
      event.target.style.border = '';
      this.tempFillDetails[rowIndex]['dueDate'] = date; // Update the data model
    }
  }

  //change in credit...
  // handleDoubleClickCredit(event: MouseEvent, rowIndex: number): void {
  //   // Call your existing logic (e.g. enabling input mode, setting editing state)
  //   this.currentRowIndex = rowIndex;
  //   this.currentColumname = 'credit';
  //   this.enableInlineEditing = true;
  
  //   // Also call onChangeCredit, simulating an "input" event
  //   this.onChangeCredit({ target: { value: this.accDetails[rowIndex].credit } } as any, rowIndex);
  // }
  

  onChangeCredit(event: any, rowIndex: any) {
    console.log("getting credit")
    let accountId = this.accDetails[rowIndex].accountCode.id;
    let DrCr = "D";
    this.checkAdvanceAmount(accountId, rowIndex, DrCr)
    let credit = event.target.value;
    this.tempFillDetails[rowIndex]['credit'] = credit;
    this.accDetails[rowIndex]['credit'] = credit;
    this.accDetails[rowIndex]['amount'] = credit;

    this.advancePayableAmount = parseFloat(credit);
  }

  fetchBankDetails() {
    this.ReceiptvoucherService
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


  openaccDetails(event: Event) {
    event.preventDefault();
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showaccDetails = true;
  }

  closeaccDetails(expireDetails: any) {
    if (expireDetails.length == 0) {
      this.expireaccDetails = this.copyExpireaccDetails;
    } else {
      this.expireaccDetails = expireDetails;
    }

    this.expireaccDetails = [...this.expireaccDetails];
    this.renderer.removeStyle(document.body, 'overflow');
    this.showaccDetails = false;
  }


  // openCashPopup() {

  //   this.renderer.setStyle(document.body, 'overflow', 'hidden');
  //   this.showCashPopup = true;

  // }
  openCashPopup() {
   // console.log("open Cash Popup")
    const totalCredit = this.accDetails.reduce((sum, item) => {
      return sum + (Number(item.credit) || 0); // Convert to number to ensure numeric addition
    }, 0);
    const totalDebit = this.paymentFillDetails.reduce((sum: number, item: any) => {
      return sum + (Number(item.amount) || 0);
    }, 0);


    this.balanceAmount = totalCredit - totalDebit;

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

  // openCardPopup() {
  //   if (this.cardPopupGridDetails.length == 0 && this.balanceAmount > 0) {
  //     if (confirm('Do you want to allocate the balance amount to default card account')) {
  //       this.setDefaultAmounttoCard();
  //     }
  //   }
  //   this.renderer.setStyle(document.body, 'overflow', 'hidden');
  //   this.showCardPopup = true;
  // }
  openCardPopup() {

    const totalCredit = this.accDetails.reduce((sum, item) => {
      return sum + (Number(item.credit) || 0); // Convert to number to ensure numeric addition
    }, 0);
    const totalDebit = this.paymentFillDetails.reduce((sum: number, item: any) => {
      return sum + (Number(item.amount) || 0);
    }, 0);

    this.balanceAmount = totalCredit - totalDebit;

    if (this.cardPopupGridDetails.length == 0 && this.balanceAmount > 0) {
      if (confirm('Do you want to allocate the balance amount to default card account')) {
        this.setDefaultAmounttoCard(this.balanceAmount);
      }
    }
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showCardPopup = true;
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
  // setDefaultAmounttoCard() {
  //   this.cardPopupGridDetails.push({
  //     id: this.defaultCardAccount[0].id,
  //     accountCode: {
  //       alias: this.defaultCardAccount[0].accountCode,
  //       name: this.defaultCardAccount[0].accountName,
  //       id: this.defaultCardAccount[0].id
  //     },
  //     description: "",
  //     amount: this.balanceAmount,
  //     payableAccount: {}
  //   });
  // }


  onChangeBatchNo(rowIndex: any, event: any) {
    let batchno = event.target.value;
  }

  onClickPrint(selectedSalesId: number): void {
    this.pdfgenerationService.generateReceiptVoucherPdf(selectedSalesId, this.pageId, 'print');
  }

  onClickPreview(selectedSalesId: number): void {
    this.pdfgenerationService.generateReceiptVoucherPdf(selectedSalesId, this.pageId, 'preview');
  }


  //delete and cancel payment voucher
  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }

  closeCardPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showCardPopup = false;
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

  //epay popup

  openEpayPopup() {
    this.showEpayPopup = true;
  }

  fetchEpayPopup() {
    this.ReceiptvoucherService
      .getDetails(EndpointConstant.FILLEPAYPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data;
          this.epayPopupObj = responseData.map((item: any) => ({
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

  saveEpayPopup(response: any) {
    this.epayAmount = response?.totalamount;
    if (Object.keys(response).length > 0) {
      this.epayPopupGridDetails = response?.gridDetails;
    }
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
    this.accDetails.push(this.accDetailsObj);
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


  navigateToItemPage(itemId: number) {
    const urlTree = this.router.createUrlTree(['/inventory/masters/itemmaster'], { queryParams: { pageId: this.itemmasterPageId, itemid: itemId } });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
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

  dateValidator(event: any) {
    let expiryDate = event.target.value;
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
    const valid = regex.test(expiryDate.value);
    if (expiryDate && !valid) {
      this.baseService.showCustomDialogue('Invalid Date');
    }
  }

  convertAmount(amount: any): number {
    return Number(amount?.toString().replace(/,/g, '') || 0);
  }


  onRowSelect(row: any) {
    this.selected = [row];
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
      this.accDetails.push(this.accDetailsObj);
    } else if (index == this.accDetails.length - 1) {
      this.accDetails.splice(index, 1);
      this.selected = [];
      this.accDetails.push(this.accDetailsObj);
    } else if (index !== -1) {
      this.accDetails.splice(index, 1);
      this.selected = [];
    }
    this.accDetails = [...this.accDetails];
    this.tempFillDetails = [...this.accDetails];
    this.selectedRowIndex = -1
  }



  onChangeItemExpiry(changedItem: any) {
    this.accDetails[changedItem['gridIndex']]['expiryDate'] = changedItem['expiryDate'];
    this.accDetails[changedItem['gridIndex']]['manufactureDate'] = changedItem['manufactureDate'];
    this.accDetails = [...this.accDetails];
    this.tempReceiptDetails = [...this.accDetails];
  }

  onItemUnitSelected(option: any, rowIndex: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    let unitPopup = this.accDetails[rowIndex]['unitsPopup'];
    let unitObj = unitPopup.find((unit: any) => unit.unit === option)
    this.accDetails[rowIndex]['unit'] = unitObj;
    this.accDetails = [...this.accDetails];
    this.tempReceiptDetails = [...this.accDetails];
  }

  onItemBatchNoSelected(option: any, rowIndex: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    this.accDetails[rowIndex]['batchNo'] = option;
    this.accDetails = [...this.accDetails];
    this.tempReceiptDetails = [...this.accDetails];
  }



  onChangeCustomerInStorage(event: StorageEvent) {
    if (event.key === 'customerSaved') {
      // Refresh data
      //this.fetchCustomer();
    }
  }
  selectRow(event: Event, rowIndex: number): void {

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
        if (this.currentColumname == 'accountcode') {
          const matchExists = this.fillItemDataOptions.some((option: any) => option['accountCode']['code'] == this.tempFillDetails[this.currentRowIndex]['accountCode']['code']);
          if (!matchExists) {
            this.baseService.showCustomDialogue("Invalid Entry");
            this.deleteItemGrid(this.currentRowIndex, false);
          }
        } else if (this.currentColumname == 'duedate') {
          this.onBlurDateValidation(this.currentRowIndex, event);
        }
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
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditing();

    setTimeout(() => {
      this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
    });
  }
  onClickSpan(event: any, rowIndex: number, colIndex: number): void {
    this.selectedIDRowIndex = -1;
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
  onClickIDColumn(event: any, rowIndex: number, colIndex: number): void {
    this.selectedIDRowIndex = rowIndex;
  }

  handleDoubleClick(event: any) {
    if (this.currentColumname != 'id' && this.currentColumname != 'itemname' && this.currentColumname != 'amount' && this.currentColumname != 'taxperc' && this.currentColumname != 'taxvalue' && this.currentColumname != 'total') {
      this.enableInlineEditing = true;
    }
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return ((this.currentRowIndex == rowIndex && this.currentColIndex == colIndex && (this.selectedIDRowIndex == -1 || this.selectedIDRowIndex == rowIndex)) || (this.selectedIDRowIndex == rowIndex));
  }



  onKeyDown(event: KeyboardEvent) {
    this.selectedIDRowIndex = -1;
    //handle CTl+Alt+m key .
    if (event.altKey && event.ctrlKey && event.key === 'm') {
      event.preventDefault();
      this.toggleLeftSection();
    }

    //change paytype into cash..
    if (event.altKey && event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      this.changePayTypeToCash();
    }

    //change paytype into cash..
    if (event.altKey && event.ctrlKey && event.key === 'd') {
      event.preventDefault();
      this.changePayTypeToCredit();
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
          // this.gridnavigationService.moveToNextRow(this.tempReceiptDetails, this.focusGridCell.bind(this));
        }
        break;


      case 'ArrowUp':
        if (this.enableInlineEditing == false) {
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
        if (cursorPosition == 0 && this.currentColumname != 'itemcode') {
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

      case 'Delete':
        if (!this.enableInlineEditing) {
          event.preventDefault();
          //call delete function to delete current row.
          this.deleteItemGrid(this.currentRowIndex);
        }
        break;

      case 'Escape':
      case 'Esc':
        if (!this.enableInlineEditing) {
          event.preventDefault();
          //call delete function to delete current row.
          if (this.tempReceiptDetails.length > 1) {
            let index = this.tempReceiptDetails.length - 2;
            this.deleteItemGrid(index);
          }
        }
        break;

      case 'Enter':
        event.preventDefault();

        this.enableInlineEditing = false;
        if (this.currentColumname == 'itemcode' && this.tempFillDetails[this.currentRowIndex]['itemCode'] == "") {
          const matchExists = this.fillItemDataOptions.some(option => option['itemCode'] == this.tempFillDetails[this.currentRowIndex]['itemCode']);
          if (!matchExists) {
            this.deleteItemGrid(this.currentRowIndex, false);
            break;
          }
        }
        if (this.currentColIndex < this.tablecolumns.length - 1) {
          this.currentColIndex++;
          this.scrollToCell(this.currentRowIndex, this.currentColIndex);
          this.enableInlineEditing = false;
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
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
      case 'Tab':

        if (event.shiftKey) {
          // Logic for Shift+Tab
          event.preventDefault(); // Prevent the default Shift+Tab behavior
          this.moveFocusToDropdown('customer'); // Move focus to the supplier input or other logic
        } else {
          event.preventDefault();
          this.enableInlineEditing = false;
          if (this.currentColumname == 'itemcode' && this.tempFillDetails[this.currentRowIndex]['itemCode'] == "") {
            const matchExists = this.fillItemDataOptions.some(option => option['itemCode'] == this.tempFillDetails[this.currentRowIndex]['itemCode']);
            if (!matchExists) {
              this.deleteItemGrid(this.currentRowIndex, false);
              break;
            }
          }
          //checking if column name is before qty then move to qty else move to next row 
          if (this.currentColumname == 'itemcode' || this.currentColumname == 'itemname'
            || this.currentColumname == 'stockitem' || this.currentColumname == 'batchno'
            || this.currentColumname == 'unit') {
            this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'qty');
            this.scrollToCell(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
            break;
          }

          let currentCoulmn = this.tablecolumns[this.currentColIndex];
          //tab functionality if current column is item code...
          if (currentCoulmn.field == 'itemcode') {
            // check rate and qty is Zero if yes move to those columns else move to next code ...
            if (this.tempReceiptDetails[this.currentRowIndex]['qty'] == 0) {
              this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'qty');
              this.scrollToCell(this.currentRowIndex, this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
            } else if (this.tempReceiptDetails[this.currentRowIndex]['rate'] == 0) {
              this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'rate');
              this.scrollToCell(this.currentRowIndex, this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
            }
          }
          //tab functionality if current column is qty...
          if (currentCoulmn.field == 'qty') {
            // check qty is Zero if yes move to those columns else move to next code ...
            if (this.tempReceiptDetails[this.currentRowIndex]['rate'] == 0) {
              //show rate this.baseService.showCustomDialogue...
              // this.onMouseLeaveQty(this.currentRowIndex,Event);
              this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'rate');
              this.scrollToCell(this.currentRowIndex, this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
            }
          }

          if (this.currentRowIndex < this.tempReceiptDetails.length - 1) {
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
          if (columnName == 'itemcode' || columnName == 'stockitem' || columnName == 'unit' || columnName == 'pricecategory' || columnName == 'sizemasterid') {
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
        if (!this.isInputDisabled) {
          // Handle other keys for inline editing
          const cellId = (event.target as HTMLElement).id;
          const cellElement = document.getElementById(cellId);
          if (cellElement) {
            const columnName = cellElement.getAttribute('data-column-name');
            const columnKeyName = cellElement.getAttribute('data-column-key-name');
            if (columnName != null) {
              this.currentColumname = columnName;
            }
            if (this.enableInlineEditing == false && (columnName != 'id' && columnName != 'itemname')) {
              this.enableInlineEditing = true;
              this.isFormDirty = true;
              setTimeout(() => {
                const cellElement = document.getElementById(cellId);
                this.prevColumnValue = "";
                let newValue = event.key;
                // Check if the key is a character key
                const isCharacterKey = event.key.length === 1;
                if ((cellElement instanceof HTMLInputElement || cellElement instanceof HTMLTextAreaElement) && isCharacterKey) {
                  // If it's an input or textarea, set the value
                  cellElement.value = newValue;
                  if (this.currentColumname == 'accountcode') {
                    this.prevColumnValue = this.accDetails[this.currentRowIndex]['accountCode'];
                  }
                  if (columnKeyName !== null && columnKeyName !== undefined) {

                    let tempRow = { ...this.tempFillDetails[this.currentRowIndex] };
                    tempRow[columnKeyName] = event.key;
                    this.tempFillDetails[this.currentRowIndex] = tempRow;
                  }
                  this.tempFillDetails = [...this.tempFillDetails];
                }
              }, 0);

            }
          }
        }
        break;
    }
    return true;
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

  scrollToCell(rowIndex: number, colIndex: number): void {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  moveFocusToDropdown(fieldName: any): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.focusInput();
    }
  }

  callKeydownEventToDropdown(fieldName: any, event: KeyboardEvent): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.onKeyDown(event);
    }
  }

  // Listen to the keydown event at the window level
  @HostListener('window:keydown', ['$event'])
  onBodyKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && (event.key === 'p' || event.key === 'P')) {
      event.preventDefault();  // Prevent the default print behavior
      if (this.selectedReceiptvoucherId == 0 && !this.isInputDisabled) {
        if (this.balanceAmount > 0) {
          // this.openDialog();
        } else {
          this.baseService.showCustomDialogue('Amount must be greater than zero');
        }
      } else if (this.selectedReceiptvoucherId > 0 && !this.isInputDisabled) {
        this.activePrintOption = true;
        this.onClickSaveReceiptVoucher();
      }
    } else if (event.key == 'F1') {
      event.preventDefault();  // Prevent browser help page from opening
      // this.toggleMaximize();
    } else if (event.key === 'F2') {
      event.preventDefault();
      if (!this.isEditBtnDisabled) {
        this.onClickEditSales();
      }
    } else if (event.key == 'F5') {
      event.preventDefault();
      if (this.currentRowIndex >= 0) {
        //show popup only when itemcode is not empty...
        if (this.accDetails[this.currentRowIndex]['itemCode']) {
          this.itemSearchCode = this.accDetails[this.currentRowIndex]['itemCode'];
          this.itemSearchName = this.accDetails[this.currentRowIndex]['itemName'];
          this.setOptionsForItemSearchPopup();
          this.showItemSearchPopup = true;
        }
      }
    } else if (event.key === 'F6') {
      event.preventDefault();
      if ((this.isEditBtnDisabled && !this.isInputDisabled) || (!this.isEditBtnDisabled && this.isInputDisabled)) {
        this.onClickNewReceiptVoucher();
      }
    } else if (event.key === 'F7') {
      event.preventDefault();
      if (!this.isInputDisabled) {
        this.onClickSaveReceiptVoucher();
      }
    } else if (event.key === 'F8') {
      event.preventDefault();

    } else if (event.key === 'F9') {
      event.preventDefault();
      if (!this.isDeleteBtnDisabled) {
        this.onClickDeleteReceiptVoucher(event);
      }
    } else if (event.altKey && event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      if (this.currentRowIndex >= 0) {
        if (this.accDetails[this.currentRowIndex]['itemCode']) {
          //show popup for price category....

          let id = this.accDetails[this.currentRowIndex]['itemId'];
          let unit = this.accDetails[this.currentRowIndex]['unit']['unit'];
          this.showPriceCategoryPopup = true;
          this.setPriceCategoryPopupData(id, unit);
        }
      }
    } else if (event.altKey && event.ctrlKey && event.key === 'm') {
      event.preventDefault();
      this.toggleLeftSection();
    } else if (event.altKey && event.ctrlKey && event.key === 'q') {
      event.preventDefault();
      this.openSelectedItemUnitPopup();
    } else if (event.altKey && event.ctrlKey && event.key === 'k') {
      event.preventDefault();
      this.changePayTypeToCash();
    } else if (event.altKey && event.ctrlKey && event.key === 'd') {
      event.preventDefault();
      this.changePayTypeToCredit();
    } else if (event.altKey && event.ctrlKey && event.key === 'u') {
      event.preventDefault();
      if (this.currentRowIndex >= 0) {
        if (this.accDetails[this.currentRowIndex]['itemCode']) {
          this.selectedItemRemarks = this.accDetails[this.currentRowIndex]['remarks'];
          this.showRemarksPopup = true;
        }
      }
    } else if (event.altKey && event.ctrlKey && event.key === 'j') {
      event.preventDefault();
      if (this.currentRowIndex >= 0) {
        if (this.accDetails[this.currentRowIndex]['itemCode']) {
          let itemCode = this.accDetails[this.currentRowIndex]['itemCode'];
          this.itemRateItemName = this.accDetails[this.currentRowIndex]['itemName']
          this.getItemRatePopupDetails(itemCode);
          this.showItemRatePopup = true;
        }
      }
    } else if (event.key === 'F10') {
      event.preventDefault();
      this.onClickPrint(this.selectedReceiptvoucherId);
    } else if (event.key === 'F11') {
      event.preventDefault();
      this.onClickPreview(this.selectedReceiptvoucherId);
    } else if (event.altKey) {

    } else if (event.ctrlKey) {

    }
  }

  onFormKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key == 'Enter') {
      event.preventDefault();
      if (index == -1) {
        this.moveFocusToItemGrid();
      } else {
        this.focusOnTabIndex(index);
      }
    }
  }

  // Function to move focus to an element with a specific tabindex
  focusOnTabIndex(tabIndex: number): void {
    const element = document.querySelector(`[tabindex="${tabIndex}"]`) as HTMLElement;
    if (element) {
      element.focus(); // Focus the element with the given tabindex
    }
  }

  showPrintConfirmBox() {
    confirm('Do you want to print?');
  }


  openSelectedItemUnitPopup() {
    if (this.accDetails[this.currentRowIndex] && this.accDetails[this.currentRowIndex]['unitsPopup']) {
      this.enableInlineEditing = false;
      let unitColumnIndex = this.tablecolumns.findIndex(col => col.field === 'unit');
      this.currentColIndex = unitColumnIndex;
      this.enableInlineEditing = true;
      this.focusGridCell(this.currentRowIndex, this.currentColIndex);
      // Now trigger the keydown event programmatically
      let gridCell = this.getGridCellElement(this.currentRowIndex, this.currentColIndex);
      if (gridCell) {
        let event = new KeyboardEvent('keydown', { key: 'n' });
        gridCell.dispatchEvent(event);
      }
    }
  }

  getGridCellElement(rowIndex: number, colIndex: number): HTMLElement | null {
    // Assuming each grid cell has a unique id like `cell-row-col`
    const cellId = `cell-${rowIndex}-${colIndex}`;
    return document.getElementById(cellId);
  }

  changePayTypeToCash() {
    let cashType = this.payTypeObj.find((type: any) => type.name === 'Cash');

    if (cashType) {
      this.receiptvoucherForm.patchValue({
        paytype: cashType.id  // Set the value of paytype to the id of 'cash'
      });
    }
  }

  changePayTypeToCredit() {
    let creditType = this.payTypeObj.find((type: any) => type.name === 'Credit');

    if (creditType) {
      this.receiptvoucherForm.patchValue({
        paytype: creditType.id  // Set the value of paytype to the id of 'credit'
      });
    }
  }

  getSummaryTemplate(columnName: string): TemplateRef<any> {
    switch (columnName) {
      case 'itemcode':
        return this.itemcodesummarycell;
      case 'qty':
        return this.qtysummarycell;
      case 'focqty':
        return this.focqtysummarycell;
      default:
        return this.defaultSummaryCell;
    }
  }

  onClickTab(tabId: any): void {
    this.selectedTab = tabId;
    if (tabId == 1) {
      this.showCommonPayment = true;
      this.showAdditionalPayment = false;
    } else if (tabId == 2) {
      this.showAdditionalPayment = true;
      this.showCommonPayment = false;
    } else {

    }
  }

  onClickDetailsTab(tabId: any): void {
    this.selectedDetailTab = tabId;
    if (tabId == 1) {
      this.showaccDetailsTab = true;
      this.showAdditionalDetailsTab = false;
    } else if (tabId == 2) {
      this.showAdditionalDetailsTab = true;
      this.showaccDetailsTab = false;
    } else {

    }
  }

  ngAfterViewInit(): void {
    this.setMaxHeight();
    this.isOverlayVisible = !!this.overlayElement.nativeElement;
    if (this.isOverlayVisible) {
      this.adjustOverlayHeight();
    }

    //set focus to current element ...
    this.gridCells.changes.subscribe(() => {
      if (this.gridCells.length > 0) {
        this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
        this.scrollToCell(this.currentRowIndex, this.currentColIndex);
      }
    });

    if (this.ngxTable) {
      // const scrollableArea = this.ngxTable.nativeElement.querySelector('.datatable-body');
      // if (scrollableArea) {
      //   scrollableArea.addEventListener('scroll', () => {
      //     const scrollLeft = scrollableArea.scrollLeft;
      //     // Move the summary row or take action on scroll
      //     if (this.tableSummary) {
      //       this.tableSummary.nativeElement.style.transform = `translateX(-${scrollLeft}px)`;
      //     }
      //   });
      // } else {
      //   console.error('Scrollable area inside ngx-datatable is undefined.');
      // }
    } else {
      console.error('ngxTable is undefined.');
    }


    // After the view has initialized, capture column widths
    this.setSummaryCellWidths();
    if (this.tableWrapper) {
      console.log('View initialized');
    }


    // Create an IntersectionObserver instance
    const observer = new IntersectionObserver((entries) => {
      // Check if the target div is not visible
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          // Target div is not visible, show the bottom bar
          this.showBottomBar = true;
        } else {
          // Target div is visible, hide the bottom bar
          this.showBottomBar = false;
        }
      });
    });



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

  // Method to scroll to the bottom of the div
  scrollToBottom() {
    const scrollDuration = 600; // Duration in milliseconds
    const startPosition = this.scrollContainer.nativeElement.scrollTop;
    const targetPosition = this.scrollContainer.nativeElement.scrollHeight;
    const distance = targetPosition - startPosition;
    const startTime = performance.now();

    const scrollStep = (timestamp: any) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / scrollDuration, 1);
      const currentScroll = startPosition + distance * progress;

      this.scrollContainer.nativeElement.scrollTop = currentScroll;

      if (progress < 1) {
        requestAnimationFrame(scrollStep);
      }
    };

    requestAnimationFrame(scrollStep);
  }


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

  onSelectLeftTable(event: any) {
  }

  openBarcodePopup() {
    const dialogRef = this.dialog.open(CustomDialogueComponent,
      {
        width: '400px',
        height: '200px',
        data: {
          key: "barcode"
        },
        autoFocus: false
      }
    );

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
      }
    });
    // Use afterOpened to ensure the component instance is available
    dialogRef.afterOpened().subscribe(() => {
      const instance = dialogRef.componentInstance;

      // Subscribe to the EventEmitter from the component instance
      instance.barcodeChanged.subscribe((barcode: string) => {
        //check is barcode matches with any item in itemlist if yes add to grid 
        this.checkBarcodeFromItems(barcode);
      });
    });

  }

  checkBarcodeFromItems(barcode: any) {
    const foundItem = this.fillItemDataOptions.find(item => item.barCode === barcode);
    //check if item exists in tempReceiptDetails...
    if (foundItem != null) {
      const foundItemDet = this.tempReceiptDetails.find((item: any) => item.itemCode === foundItem?.itemCode);
      if (foundItemDet) {
        foundItemDet.qty = foundItemDet.qty == 0 ? + Number(foundItemDet.qty) + 2 : Number(foundItemDet.qty) + 1; // Ensures that qty is incremented, even if it's undefined
      } else {
        this.onAccountCodeSelected(foundItem.itemCode, this.tempReceiptDetails.length - 1)
      }
    } else {
      this.dialog.open(CustomDialogueComponent, {
        width: '300px',
        height: '200px',
        data: {
          message: "Invalid item",
          key: "custom"
        }
      });
    }
  }


  closeRemarksPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showRemarksPopup = false;
  }

  closeItemRatePopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showItemRatePopup = false;
  }

  getItemRatePopupDetails(itemCode: any) {
    this.prevTransactionData = [];
    this.fillItemsData.forEach((itemInfo: any) => {
      if (itemInfo.item.itemCode === itemCode) {
        this.prevTransactionData = itemInfo.previousTransData;
      }
    });
  }

  closeItemSearchPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showItemSearchPopup = false;
  }

  closePriceCategoryPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showPriceCategoryPopup = false;
  }

  setOptionsForItemSearchPopup() {
    this.itemSearchPopupOptions = this.fillItemsData.map((itemInfo: any) => ({
      itemname: itemInfo.item.itemName,
      itemcode: itemInfo.item.itemCode,
      partno: itemInfo.item.partNo,
      id: itemInfo.item.id
    }));
  }

  onSelectRelatedItem(itemData: any) {
    this.onAccountCodeSelected(itemData.itemCode, this.currentRowIndex);
    this.closeItemSearchPopup();
  }

  onSelectPriceCategory(rateInfo: any) {
    //set rate of current selected item with item selected from popup
    let rate = rateInfo.price;
    if (rate == 0) {
      this.baseService.showCustomDialogue('Rate is zero');
    }
    this.accDetails[this.currentRowIndex]['rate'] = rate;
    this.closePriceCategoryPopup();
  }

  setPriceCategoryPopupData(id: any, unit: any) {
    this.ReceiptvoucherService
      .getDetails(EndpointConstant.FETCHPRICECATEGORYBYIDUNIT + id + '&Unit=' + unit)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.priceCategoryOptions = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    if (this.tableWrapper && !this.tableWrapper.nativeElement.contains(event.target)) {
      if (this.enableInlineEditing) {
        if (this.currentColumname == 'itemcode') {
          let currentItemcode = this.tempReceiptDetails[this.currentRowIndex]['itemCode'];
          let validateItemcode = this.validateItemCode(currentItemcode);
          if (!validateItemcode) {
            this.tempReceiptDetails[this.currentRowIndex]['itemCode'] = this.prevColumnValue;
            this.tempReceiptDetails = [...this.tempReceiptDetails];
          }
        } else if (this.currentColumname == 'unit') {
          if (this.tempReceiptDetails[this.currentRowIndex]['unit']) {
            let currentunit = this.tempReceiptDetails[this.currentRowIndex]['unit']['unit'];
            let validatUnit = this.validateUnitField(currentunit);
            if (!validatUnit) {
              this.tempReceiptDetails[this.currentRowIndex]['unit']['unit'] = this.prevColumnValue;
              this.tempReceiptDetails = [...this.tempReceiptDetails];
            }
          }
        } else if (this.currentColumname == 'pricecategory') {
          if (this.tempReceiptDetails[this.currentRowIndex]['priceCategory']) {
            let currentpricecategory = this.tempReceiptDetails[this.currentRowIndex]['priceCategory']['name'];
            let validatPrice = this.validatePriceCategoryField(currentpricecategory);
            if (!validatPrice) {
              this.tempReceiptDetails[this.currentRowIndex]['priceCategory']['name'] = this.prevColumnValue;
              this.tempReceiptDetails = [...this.tempReceiptDetails];
            }
          }
        }

        this.enableInlineEditing = false;

      }

      // Perform your desired actions here
    }
  }

  validateItemCode(inpItemCode: any) {
    return this.fillItemDataOptions.some(option => option['itemCode'] == inpItemCode);
  }

  validateUnitField(inpUnit: any) {
    let unitPopup = this.accDetails[this.currentRowIndex]['unitsPopup'];
    return unitPopup.some((option: any) => option['unit']['unit'] == inpUnit);
  }

  validatePriceCategoryField(inpPrice: any) {
    let itemPriceCategory = this.accDetails[this.currentRowIndex]['priceCategoryOptions'];
    return itemPriceCategory.some((option: any) => option['pricecategory'] == inpPrice);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.setMaxHeight();
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768; // Adjust breakpoint as needed
    this.isTab = window.innerWidth <= 992 && window.innerWidth > 768; // Adjust breakpoint as needed
    const fieldsToRemove = [
      'batchno',
      'stockitem',
      'unit',
      'focqty',
      'pricecategory',
      'expirydate',
      'ratewithtax',
      'sizemasterid',
      'taxperc',
      'discount',
      'grossamount',
      'discperc',
      'amount',
      'taxvalue'
    ];
    const fieldsToRemoveForTab = [
      'batchno',
      'stockitem',
      'unit',
      'focqty',
      'pricecategory',
      'expirydate',
      'ratewithtax',
      'sizemasterid',
      'taxperc',
      'discperc',
      'amount'
    ];
    if (this.isMobile) {
      // Remove fields listed in `fieldsToRemove` for mobile
      this.showLeftSection = false;
      this.tablecolumns = this.originalTableColumns.filter(
        (col) => !fieldsToRemove.includes(col.field)
      );
    } else if (this.isTab) {
      // Remove fields listed in `fieldsToRemove` for mobile
      this.showLeftSection = false;
      this.tablecolumns = this.originalTableColumns.filter(
        (col) => !fieldsToRemoveForTab.includes(col.field)
      );
    } else {
      this.showLeftSection = true;
      // Restore original columns when not mobile
      this.tablecolumns = [...this.originalTableColumns];
    }
  }

  setMaxHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0; // Adjust if you have a footer

    const btnGroupHeight = this.btngroup.nativeElement.offsetHeight;
    const leftsearchHeight = this.leftsearch.nativeElement.offsetHeight;
    const availableHeight = window.innerHeight - headerHeight - footerHeight - btnGroupHeight - 25;
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight - leftsearchHeight - 60;
    const sections = document.querySelectorAll('.right-section');
    sections.forEach(section => {
      (section as HTMLElement).style.height = `${availableHeight}px`;
    });

    const leftsection = document.querySelectorAll('.left-section .ngx-datatable.scroll-vertical');

    leftsection.forEach(section => {
      (section as HTMLElement).style.setProperty('height', `${leftContentHeight}px`, 'important');
    });

    const sectionContentClass = document.querySelectorAll('.sales-invoice-section .section-content');
    let heightDiff = 0;
    sectionContentClass.forEach(section => {
      const heightWithMargin = section.getBoundingClientRect().height;
      heightDiff = Number(heightDiff) + Number(heightWithMargin);
    });
    this.tableHeight = availableHeight - heightDiff - 80;
  }

  adjustOverlayHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0; // Adjust if you have a footer
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight;
  }

  @HostListener('window:beforeunload', ['$event'])
  handleBeforeUnload(event: Event): boolean {
    if (this.isFormDirty) {
      return window.confirm('You have unsaved changes! Are you sure you want to leave?');
    }
    return true;
  }

  // canDeactivate(): boolean {
  //   if (this.isFormDirty) {
  //     return window.confirm('You have unsaved changes! Are you sure you want to leave?');
  //   }
  //   return true;
  // }

  ngOnDestroy(): void {
    this.destroySubscription.next();
    this.destroySubscription.complete();
    window.removeEventListener('storage', this.storageEventHandlerSales);
    // Destroy DataTables when the component is destroyed
    // if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
    //   $(this.table.nativeElement).DataTable().destroy();
    // }
  }


  pettyCashObj: any = [];

  isPettyCashLoaded = false;
  fetchUserPettyCash() {
    this.ReceiptvoucherService.getDetails(EndpointConstant.PETTYCASH)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          const pettyCashData = response?.data.pettyCashAccounts;
          const defaultWh = response?.data.warehouseDetails;
          this.pettyCashObj = pettyCashData.map((item: any) => ({
            accountcode: item.accountCode,
            accountname: item.accountName,
            id: item.id,
          }));


          this.isPettyCashLoaded = true;
          this.fetchDefaultCashAccount();
          this.fetchCashPopup();
        },
        error: (error) => {
          console.error('An Error Occurred', error);
        },
      });
  }

  fetchDefaultCashAccount() {
    //console.log("Fetching default cash account...");
    if (this.pettyCashObj.length > 0) {
      // console.log("Petty cash loaded:", JSON.stringify(this.pettyCashObj, null, 2));
      this.defaultCashAccount = this.pettyCashObj; // Assign loaded petty cash data
    }
    else {
      this.ReceiptvoucherService.getDetails(EndpointConstant.FILLDEFAULTCASHACCOUNT)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            this.defaultCashAccount = response?.data;
            // console.log("Default cash account fetched:", this.defaultCashAccount);
          },
          error: (error) => {
            console.error('An Error Occurred', error);
          },
        });
    }
  }

    fetchCashPopup() {
      if (this.pettyCashObj.length > 0) {
        //console.log("in cash ppp up:", JSON.stringify(this.pettyCashObj, null, 2));
        this.cashPopupObj = this.pettyCashObj;
      }
      else {
        this.ReceiptvoucherService
          .getDetails(EndpointConstant.FILLCASHPOPUP)
          .pipe(takeUntil(this.destroySubscription))
          .subscribe({
            next: (response) => {
              let responseData = response?.data
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

    }
  }
