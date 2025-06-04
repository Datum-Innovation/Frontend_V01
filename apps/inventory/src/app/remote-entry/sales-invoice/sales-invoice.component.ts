import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, QueryList, Renderer2, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { BaseService, CustomDialogueComponent, EndpointConstant, GridNavigationService, MainHeaderComponent, MenuDataService, PdfGenerationService, SearchableDropdownComponent } from '@dfinance-frontend/shared';
import { Account, Branches, Category, CountryOfOrigin, ItemBrand, ItemColor, ItemHistory, ItemMaster, ItemMasters, ItemUnitDetails, Quality, TaxType, UnitData, parentItem } from '../model/itemmaster.interface';
import { finalize, interval, map, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { DatatableComponent, id, SelectionType } from '@swimlane/ngx-datatable';
import { PurchaseService } from '../../services/purchase.service';
import { additonalChargesPopup, bankPopup, cardPopup, cashPopup, chequePopup, Currency, Customer,  CustomerInfo, CustomerMobile, DeliveryLocation, GridSettings, ItemOptions, Items, itemTransaction, PayType, Projects, Purchase, Purchases, Reference, Salesman, SalesmanMobile, SizeMaster, StockItems, Supplier, taxPopup, UnitPopup, UnitPricePopup, VehicleNo, VoucherType, Warehouse } from '../model/purchase.interface';
import { DatePipe, formatDate, formatNumber } from '@angular/common';
import {
  NativeDateAdapter, DateAdapter,
  MAT_DATE_FORMATS
} from '@angular/material/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';

import { BalancedialogComponent } from '../purchase/balancedialog/balancedialog.component';
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

import html2canvas from 'html2canvas';


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
  selector: 'dfinance-frontend-sales-invoice',
  templateUrl: './sales-invoice.component.html',
  styleUrls: ['./sales-invoice.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class SalesInvoiceComponent {

  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  // @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;
  // @ViewChild('ngxTable', { read: ElementRef }) ngxTable!: ElementRef;
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;



  @ViewChild('btngroup') btngroup!: ElementRef;
  @ViewChild('leftsearch') leftsearch!: ElementRef;
  @ViewChild('bottomDiv') bottomDiv!: ElementRef;
  private storageEventHandlerSales!: (event: StorageEvent) => void;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  isInputDisabled: boolean = true;
  salesForm!: FormGroup;
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
  allSalesList = [] as Array<Purchases>;
  tempSalesList: any = [];
  selectedSalesId!: number;
  firstSales!: number;
  expiryitem = true;
  rawmaterials = true;
  finishedgoods = true;
  currentSales = {} as Purchase;
  isUpdate: boolean = false;
  updatedBasicUnit = "";
  selectedBasicUnitObj = {} as UnitData;
  basicUnitOptions: any = [];
  allBasicUnits = [] as Array<UnitData>;
  updatedSellingUnit = "";
  selectedSellingUnitObj = {};
  sellingUnitOptions: any = [];
  allSellingUnits = [] as Array<UnitData>;
  updatedPurchaseUnit = "";
  selectedPurchaseUnitObj = {};
  purchaseUnitOptions: any = [];
  allPurchaseUnits = [] as Array<UnitData>;

  base64String: string = '';
  accid!: number;

  selectedCategory = "";
  selectedCategoryObj = {};
  categoryOptions: any = [];
  allCategories = [] as Array<Category>;
  allTaxTypes = [] as Array<TaxType>;
  selectedTaxTypeObj: any = {};


  selectedParentItemObj: any = {};
  selectedParentItemName: string = "";
  parentItemOptions: any = [];
  allParentItems = [] as Array<parentItem>;

  selectedItemQualityObj: any = {};
  allQualities = [] as Array<Quality>;

  selectedItemColorObj: any = {};
  selectedItemColorName: string = "";
  itemColorOptions: any = [];
  allItemColors = [] as Array<ItemColor>;

  selectedItemBrandObj: any = {};
  selectedItemBrandName: string = "";
  itemBrandOptions: any = [];
  allItemBrands = [] as Array<ItemBrand>;

  selectedCountryOfOriginObj: any = {};
  selectedCountryOfOriginName: string = "";
  countryOfOriginOptions: any = [];
  allCountryOfOrigin = [] as Array<CountryOfOrigin>;

  allInvAccounts = [] as Array<Account>;
  invAccountOptions: any = [];
  selectedInvAccountId: number = 0;
  selectedInvAccountName: string = "";

  allSalesAccounts = [] as Array<Account>;
  salesAccountOptions: any = [];
  selectedSalesAccountId: number = 0;
  selectedSalesAccountName: string = "";

  allCostAccounts = [] as Array<Account>;
  costAccountOptions: any = [];
  selectedCostAccountId: number = 0;
  selectedCostAccountName: string = "";

  allPurchaseAccounts = [] as Array<Account>;
  purchaseAccountOptions: any = [];
  selectedPurchaseAccountId: number = 0;
  selectedPurchaseAccountName: string = "";

  isStockItem = true;
  itemUnitDetails = [] as Array<ItemUnitDetails>;
  itemDetails: any[] = [];

  expireItemDetails: any[] = [];
  copyExpireItemDetails: any = [];

  unitsInGrid: any = [];

  allBranches = [] as Array<Branches>;
  selectedBranches: { id: number, company: string, nature: string }[] = [];
  selectedBranchId: number = 0;
  filledBranchId: number = 0;
  stockToDisplay: number = 0;

  allItemHistoryDetails = [] as Array<ItemHistory>;

  imageData: string | ArrayBuffer | null = null;
  searchTerm: string = '';

  tempItemFillDetails: any = [];
  showImportReferencePopup = false;
  showAdditionalDetails = false;
  showItemDetails = false;
  showAdditionalChargesPopup = false;
  showCashPopup = false;
  showCardPopup = false;
  showChequePopup = false;
  showItemAdditionalChargesPopup = false;
  showTaxPopup = false;
  showAdvanceDetails = false;

  projectData = [] as Array<Projects>;
  projectreturnField = 'projectname';
  projectKeys = ['Project Code', 'Project Name', 'ID'];
  warehouseData = [] as Array<Warehouse>;
  selectedWarehouseObj: any = {}
  updatedProject = '';
  selectedProjectObj: any = {};

  salesmanData = [] as Array<Salesman>;
  salesmanMobileData=[] as Array<SalesmanMobile>
  updatedSalesman = '';
  salesmanField = 'name';
  salesmanKeys = ['Code', 'Name', 'ID'];
  selectedSalesmanObj: any = {};

  customerData = [] as Array<Customer>;
  customerMobileData = [] as Array<CustomerMobile>;
  //customerData = [] as Array<any>;
  updatedCustomer = '';
  customerreturnField = 'id';
  customerKeysMobile=['Account Code', 'Account Name','ID'];
   customerKeys = ['Account Code', 'Account Name', 'Address', 'ID', 'Mobile No', 'VAT No'];
  
  selectedPartyId = 0;
  selectedCustomerObj: any = {};
  customerExcludekeys = ['partyId'];


  partyData = [] as Array<Supplier>;
  //customerInfo=[]as Array<CustomerInfo>;

  pageId = 0;
  voucherNo = 0;
  vNoPart1 = '';
  vNoPart2 = '';

  fillItemsData = [] as Array<Items>; /// load al items
  fillItemDataOptions = [] as Array<ItemOptions>;

  itemCodereturnField = 'itemCode';
  itemCodeKeys = ['Item Code', 'Item Name', 'Bar Code', 'ID', 'Unit', 'Stock', 'Rate', 'Purchase Rate'];
  itemCodeExcludekeys = ['unit'];
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

  voucherTypeData = [] as Array<VoucherType>;
  deliveryLocationData = [] as Array<DeliveryLocation>;
  selectedDeliveryLocationObj: any = {};
  vehicleNoData = [] as Array<VehicleNo>;
  selectedVehicleObj: any = {};
  payTypeObj = [] as Array<PayType>;
  selectedPayType: string | undefined = "";
  selectedPayTypeObj: any = {};
  chequePopupObj = [] as Array<chequePopup>;
  chequePopupGridDetails: any = [];
  cashPopupObj = [] as Array<cashPopup>;
  cashPopupGridDetails: any = [];
  cardPopupObj = [] as Array<cardPopup>;
  cardPopupGridDetails: any = [];
  bankPopupObj = [] as Array<bankPopup>;
  additonalChargesPopupObj = [] as Array<additonalChargesPopup>;
  additonalChargesGridDetails: any = [];
  additonalChargesGridDetailsCopy: any = [];
  taxPopupObj = [] as Array<taxPopup>;

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

  itemTransactionData: any = {} as itemTransaction;
  itemBatchNoreturnField = 'batchNo';
  itemBatchNoKeys = ['BatchNo', 'Qty', 'Expiry Date', 'Printed MRP'];


  itemUnitreturnField = 'unit';
  itemUnitKeys = ['Unit', 'Basic Unit', 'Factor'];

  showPricePopup = false;
  currentItemUnitDetails: any = [] as Array<UnitPricePopup>;

  commonDiscountPercent = 0.00;
  commonDiscountAmount = 0.00;

  currentBranch = 0;
  currentItemId = 0;

  advanceAmountObj: any = [];

  referenceFillData = [] as Array<Reference>;
  currentSalesInfo: any = [];

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
  advancePayableAmount = 0.00;
  referenceData: any = {};
  showDeleteOptions: boolean = false;
  showDeletePopup = false;
  cancelReason: string = "";
  showCancelPopup = false;
  isSalesCancelled = false;
  commonFillData: any = [];
  referenceListarray: any = [];
  itemDetailsObj: any = {
    "transactionId": 0,
    "itemId": 0,
    "itemCode": "",
    "itemName": "",
    "location": "",
    "batchNo": "",
    "unit": {},
    "qty": "",
    "focQty": "",
    "basicQty": 0,
    "additional": 0,
    "rate": "",
    "otherRate": 0,
    "margin": 0,
    "rateDisc": 0,
    "grossAmt": "",
    "discount": "",
    "discountPerc": "",
    "amount": "",
    "taxValue": "",
    "taxPerc": "",
    "printedMRP": 0,
    "ptsRate": 0,
    "ptrRate": 0,
    "pcs": 0,
    "stockItemId": 0,
    "total": "",
    "expiryDate": null,
    "description": null,
    "lengthFt": 0,
    "lengthIn": 0,
    "lengthCm": 0,
    "girthFt": 0,
    "girthIn": 0,
    "girthCm": 0,
    "thicknessFt": 0,
    "thicknessIn": 0,
    "thicknessCm": 0,
    "remarks": "",
    "taxTypeId": 0,
    "taxAccountId": 0,
    "priceCategoryOptions": [],
    "costAccountId": 0,
    "brandId": 0,
    "profit": 0,
    "repairsRequired": "",
    "finishDate": null,
    "updateDate": null,
    "replaceQty": 0,
    "printedRate": 0,
    "hsn": "string",
    "avgCost": 0,
    "isReturn": true,
    "manufactureDate": null,
    "priceCategory": {
      "id": null,
      "name": "",
      "code": "",
      "description": ""
    },
    "sizeMaster": {
      "id": null,
      "name": "",
      "code": "",
      "description": ""
    },
    "uniqueItems": [
      {
        "uniqueNumber": "string"
      }
    ]
  };
  selectedAdvanceData: any = [];
  formVoucherNo: any = 0;
  isReferenceImported = false;

  stockItemObj: any = [] as Array<StockItems>;
  stockItemreturnField = 'itemname';
  stockItemKeys = ['Item Code', 'Item Name', 'ID'];
  currencyDropdown: any = [] as Array<Currency>;
  currentCurrencyRate = 0;
  currentcurrencyObj = {};
  selectedCurrencyId = 0;

  sizeMasterObj: any = [] as Array<SizeMaster>;
  sizemasterreturnField = 'name';
  sizemasterKeys = ['Code', 'Name', 'ID'];

  pricecategoryreturnField = 'pricecategory';
  pricecategoryKeys = ['ID', 'Price Category', 'Perc', 'Rate'];

  selectedRowIndex: any = -1;
  gridsettings: any = [] as Array<GridSettings>;
  gridColumns: any = [];

  isPartySelected: boolean = false;

  //define settings for left side datatable...
  selectedleftrow: any = [];
  //set datatable columns
  enableInlineEditing: boolean = false;
  tablecolumns = [
    { name: '', field: 'id' },
    { name: 'Item Code', field: 'itemcode' },
    { name: 'Item Name', field: 'itemname' },
    { name: 'Stock Item', field: 'stockitem' },
    { name: 'BatchNo', field: 'batchno' },
    { name: 'Unit', field: 'unit' },
    { name: 'Qty', field: 'qty' },
    { name: 'FOCQty', field: 'focqty' },
    { name: 'Pricecategory', field: 'pricecategory' },
    { name: 'Rate', field: 'rate' },
    { name: 'RateWithTax', field: 'ratewithtax' },
    { name: 'GrossAmt', field: 'grossamount' },
    { name: 'Disc %', field: 'discperc' },
    { name: 'Discount', field: 'discount' },
    { name: 'Amount', field: 'amount' },
    { name: 'Tax %', field: 'taxperc' },
    { name: 'TaxValue', field: 'taxvalue' },
    { name: 'SizeMasterID', field: 'sizemasterid' },
    { name: 'Total', field: 'total' },
    { name: 'ExpiryDate', field: 'expirydate' },
  ];

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
  showItemDetailsTab = true;
  showAdditionalDetailsTab = false;
  additionalDetailsForm!: FormGroup;

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
  istoggleActive = false;

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


  

  private logoPath: string = '../assets/SASTC.png';
  partyBalance = 0.0000;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private renderer: Renderer2,
    private PurchaseService: PurchaseService,
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
  showLeftSection: boolean = false;
  // Get a list of all SearchableDropdownComponent instances
  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;
  activePrintOption = false;
  isMobile = false;
  isTab = false;
  ngOnInit(): void {


   this.createForm();
    this.checkDeviceType(); //print
    this.checkScreenSize();
    this.fetchAllSales();
   // this.fetchSalesman(null);
    this.currentBranch = this.baseService.getLocalStorgeItem('current_branch') ? Number(this.baseService.getLocalStorgeItem('current_branch')) : 0;
    this.fetchSettings();
    this.fetchQtySettings();

    this.onClickNewSales();
    this.fetchCommonFillData();
    // this.fetchSalesman();
    this.fetchCustomer();
    this.FillReferenceData();
    this.fetchParty();
    this.fetchVoucherType();
    this.fetchCurrencyDropdown();
    this.fetchTransportationType();
    this.fetchSalesmanArea();
    this.fetchDeliveryLocation();
    this.fetchVehicleNo();

    this.fetchPayType();
    this.fetchChequePopup();
    this.fetchCardPopup();
    //this.fetchCashPopup();
    this.fetchBankDetails();
    this.fetchAdditionalChargesPopup();
    this.fetchItemTransactionData();
    //get page id of customer supplier and item master...
    this.setPageId();

    this.fetchGridSettingsByPageId();
    this.fetchDefaultCardAccount();
    // console.log("calling fetchDefaultcash")
    //this.fetchDefaultCashAccount();
    this.fetchStockItemPopup();
    this.fetchSizeMasterPopup();
    //fetch partybalance amount
    this.fetchPartyBalance();
    window.addEventListener('storage', this.storageEventHandlerSales);

    // Resubscribe to valueChanges after setting initial values
    this.salesForm.valueChanges.subscribe(() => {
      if (this.salesForm.dirty) {
        this.isFormDirty = true;
      }
    });

    this.additionalDetailsForm.valueChanges.subscribe(() => {
      if (this.additionalDetailsForm.dirty) {
        this.isFormDirty = true;
      }
    });
    // Set up interval to call the function every 5 minutes
    this.subscription = interval(60000) // 5 minutes in milliseconds
      .subscribe(() => {
        this.fetchAllSales(); // Call the function every 5 minutes
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
  createForm(){
    this.salesForm = this.formBuilder.group({
      vouchername: [{ value: '', disabled: true }],
      voucherno: [{ value: '', disabled: true }],
      purchasedate: [{ value: this.today, disabled: this.isInputDisabled }, Validators.required],
      reference: [{ value: '', disabled: this.isInputDisabled }],
      customer: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      currency: [{ value: '', disabled: this.isInputDisabled }],
      exchangerate: [{ value: '', disabled: this.isInputDisabled }],
      warehouse: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      project: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      description: [{ value: '', disabled: this.isInputDisabled }],
      approve: [{ value: '', disabled: this.isInputDisabled }],
      terms: [{ value: '', disabled: this.isInputDisabled }],
      totaldiscpercent: [{ value: false, disabled: this.isInputDisabled }],
      discountamount: [{ value: '', disabled: this.isInputDisabled }],
      roundoff: [{ value: '', disabled: this.isInputDisabled }],
      netamount: [{ value: 0.0000, disabled: this.isInputDisabled }],
      tax: [{ value: '', disabled: true }],
      addcharges: [{ value: '', disabled: true }],
      grandtotal: [{ value: 0.0000, disabled: this.isInputDisabled }],
      paytype: [{ value: '', disabled: this.isInputDisabled }],
      advance: [{ value: 0.00, disabled: true }],
      totalpaid: [{ value: 0.0000, disabled: this.isInputDisabled }],
      cash: [{ value: 0.0000, disabled: true }],
      card: [{ value: 0.0000, disabled: true }],
      balance: [{ value: 0.0000, disabled: this.isInputDisabled }],
      cheque: [{ value: 0.0000, disabled: true }],
      duedate: [{ value: '', disabled: this.isInputDisabled }],
      additemcharges: [{ value: false, disabled: this.isInputDisabled }],
      salesman: [{ value: false, disabled: this.isInputDisabled }],
      vatno: [{ value: false, disabled: this.isInputDisabled }],
      partyinvoiceno: [{ value: false, disabled: this.isInputDisabled }],
      partyinvoicedate: [{ value: false, disabled: this.isInputDisabled }]
    });

    // Additional details form 

    this.additionalDetailsForm = this.formBuilder.group({
      invoiceno: [{ value: "", disabled: this.isInputDisabled }],
      invoicedate: [{ value: "", disabled: this.isInputDisabled }],
      orderno: [{ value: "", disabled: this.isInputDisabled }, Validators.required],
      orderdate: [{ value: "", disabled: this.isInputDisabled }],
      partyaddress: [{ value: "", disabled: this.isInputDisabled }, Validators.required],
      expirydate: [{ value: "", disabled: this.isInputDisabled }],
      transportationtype: [{ value: "", disabled: this.isInputDisabled }],
      creditperiod: [{ value: "", disabled: this.isInputDisabled }, Validators.required],
      vehicleno: [{ value: "", disabled: this.isInputDisabled }, Validators.required],
      attention: [{ value: "", disabled: this.isInputDisabled }],
      deliverynote: [{ value: "", disabled: this.isInputDisabled }],
      deliverydate: [{ value: "", disabled: this.isInputDisabled }],
      dispatchno: [{ value: "", disabled: this.isInputDisabled }],
      dispatchdate: [{ value: "", disabled: this.isInputDisabled }],
      partyname: [{ value: "", disabled: this.isInputDisabled }],
      addressline1: [{ value: "", disabled: this.isInputDisabled }],
      addressline2: [{ value: "", disabled: this.isInputDisabled }],
      deliverylocation: [{ value: "", disabled: this.isInputDisabled }],
      terms: [{ value: "", disabled: this.isInputDisabled }],
      salesman: [{ value: "", disabled: this.isInputDisabled }],
      salesarea: [{ value: "", disabled: this.isInputDisabled }],
      staffincentive: [{ value: "", disabled: this.isInputDisabled }],
      staffincentiveperc: [{ value: "", disabled: this.isInputDisabled }],
      mobilenumber: [{ value: "", disabled: this.isInputDisabled }],
    });
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

  fetchAllSales(): void {
    // this.isLoading = true;
    this.PurchaseService
      .getDetails(EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true')
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allSalesList = response?.data;
          this.tempSalesList = [...this.allSalesList];
          this.firstSales = this.allSalesList[0].ID;
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

  onClickNewSales() {
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
    this.salesForm.reset();
    this.additionalDetailsForm.reset();
    this.selectedSalesId = 0;
    this.updatedCustomer = "";
    this.updatedProject = "";
    this.itemDetails = [];
    this.isSalesCancelled = false;
    this.cashAmount = 0;
    this.cardAmount = 0;
    this.chequeAmount = 0;

    this.fillItemsData = [];
    this.importedReferenceList = [];
    if (this.isInputDisabled == true) {
      this.disbaleFormControls();
      this.selectedSalesId = this.firstSales;
      this.fetchPurchaseById();
    } else {
      this.selectedSalesId = 0;
      this.salesForm.patchValue({
        purchasedate: this.today,
        advance: 0.0000,
        netamount: 0.0000,
        grandtotal: 0.0000,
        paytype: this.payTypeObj && this.payTypeObj.length > 0 ? this.payTypeObj[0].id : null,
        salesman: "",
      });
      this.updatedSalesman = "";

      this.enableFormControls();
      this.currentItemTableIndex = 0;
      //empty item detaills....
      this.tempItemFillDetails = [];
      this.itemDetails = [];
      this.invTransactions = [];

      // empty payment popup grid details card,cash and cheque,tax ....
      this.cashPopupGridDetails = [];
      this.cardPopupGridDetails = [];
      this.chequePopupGridDetails = [];
      this.taxPopupObj = [];
      this.advanceAmountObj = [];
      this.referenceData = [];
      this.advancePayableAmount = 0;

      this.addRow();
      this.fetchCommonFillData();
      // this.fetchUserPettyCash();
      this.emptyAllSummaryTotalsAndObjects();
      //set false for is party selected field to false...
      this.isPartySelected = false;
      this.fetchParty();
      setTimeout(() => this.setMaxHeight(), 0);
    }
    return true;
  }

  emptyAllSummaryTotalsAndObjects() {
    this.qtyTotal = 0.0000;
    this.FOCQtyTotal = 0.0000;
    this.grossAmountTotal = 0.0000;
    this.discountTotal = 0.0000;
    this.amountTotal = 0.0000;
    this.taxTotal = 0.0000;
    this.gridItemTotal = 0.0000;
    this.totalAmountPaid = 0.0000;
    this.totalAdditioanalCharges = 0.0000;
    this.amountTotal = 0.0000;
    this.taxTotal = 0.0000;
    this.roundValue = 0.0000;
    this.cardAmount = 0.0000;
    this.cashAmount = 0.0000;
    this.chequeAmount = 0.0000;
    this.grandTotal = 0.0000;
    this.noGridItem = true;
    this.selectedCustomerObj = {};
    this.salesForm.patchValue({
      "roundoff": ""
    });
  }

  fetchCommonFillData() {
    console.log("Token:"+this.baseService.getToken())
    this.PurchaseService
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
          //warehouse data...
          if (this.isMobile) {
            this.salesForm.get('warehouse')?.disable();
          } else {
            this.salesForm.get('warehouse')?.enable();
          }
          
          this.warehouseData = this.commonFillData?.wareHouse;
          // if (this.warehouseData?.length > 0) {
          //   this.salesForm.patchValue({
          //     warehouse: this.warehouseData[0].id
          //   });
          // }
          //setting voucher data..
          this.setVoucherData();
          //calling petty cash data...
          this.fetchUserPettyCash();

        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  setVoucherData() {
    //set voucher name and number...
    this.vocherName = this.commonFillData.vNo?.code;
    this.salesForm.patchValue({
      vouchername: this.vocherName,
      voucherno: this.commonFillData.vNo?.result,
    });
    this.formVoucherNo = this.commonFillData.vNo?.result;
  }

  
  
  // fetchSalesman() {
  //   this.PurchaseService
  //     .getDetails(EndpointConstant.FILLPURCHASESALESMAN)
  //     .pipe(takeUntil(this.destroySubscription))
  //     .subscribe({
  //       next: (response) => {
  //         this.salesmanData = response?.data;
  //       },
  //       error: (error) => {
  //         console.error('An Error Occured', error);
  //       },
  //     });
  // }

  

//  fetchSalesman() {
    // this.PurchaseService
    //   .getDetails(EndpointConstant.FETCHSALESMANMOBILE)
    //   .pipe(takeUntil(this.destroySubscription))
    //   .subscribe({
    //     next: (response) => {
    //       this.salesmanMobileData = response?.data;
    //       console.log(JSON.stringify(this.salesmanMobileData,null,2))
    //     },
    //     error: (error) => {
    //       console.error('An Error Occured', error);
    //     },
    //   });
    //   if (this.salesmanMobileData.length > 0) {
    //     this.salesmanData = this.salesmanMobileData;
    //     console.log("Salesman mobile :", JSON.stringify(this.salesmanData, null, 2));
      
    //     let firstSalesman = this.salesmanData[0]; // pick the first salesman (or whatever logic you want)
    //   console.log("Salesman name:"+firstSalesman)
    //     this.salesForm.patchValue({
    //       salesman: firstSalesman.name, // 👉 fill with name
    //     });
    //   }
      
    // this.PurchaseService
    //   .getDetails(EndpointConstant.FILLPURCHASESALESMAN)
    //   .pipe(takeUntil(this.destroySubscription))
    //   .subscribe({
    //     next: (response) => {
    //       this.salesmanData = response?.data;
    //       console.log(JSON.stringify(this.salesmanData,null,2))
    //     },
    //     error: (error) => {
    //       console.error('An Error Occured', error);
    //     },
    //   });
  //}

  fetchCustomer() {
    if (this.isMobile) {
      //console.log("mobile view")
      this.PurchaseService
        .getDetails(EndpointConstant.FETCHCUSTOMERMOBILE)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            let responseData = response?.data?.customerData;
            console.log(JSON.stringify(responseData,null,2))
            this.customerData = responseData.map((item: any) => ({
              accountCode: item.accountCode,
              accountName: item.accountName,    
             //address: item.address   ,       
              id: item.id,
             // mobileNo: null,
               //salesManID: item.salesManID,
              //  salesman:item.salesman,
             // vatNo: item.vatNo,
             // partyId: item.partyID,
             
              
            }));
           

            if (this.customerData.length > 0) {
              const salesmanName = responseData[0].salesman; // or any selected item
              this.salesForm.patchValue({
                salesman: salesmanName
              });
            }
            this.prevPayType = response?.data?.prevPayType;
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
    else {
     // console.log("desktop view")
      this.PurchaseService
        .getDetails(EndpointConstant.FILLSALESCUSTOMER + "&voucherId=" + this.voucherNo + "&pageId=" + this.pageId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            let responseData = response?.data?.customerData;
            this.customerData = responseData.map((item: any) => ({
              accountCode: item.accountCode,
              accountName: item.accountName,
              address: item.address,
              id: item.id,
              mobileNo: item.mobileNo,
              vatNo: item.vatNo,
              partyId: item.partyID
            }));
            this.prevPayType = response?.data?.prevPayType;
            this.address = responseData[0]?.address || '';
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }


  }

  fetchParty() {
    this.PurchaseService
      .getDetails(EndpointConstant.FILLPURCHASEPARTY + "&voucherId=" + this.voucherNo + "&pageId=" + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data?.customerData;
          this.partyData = responseData.map((item: any) => ({
            accountCode: item.accountCode,
            accountName: item.accountName,
            address: item.address,
            id: item.id,
            mobileNo: item.mobileNo,
            vatNo: item.vatNo
          }));

          this.fetchDefaultCustomer();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchDefaultCustomer() {
    this.PurchaseService
      .getDetails(EndpointConstant.FETCHDEFAULTCUSTOMER)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data;
          if (Array.isArray(responseData) && responseData.length > 0) {
            this.defaultCustomer = responseData[0].accountID;
            this.onCustomerSelected(responseData[0].accountID, false);
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchVoucherType() {
    this.partyId = this.selectedPartyId;
    this.PurchaseService
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

  fetchTransportationType() {
    this.PurchaseService
      .getDetails(EndpointConstant.FILLTRANSPORTATIONTYPE)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.transportationTypeArr = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchSalesmanArea() {
    this.PurchaseService
      .getDetails(EndpointConstant.FILLSALESMANAREA)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.salesmanAreaArr = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchDeliveryLocation() {
    this.deliveryLocationData = [];
    if (this.selectedPartyId != 0) {
      this.PurchaseService
        .getDetails(EndpointConstant.FILLDELIVERYLOCATION + this.selectedPartyId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {

            let itemData = response?.data.map((item: any) => ({
              id: item.id,
              locationname: item.location,
              projectname: item.projectName,
              contactperson: item.contactPerson,
              contactno: item.contactNo,
              address: item.address
            }));
            this.deliveryLocationData = itemData;
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
  }

  fetchVehicleNo() {
    this.vehicleNoData = [];
    this.PurchaseService
      .getDetails(EndpointConstant.FILLVEHICLENO)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let data = response?.data.map((item: any) => ({
            vehicleNo: item.vehicleNo,
            name: item.name,
            code: item.code,
            id: item.id
          }));
          this.vehicleNoData = data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchPayType() {
    this.PurchaseService
      .getDetails(EndpointConstant.FILLPAYTYPE)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data;
          if (responseData) {
            this.payTypeObj = response?.data.payType;
            this.isDefaultCash = response?.data.defaultCash;
            // if (this.payTypeObj?.length > 0) {
            //   this.salesForm.patchValue({
            //     paytype: this.payTypeObj[0].id
            //   });
            //   this.onChangePayType();
            // }
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  onChangePayType() {
    let paytypeId = this.salesForm.get('paytype')?.value;
    this.payTypeObj.find(paytype => {
      if (paytype.id == paytypeId) {
        this.selectedPayType = paytype.name;
        this.selectedPayTypeObj = {
          "id": paytype.id,
          "value": paytype.name
        };
      }
    });
    // this.salesForm.get('card')?.enable();
    // this.salesForm.get('cheque')?.enable();
    this.enableCreditOption = false;
    this.enableCashOption = false;
    if (this.selectedPayType == 'Credit') {
      this.enableCreditOption = true;
      // this.salesForm.get('card')?.disable();
    } else if (this.selectedPayType == 'Cash') {
      this.enableCashOption = true;
      //this.salesForm.get('cheque')?.disable();
    }
  }

  fetchChequePopup() {
    this.PurchaseService
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
  //   this.PurchaseService
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

  fetchBankDetails() {
    this.PurchaseService
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

  fetchCardPopup() {
    this.PurchaseService
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

  fetchAdditionalChargesPopup() {
    this.PurchaseService
      .getDetails(EndpointConstant.FILLADDITIONALCHARGESPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data
          this.additonalChargesPopupObj = responseData.map((item: any) => ({
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

  fetchItemTransactionData() {
    this.PurchaseService
      .getDetails(EndpointConstant.FILLITEMTRANSACTIONDATA)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.itemTransactionData = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchDefaultCardAccount() {
    this.PurchaseService
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
  //   this.PurchaseService
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

  fetchStockItemPopup() {
    if (this.showStockItemField) {
      this.PurchaseService
        .getDetails(EndpointConstant.FILLSTOCKITEMPOPUP)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            let result = response?.data;
            if (result) {
              result.forEach((stock: any) => {
                this.stockItemObj.push({
                  "itemcode": stock.itemCode,
                  "itemname": stock.itemName,
                  "id": stock.id
                })
              });
            }
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
  }

  fetchSizeMasterPopup() {
    if (this.showStockItemField) {
      this.PurchaseService
        .getDetails(EndpointConstant.FILLSIZEMASTERPOPUP)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            let result = response?.data;
            result.forEach((sizemaster: any) => {
              this.sizeMasterObj.push({
                "code": sizemaster.code,
                "name": sizemaster.sizeMasterName,
                "id": sizemaster.id,
                "description": ""
              });
            });
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
  }

  fetchPartyBalance() {
    this.PurchaseService
      .getDetails(EndpointConstant.FETCHPARTYBALANCE + this.selectedPartyId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let result = response?.data;
          this.partyBalance = this.baseService.formatInput(result[0].stock);
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  fetchQtySettings() {
    this.PurchaseService
      .getDetails(EndpointConstant.FETCHQTYSETTINGS)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.defaultQtySetting = response ? response.data.defaultQuantity : 0;
          this.showRateWithTax = response.data.rateWithTax;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchGridSettingsByPageId() {
    if (this.showStockItemField) {
      this.PurchaseService
        .getDetails(EndpointConstant.FILLGRIDSETTINGSBYPAGEID + this.pageId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            this.gridsettings = response?.data;
            this.gridColumns = this.gridsettings.map((setting: any) => setting.columnName);

            //set to show  fields for stockitem, pricecategory and sizemaster in grid 
            this.setSettingsBasedGridFields();
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
  }

  setSettingsBasedGridFields() {
    //check and remove stockitem, pricecategory and sizemaster id from column list
    if (!this.gridColumns.includes('StockItem') || !this.showStockItemField) {
      this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'stockitem');
    }
    if (!this.gridColumns.includes('PriceCategory')) {
      this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'pricecategory');
    }
    if (!this.gridColumns.includes('SizeMasterID')) {
      this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'sizemasterid');
    }
    if (this.showRateWithTax == 0) {
      this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'ratewithtax');
    }
  }

  fetchCurrencyDropdown() {
    if (this.multiCurrencySupport) {
      this.PurchaseService
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
      this.PurchaseService.updateDetails(EndpointConstant.UPDATEEXCHANGERATE + this.selectedCurrencyId + '&exchRate=' + this.currentCurrencyRate, {})
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

  setPageId() {
    let customerSupplierUrl = "General/Customer-Supplier";
    let cusSupPageInfo = this.baseService.getMenuByUrl(customerSupplierUrl);
    this.customerSupplierPageId = cusSupPageInfo?.id;

    //item master...
    let itemMasterUrl = "General/Customer-Supplier";
    let itemMasterPageInfo = this.baseService.getMenuByUrl(itemMasterUrl);
    this.itemmasterPageId = itemMasterPageInfo?.id;
  }

  FillReferenceData() {
    this.PurchaseService
      .getDetails(EndpointConstant.FILLREFERENCEDATA + this.voucherNo)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.referenceFillData = response?.data;

        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  FillTaxAccount(taxAccountId: number, oldTaxAmount: number, rowIndex: number) {
    let gridTaxAmount = this.itemDetails[rowIndex]['taxValue'];
    this.PurchaseService
      .getDetails(EndpointConstant.FILLTAXACCOUNTDATA + taxAccountId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let taxAccountData = response?.data[0];
          let taxExists = false;
          this.taxPopupObj.forEach((tax) => {
            if (tax.taxid === taxAccountId) {
              tax.amount = tax.amount - oldTaxAmount + Number(gridTaxAmount);
              tax.amount = this.baseService.formatInput(tax.amount);
              taxExists = true;
            }
          });
          if (taxExists == false) {
            let taxobj: any = {
              taxid: taxAccountId,
              accountCode: {
                alias: taxAccountData.alias,
                name: taxAccountData.name,
                id: taxAccountData.id
              },
              discription: "",
              amount: gridTaxAmount,
              payableAccount: {}
            };

            this.taxPopupObj.push(taxobj);
            this.taxPopupObj = [...this.taxPopupObj];
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
//fetch data from database ( items- )
//   fetchItemFillData() {
//     this.partyId = this.selectedPartyId;
//     this.locId = this.salesForm.get('warehouse')?.value;
//     let getparms = 'partyId=' + this.partyId + '&locId=' + this.locId ;

//    // itemtext!=null?
//     getparms = 'partyId=' + this.partyId + '&locId=' + this.locId //+ '&itemkey=' + itemtext:'';
// // console.log("Item api:"+EndpointConstant.FILLPURCHASEITEMS + getparms)
// //console.log("Item api:"+EndpointConstant.FILLPURCHASEITEMS + "PageID="+this.pageId+"&locId="+this.locId+"&voucherId="+this.voucherNo+"&partyId="+this.partyId)
//     this.PurchaseService
//       .getDetails(EndpointConstant.FILLPURCHASEITEMS+"PageID="+this.pageId+"&locId="+this.locId+"&voucherId="+this.voucherNo+"&partyId="+this.partyId)
//      // .getDetails(EndpointConstant.FILLPURCHASEITEMS + "PageID="+this.pageId+"&locId="+this.locId+"&voucherId="+this.voucherNo+"&partyId="+this.partyId)
//       .pipe(takeUntil(this.destroySubscription))
//       .subscribe({
//         next: (response) => {
         
//           let responseData = response?.data.items;
//           console.log("fill item data:"+JSON.stringify(responseData,null,2))
//           console.log("No of items:"+responseData.length)
//           let itemData = responseData.map((item: any) => {
//             let unitObj = item.unitPopup.find((unit: any) => unit.unit === item.item.unit);

//             return {
//               itemCode: item.item.itemCode,
//               itemName: item.item.itemName,
//               barCode: item.item.barCode,
//               id: item.item.id,
//               unitname: unitObj?.unit,
//               stock: item.item.stock,
//               rate: item.item.rate,
//               purchaseRate: item.item.purchaseRate,
//               unit: unitObj ? {
//                 unit: unitObj.unit,
//                 basicUnit: unitObj.basicUnit,
//                 factor: unitObj.factor
//               } : {},
//             };
//           });

//           // push our inital complete list
//           this.fillItemsData = responseData;
//           this.fillItemDataOptions = itemData;

//           if (this.fillItemsData.length > 0) {
//             //set expiry details ...
//             this.setExpiryDetailsFromFill(this.invTransactions);
//             //set gridDetails
//             this.setGridDetailsFromFill(this.invTransactions);
//           }
//           //set item details from import reference...
//           this.setItemDetailsFromImportReference();
//         },
//         error: (error) => {
//           console.error('An Error Occured', error);
//         },
//       });
//   }


fetchItemFillData() {
  console.log("Token in item call:"+this.baseService.getToken())
  this.partyId = this.selectedPartyId;
  this.locId = this.salesForm.get('warehouse')?.value;
  let getparms = 'partyId=' + this.partyId + '&locId=' + this.locId ;

 // itemtext!=null?
  getparms = 'partyId=' + this.partyId + '&locId=' + this.locId //+ '&itemkey=' + itemtext:'';
// console.log("Item api:"+EndpointConstant.FILLPURCHASEITEMS + getparms)
//console.log("Item api:"+EndpointConstant.FILLPURCHASEITEMS + "PageID="+this.pageId+"&locId="+this.locId+"&voucherId="+this.voucherNo+"&partyId="+this.partyId)
  this.PurchaseService
    .getDetails(EndpointConstant.FILLPURCHASEITEMS+"PageID="+this.pageId+"&locId="+this.locId+"&voucherId="+this.voucherNo+"&partyId="+this.partyId)
   // .getDetails(EndpointConstant.FILLPURCHASEITEMS + "PageID="+this.pageId+"&locId="+this.locId+"&voucherId="+this.voucherNo+"&partyId="+this.partyId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
       
        let responseData = response?.data.items;
        console.log("fill item data:"+JSON.stringify(responseData,null,2))
        console.log("No of items:"+responseData.length)
        let itemData = responseData.map((item: any) => {
         // let unitObj = item.unitPopup.find((unit: any) => unit.unit === item.item.unit);

          return {
            itemCode: item.itemCode,
            itemName: item.itemName,
            barCode: item.barCode,
            id: item.id,
            unitname: item.unit,
            stock: item.stock,
            rate: item.rate,
            purchaseRate: item.purchaseRate,
            // unit: unitObj ? {
            //   unit: unitObj.unit,
            //   basicUnit: unitObj.basicUnit,
            //   factor: unitObj.factor
            // } : {},
          };
        }
       );

        // push our inital complete list
        this.fillItemsData = responseData;
        this.fillItemDataOptions = itemData;

        if (this.fillItemsData.length > 0) {
          //set expiry details ...
          this.setExpiryDetailsFromFill(this.invTransactions);
          //set gridDetails
          this.setGridDetailsFromFill(this.invTransactions);
        }
        //set item details from import reference...
        this.setItemDetailsFromImportReference();
      },
      error: (error) => {
        console.error('An Error Occured', error);
      },
    });
}




  setItemDetailsFromImportReference() {
    //set item details if import reference details are there ..
    if (this.importedReferenceList.length > 0 && !this.isReferenceImported) {
      //remove last empty array from grid 
      let index = this.itemDetails.length - 1;
      this.itemDetails.splice(index, 1);
      this.importedReferenceList.forEach((element: any) => {
        const itemExists = this.itemDetails.some((existingItem: any) =>
          existingItem.transactionId === element.TransactionID && existingItem.itemId === element.ItemID
        );
        if (!itemExists) {
          let unitInfoOptions: any = [];

          this.fillItemsData.forEach((itemInfo: any) => {
            if (itemInfo.item.itemCode === element.ItemCode) {
              itemInfo.unitPopup.forEach((unitInfo: any) => {
                let unitObj = {
                  "unit": unitInfo.unit,
                  "basicunit": unitInfo.basicUnit,
                  "factor": unitInfo.factor
                }
                unitInfoOptions.push(unitObj);
              });
            }
          });
          let unitObj = unitInfoOptions.find((unit: any) => unit.unit === element.Unit)
          let insertItem = { ...this.itemDetailsObj };
          insertItem.itemId = element.ItemID;
          insertItem.itemCode = element.ItemCode;
          insertItem.itemName = element.ItemName;
          insertItem.batchNo = this.itemTransactionData.batchNo ?? 0;
          insertItem.unit = unitObj;
          insertItem.unitsPopup = unitInfoOptions;
          insertItem.qty = Number(element.Qty);
          insertItem.focQty = Number(element.FOCQty);
          insertItem.rate = this.baseService.formatInput(Number(element.Rate));
          insertItem.grossAmt = 0.0000;
          insertItem.discountPerc = Number(element.DiscountPerc);
          insertItem.discount = this.baseService.formatInput(Number(element.Discount));
          insertItem.amount = this.baseService.formatInput(Number(element.Amount));
          insertItem.taxPerc = element.TaxPerc ? element.TaxPerc : 0;
          insertItem.taxValue = this.baseService.formatInput(Number(element.TaxValue));
          insertItem.total = 0.0000;
          insertItem.expiryDate = element.ExpiryDate ? new Date(element.ExpiryDate).toISOString() : null;
          insertItem.transactionId = element.TransactionID;
          insertItem.taxAccountId = element.TaxAccountID ? element.TaxAccountID : 0;
          insertItem.refTransItemId = element.ID;
          this.itemDetails.push(insertItem);
          if (unitInfoOptions.length == 0) {
            this.fetchItemUnits(element.ItemID, this.itemDetails.length - 1, element.Unit);
          }
          let rowIndex = this.itemDetails.length - 1;
          this.calculateItemAmount(rowIndex);
          this.FillTaxAccount(this.itemDetails[rowIndex]['taxAccountId'], 0, rowIndex);
        } else {
          const itemFound = this.itemDetails.find((existingItem: any) =>
            existingItem.transactionId === element.transactionId && existingItem.itemId === element.itemId
          );
          // If the item exists, increment its quantity
          itemFound.qty += 1;
        }
      });
      // Push the new itemDetailsObj to itemDetails if the last item is not empty
      this.itemDetails.push({ ...this.itemDetailsObj });

      this.noGridItem = false;
      this.currentItemTableIndex = this.itemDetails.length - 1;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
      this.isReferenceImported = true;
      this.calculateTotals();
    }
  }

  fetchItemUnits(itemId: any, rowIndex: any, unitInp: any) {
    this.PurchaseService
      .getDetails(EndpointConstant.FETCHPURCHASEITEMUNITDETAILS + itemId + '&BranchId=' + this.currentBranch)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let unitsArr = response?.data;
          let unitOptions: any = [];
          unitsArr.forEach((unitInfo: any) => {
            unitOptions.push({
              "unit": unitInfo.unit,
              "basicunit": unitInfo.basicUnit,
              "factor": unitInfo.factor
            })
          });
          this.itemDetails[rowIndex]['unitsPopup'] = unitOptions;
          let unitObj = unitOptions.find((unit: any) => unit.unit === unitInp)

          this.itemDetails[rowIndex]['unit'] = unitObj;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  generateItemCode() {
    this.isLoading = true;
    this.PurchaseService
      .getDetails(EndpointConstant.FETCHNEWITEMCODE)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.salesForm.patchValue({
            itemcode: response.data
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  enableFormControls() {
    this.salesForm.get('purchasedate')?.enable();
    this.salesForm.get('reference')?.enable();
    this.salesForm.get('customer')?.enable();
    this.salesForm.get('currency')?.enable();
    this.salesForm.get('exchangerate')?.enable();
    this.salesForm.get('warehouse')?.enable();
    this.salesForm.get('project')?.enable();
    this.salesForm.get('description')?.enable();
    this.salesForm.get('approve')?.enable();
    this.salesForm.get('terms')?.enable();
    this.salesForm.get('totaldiscpercent')?.enable();
    this.salesForm.get('discountamount')?.enable();
    this.salesForm.get('roundoff')?.enable();
    this.salesForm.get('netamount')?.enable();
    this.salesForm.get('grandtotal')?.enable();
    this.salesForm.get('paytype')?.enable();
    this.salesForm.get('totalpaid')?.enable();
    this.salesForm.get('balance')?.enable();
    this.salesForm.get('duedate')?.enable();
    this.salesForm.get('additemcharges')?.enable();
    this.salesForm.get('salesman')?.enable();
    this.salesForm.get('vatno')?.enable();
    this.salesForm.get('partyinvoiceno')?.enable();
    this.salesForm.get('partyinvoicedate')?.enable();

    //enable additional details form 

    this.additionalDetailsForm.get('invoiceno')?.enable();
    this.additionalDetailsForm.get('invoicedate')?.enable();
    this.additionalDetailsForm.get('orderno')?.enable();
    this.additionalDetailsForm.get('orderdate')?.enable();
    this.additionalDetailsForm.get('partyaddress')?.enable();
    this.additionalDetailsForm.get('expirydate')?.enable();
    this.additionalDetailsForm.get('transportationtype')?.enable();
    this.additionalDetailsForm.get('creditperiod')?.enable();
    this.additionalDetailsForm.get('vehicleno')?.enable();
    this.additionalDetailsForm.get('attention')?.enable();
    this.additionalDetailsForm.get('deliverynote')?.enable();
    this.additionalDetailsForm.get('deliverydate')?.enable();
    this.additionalDetailsForm.get('dispatchno')?.enable();
    this.additionalDetailsForm.get('dispatchdate')?.enable();
    this.additionalDetailsForm.get('partyname')?.enable();
    this.additionalDetailsForm.get('addressline1')?.enable();
    this.additionalDetailsForm.get('addressline2')?.enable();
    this.additionalDetailsForm.get('deliverylocation')?.enable();
    this.additionalDetailsForm.get('terms')?.enable();

    this.additionalDetailsForm.get('salesman')?.enable();
    this.additionalDetailsForm.get('salesarea')?.enable();
    this.additionalDetailsForm.get('staffincentive')?.enable();
    this.additionalDetailsForm.get('staffincentiveperc')?.enable();
    this.additionalDetailsForm.get('mobilenumber')?.enable();
  }

  disbaleFormControls() {
    this.salesForm.get('purchasedate')?.disable();
    this.salesForm.get('reference')?.disable();
    this.salesForm.get('customer')?.disable();
    this.salesForm.get('currency')?.disable();
    this.salesForm.get('exchangerate')?.disable();
    this.salesForm.get('warehouse')?.disable();
    this.salesForm.get('project')?.disable();
    this.salesForm.get('description')?.disable();
    this.salesForm.get('approve')?.disable();
    this.salesForm.get('terms')?.disable();
    this.salesForm.get('totaldiscpercent')?.disable();
    this.salesForm.get('discountamount')?.disable();
    this.salesForm.get('roundoff')?.disable();
    this.salesForm.get('netamount')?.disable();
    this.salesForm.get('grandtotal')?.disable();
    this.salesForm.get('paytype')?.disable();
    this.salesForm.get('totalpaid')?.disable();
    this.salesForm.get('balance')?.disable();
    this.salesForm.get('duedate')?.disable();
    this.salesForm.get('additemcharges')?.disable();
    this.salesForm.get('salesman')?.disable();
    this.salesForm.get('vatno')?.disable();
    this.salesForm.get('partyinvoiceno')?.disable();
    this.salesForm.get('partyinvoicedate')?.disable();

    //Disable additional details ..
    this.additionalDetailsForm.get('invoiceno')?.disable();
    this.additionalDetailsForm.get('invoicedate')?.disable();
    this.additionalDetailsForm.get('orderno')?.disable();
    this.additionalDetailsForm.get('orderdate')?.disable();
    this.additionalDetailsForm.get('partyaddress')?.disable();
    this.additionalDetailsForm.get('expirydate')?.disable();
    this.additionalDetailsForm.get('transportationtype')?.disable();
    this.additionalDetailsForm.get('creditperiod')?.disable();
    this.additionalDetailsForm.get('vehicleno')?.disable();
    this.additionalDetailsForm.get('attention')?.disable();
    this.additionalDetailsForm.get('deliverynote')?.disable();
    this.additionalDetailsForm.get('deliverydate')?.disable();
    this.additionalDetailsForm.get('dispatchno')?.disable();
    this.additionalDetailsForm.get('dispatchdate')?.disable();
    this.additionalDetailsForm.get('partyname')?.disable();
    this.additionalDetailsForm.get('addressline1')?.disable();
    this.additionalDetailsForm.get('addressline2')?.disable();
    this.additionalDetailsForm.get('deliverylocation')?.disable();
    this.additionalDetailsForm.get('terms')?.disable();

    this.additionalDetailsForm.get('salesman')?.enable();
    this.additionalDetailsForm.get('salesarea')?.enable();
    this.additionalDetailsForm.get('staffincentive')?.enable();
    this.additionalDetailsForm.get('staffincentiveperc')?.enable();
    this.additionalDetailsForm.get('mobilenumber')?.enable();
  }

  settingCashAmountOnSave() {
    this.setDefaultAmounttoCash();
    this.cashAmount = this.balanceAmount;
    this.totalAmountPaid = this.convertAmount(this.cardAmount) + this.convertAmount(this.cashAmount) + this.convertAmount(this.chequeAmount) + this.convertAmount(this.advanceAmount);
    this.balanceAmount = Math.abs(this.grandTotal - this.totalAmountPaid);
    this.totalAmountPaid = this.baseService.formatInput(this.totalAmountPaid);
    this.balanceAmount = this.baseService.formatInput(this.balanceAmount);
    this.salesForm.patchValue({
      "totalpaid": this.totalAmountPaid,
      "balance": this.balanceAmount
    });
    // console.log(this.balanceAmount);
  }

  onClickSaveSales() {
    if (this.salesForm.get('customer')?.value == null) {
      this.baseService.showCustomDialogue('Enter Customer/Supplier and proceed');
      this.moveFocusToDropdown('customer');
      return false;
    } else if (this.grandTotal == 0) {
      this.baseService.showCustomDialogue('Amount must be greater than zero');
      return false;
    }

    //check if paytype is cash and customer not paid amount and isdefault is true  ...
    if (this.selectedPayTypeObj.value == 'Cash' && this.balanceAmount > 0 && this.cashAmount == 0) {
      if (!this.isDefaultCash) {
        if (confirm('Do you want to allocate the balance amount to default cash account')) {
          this.settingCashAmountOnSave();
        } else {
          alert('Balance must be zero for cash type');
          return;
        }
      } else {
        this.settingCashAmountOnSave();
      }
    }

    //fetch project data...
    if (this.salesForm.value.project) {
      this.projectData.forEach((element: any) => {
        if (element.projectname == this.salesForm.value.project) {
          this.selectedProjectObj = {
            "id": element.id,
            "name": element.projectcode,
            "code": element.projectname,
            "description": ""
          };
        }
      });
    }
    //set warehouse data..
    if (this.salesForm.get('warehouse')?.value) {
      this.warehouseData.forEach((element: any) => {
        if (element.id == this.salesForm.get('warehouse')?.value) {
          this.selectedWarehouseObj = {
            "id": element.id,
            "value": element.name
          };
        }
      });
    }
    //set transportation type..
    if (this.additionalDetailsForm.get('transportationtype')?.value) {
      this.transportationTypeArr.forEach((element: any) => {
        if (element.id == this.additionalDetailsForm.get('transportationtype')?.value) {
          this.selectedtransPortationType = {
            "id": element.id,
            "value": element.value
          };
        }
      });
    }
    //set salesman data...
    if (this.salesForm.get('salesman')?.value) {
      this.salesmanData.forEach((element: any) => {
        if (element.name == this.salesForm.get('salesman')?.value) {
          this.selectedSalesmanObj = {
            "id": element.id,
            "name": element.name,
            "code": element.code,
            "description": ""
          };
        }
      });
    }

    //set salesman area..
    if (this.additionalDetailsForm.get('salesarea')?.value) {
      this.salesmanAreaArr.forEach((element: any) => {
        if (element.id == this.additionalDetailsForm.get('salesarea')?.value) {
          this.selectedSalesAreaObj = {
            "id": element.id,
            "value": element.name
          };
        }
      });
    }
    //set vehicleno data...
    if (this.additionalDetailsForm.get('vehicleno')?.value) {
      this.vehicleNoData.forEach((element: any) => {
        if (element.vehicleNo == this.additionalDetailsForm.get('vehicleno')?.value) {
          this.selectedVehicleObj = {
            "id": element.id,
            "name": element.name,
            "code": element.vehicleNo,
            "description": ""
          };
        }
      });
    }
    //set delivery location data...
    if (this.additionalDetailsForm.get('deliverylocation')?.value) {
      this.deliveryLocationData.forEach((element: any) => {
        if (element.locationname == this.additionalDetailsForm.get('deliverylocation')?.value) {
          this.selectedDeliveryLocationObj = {
            "id": element.id,
            "name": element.locationname,
            "code": element.projectname,
            "description": ""
          };
        }
      });
    }
    //removing last entry from item details ..
    this.itemDetails.pop();

    //check if paytype is credit and customer paid full amount then change paytype into cash type ...
    if (this.selectedPayTypeObj.value == 'Credit' && this.balanceAmount == 0) {
      let foundPayType = this.payTypeObj.find(item => item.name === 'Cash');
      this.selectedPayTypeObj = {
        "id": foundPayType?.id,
        "value": foundPayType?.name
      }
    }

    //check if paytype is cash and customer paid partial amount then change paytype into credit type ...
    if (this.selectedPayTypeObj.value == 'Cash' && this.balanceAmount > 0 && this.totalAmountPaid != 0) {
      if (confirm('Do you want to update paytype as Credit')) {
        let foundPayType = this.payTypeObj.find(item => item.name === 'Credit');
        this.selectedPayTypeObj = {
          "id": foundPayType?.id,
          "value": foundPayType?.name
        }
      }
    }

    const payload = {
      "id": this.selectedSalesId ? this.selectedSalesId : 0,
      "voucherNo": this.formVoucherNo,
      "date": this.salesForm.value.purchasedate,
      "reference": this.salesForm.value.reference,
      "references": this.referenceListarray,
      "party": this.selectedCustomerObj,
      "currency": this.currentcurrencyObj,
      "exchangeRate": this.currentCurrencyRate,
      "project": this.selectedProjectObj,
      "description": this.salesForm.value.description,
      "grossAmountEdit": this.isgrossAmountEditable,
      "fiTransactionAdditional": {
        "transactionId": 0,
        "terms": this.salesForm.value.terms,
        "warehouse": this.selectedWarehouseObj,
        "partyInvoiceNo": this.additionalDetailsForm.value.invoiceno,
        "partyDate": this.additionalDetailsForm.value.invoicedate,
        "orderDate": this.additionalDetailsForm.value.orderdate,
        "orderNo": this.additionalDetailsForm.value.orderno,
        "partyNameandAddress": this.additionalDetailsForm.value.partyaddress,
        "expiryDate": this.additionalDetailsForm.value.expirydate,
        "transPortationType": this.selectedtransPortationType,
        "creditPeriod": this.additionalDetailsForm.value.creditperiod,
        "salesMan": this.selectedSalesmanObj,
        "salesArea": this.selectedSalesAreaObj,
        "staffIncentives": this.additionalDetailsForm.value.staffincentive,
        "mobileNo": this.additionalDetailsForm.value.mobilenumber,
        "vehicleNo": this.selectedVehicleObj,
        "attention": this.additionalDetailsForm.value.attention,
        "despatchNo": this.additionalDetailsForm.value.dispatchno,
        "despatchDate": this.additionalDetailsForm.value.dispatchdate,
        "deliveryDate": this.additionalDetailsForm.value.deliverydate,
        "deliveryNote": this.additionalDetailsForm.value.deliverynote,
        "partyName": this.additionalDetailsForm.value.partyname,
        "addressLine1": this.additionalDetailsForm.value.addressline1,
        "addressLine2": this.additionalDetailsForm.value.addressline2,
        "delivaryLocation": this.selectedDeliveryLocationObj,
        "termsOfDelivery": this.additionalDetailsForm.value.term,
        "payType": this.selectedPayTypeObj,
        "approve": this.salesForm.value.approve,
        "days": 0,
        "closeVoucher": true,
        "code": "string",
        "isHigherApproval": true,
        "vatNo": this.salesForm.value.vatno
      },
      "items": this.itemDetails,
      "transactionEntries": {
        "totalDisc": this.discountTotal,
        "amt": this.grossAmountTotal,
        "roundoff": this.roundValue,
        "netAmount": this.salesForm.value.netamount,
        "grandTotal": this.grandTotal,
        "payType": this.selectedPayTypeObj,
        "dueDate": this.salesForm.value.duedate,
        "totalPaid": this.salesForm.value.totalpaid,
        "balance": this.salesForm.value.balance,
        "advance": this.selectedAdvanceData,
        "cash": this.cashPopupGridDetails,
        "card": this.cardPopupGridDetails,
        "cheque": this.chequePopupGridDetails,
        "tax": this.taxPopupObj,
        "addCharges": this.additonalChargesGridDetails
      },
      "cancelled": false
    };
    if (this.isUpdate) {
      this.updateCallback(payload);
    } else {
      this.createCallback(payload);
    }
    return true;
  }

  updateCallback(payload: any) {
    this.PurchaseService.updateDetails(EndpointConstant.UPDATESALES + this.pageId + '&voucherId=' + this.voucherNo, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (!this.activePrintOption) {
            this.baseService.showCustomDialogue(response.data);
          } else {
            this.showPrintConfirmBox();
          }
          this.selectedSalesId = 0;
          this.selectedSalesId = this.firstSales;
          //this.fetchPurchaseById();
          this.setInitialState();
          this.onClickNewSales();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  // createCallback(payload: any) {
  //   this.PurchaseService.saveDetails(EndpointConstant.SAVESALES + this.pageId + '&voucherId=' + this.voucherNo, payload)
  //     .pipe(takeUntil(this.destroySubscription))
  //     .subscribe({
  //       next: (response) => {
  //         this.isLoading = false;
  //         if (response.httpCode === 201) {
  //           //this.baseService.showCustomDialogue(response.data);
  //           this.baseService.showConfirmationDialog("do you want to print");
  //             // Automatically call print function with the ID from response
  //             const saleId = response.data; // Assuming response.data contains the ID
  //             if (saleId) {
  //               console.log("saleId",saleId)
  //               this.onClickPrint(saleId);
  //             } else {
  //               console.error("Sale ID is missing in the response.");
  //             }

  //         } else {
  //           this.baseService.showCustomDialogue(response.data);
  //         }

  //         this.selectedSalesId = this.firstSales;
  //         this.fetchAllSales();
  //         this.setInitialState();
  //         this.onClickNewSales();
  //       },
  //       error: (error) => {
  //         this.isLoading = false;
  //         console.error('Error saving branch', error);
  //       },
  //     });
  // }

  createCallback(payload: any) {
    this.PurchaseService.saveDetails(EndpointConstant.SAVESALES + this.pageId + '&voucherId=' + this.voucherNo, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          // console.log("check in save" + JSON.stringify(response, null, 2))
          if (response.httpCode === 200) {
            // Show the confirmation dialog asking "Do you want to print?"
            this.baseService.showCustomDialogues({
              key: 'confirm', // This ensures the confirmation dialog is displayed
              title: '',
              message: 'Do you want to print?',
              onAction: (action: string) => {
                if (action === 'OK') {
                  // Automatically call print function with the ID from response
                  const saleId = response.data.transactionId; // Assuming response.data contains the ID
                  if (saleId) {
                    // console.log("saleId", saleId);
                    this.onClickPrint(saleId);
                  } else {
                    console.error("Sale ID is missing in the response.");
                  }
                } else {
                  // console.log('User chose not to print');
                }
              }
            });
          } else {
            // Handle error or show failure message
            this.baseService.showCustomDialogues({
              key: 'custom',
              title: 'Error',
              message: response.data,
              onAction: () => { 0 }
            });
          }

          // Reset or call any follow-up actions (this is for navigating to new sales or state management)
          this.selectedSalesId = this.firstSales;
          this.fetchAllSales();
          this.setInitialState();
          this.onClickNewSales();
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
    this.unitsInGrid = [];
    this.itemUnitDetails = [];
    this.allItemHistoryDetails = [];
    this.selectedBranchId = 0;
    this.filledBranchId = 0;
    this.selectedBranches = [];
    if (this.isInputDisabled == false) {
      this.enableFormControls();
    } else {
      this.disbaleFormControls();
    }
    this.fetchPurchaseById();
    return true;
  }


  onClickPrint(selectedSalesId: number): void {
    this.pdfgenerationService.generatePdf(selectedSalesId, this.pageId, 'print', this.isMobile, this.isTab,this.address);
  }




  onClickPreview(selectedSalesId: number): void {
    this.pdfgenerationService.generatePdf(selectedSalesId, this.pageId, 'preview', this.isMobile, this.isTab,this.address);
  }


  onClickDeleteSales(event: Event) {
    event.preventDefault();
    if (!this.isDelete) {
      this.baseService.showCustomDialogue('Permission Denied!');
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
    console.log("delete api:"+EndpointConstant.DELETESALES + this.selectedSalesId + '&pageId=' + this.pageId)
    this.PurchaseService.deleteDetails(EndpointConstant.DELETESALES + this.selectedSalesId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.showDeletePopup = false;
          if (response.httpCode == 200) {
            this.baseService.showCustomDialogue(response.data);
          } else {
            this.baseService.showCustomDialogue(response.data);
          }
          this.selectedSalesId = 0;
          this.showDeletePopup = false;
          this.fetchAllSales();
          this.setInitialState();
          this.onClickNewSales();
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  closeDeletePopup() {
    this.showDeletePopup = false;
  }

  onClickCancelSales(event: Event) {
    event.preventDefault();
    if (!this.isCancel) {
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.showCancelPopup = true;
    this.toggleDeleteOptions();
    return true;
  }

  confirmCancel() {
    this.PurchaseService.updateDetails(EndpointConstant.CANCELSALES + this.selectedSalesId + '&pageId=' + this.pageId + '&reason=' + this.cancelReason, {})
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          if (response.httpCode == 200) {
            this.baseService.showCustomDialogue(response.data);
          }
          this.cancelReason = "";
          this.selectedSalesId = 0;
          this.showCancelPopup = false;
          this.fetchAllSales();
          this.setInitialState();
          this.onClickNewSales();
        },
        error: (error) => {
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  closeCancelPopup() {
    this.showCancelPopup = false;
  }

  onClickSales(event: any): void {
    if (event.type === 'click') {
      this.selectedSalesId = event.row.ID;
      this.emptyAllSummaryTotalsAndObjects();
      this.fetchPurchaseById();
    }
  }

  toggleUnitsDetails() {
    this.isUnitsOpen = !this.isUnitsOpen;
  }

  toggleOtherDetails() {
    this.isOtherDetailsOpen = !this.isOtherDetailsOpen;
  }

  onActiveChange(event: any) {
    this.active = event.target.checked ? true : false;
  }


  //customerInfo: CustomerInfo | null = null; // Allow null initially

  customerInfo: any = {};

fetchCustomerInfo() {
  this.PurchaseService.getDetails(EndpointConstant.FETCHCUSTOMERBYACCOUNTID + this.selectedPartyId)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        if (response && response.data) {
          this.customerInfo = response.data ; // Ensure data mapping
         // console.log("CustomerInfo:", JSON.stringify(this.customerInfo, null, 2));
        } 
      },
      error: (err) => {
        console.error("Error fetching customer info:", err);
      },
    });
}
fetchPurchaseById(): void {
  this.isLoading = true;

  this.PurchaseService.getDetails(
    `${EndpointConstant.FILLPURCHASEBYID}${this.selectedSalesId}&pageId=${this.pageId}`
  )
  .pipe(
    takeUntil(this.destroySubscription),
    finalize(() => this.isLoading = false)
  )
  .subscribe({
    next: (response) => {
      this.currentSales = response?.data;
      this.FillPurchaseDetails();

      // push into grid rows and force table refresh
      this.tempItemFillDetails = [...(this.invTransactions || [])];
      setTimeout(() => this.ngxTable.recalculate(), 0);
    },
    error: (error) => {
      console.error('An Error Occurred', error);
    }
  });

  this.fetchCustomerInfo();
}

/**
 * Populate all details into form controls and component state
 */
FillPurchaseDetails(): void {
  const t = this.currentSales.transaction;
  const details = t.fillTransactions;
  const add = t.fillAdditionals;

  // Patch form with core transaction details
  this.salesForm.patchValue({
    vouchername: this.vocherName,
    voucherno: details.transactionNo,
    purchasedate: details.date ? new Date(details.date) : null,
    reference: details.referenceNo,
    customer: details.accountName,
    warehouse: add.outLocID,
    vatno: add.vatNo,
    partyinvoiceno: add.entryNo,
    partyinvoicedate: add.entryDate,
    description: details.commonNarration,
    terms: add.terms,
    paytype: add.modeID,
    duedate: add.dueDate ? new Date(add.dueDate) : null
  });

  // Currency settings
  this.currentcurrencyObj = { id: details.currencyID, value: details.currency };
  this.selectedCurrencyId = details.currencyID;
  const currencyObj = this.currencyDropdown.find((c: { currencyID: number; }) => c.currencyID === this.selectedCurrencyId);
  this.currentCurrencyRate = currencyObj?.currencyRate;
  this.formVoucherNo = details.transactionNo;
  this.isSalesCancelled = details.cancelled;

  // Populate grid data
  this.invTransactions = t.fillInvTransItems;

  // Populate remaining UI state
  this.onCustomerSelected(details.accountID, false);
  if (add.accountName) this.onSalesmanSelected(add.accountName, false);
  if (details.projectName) this.onProjectSelected(details.projectName, false);
  this.setAdditionalDetailsFromFill(add);
  this.setTransactionEntries(t.fillTransactionEntries);
  this.setPaymentInformation(this.currentSales.payment.data);
  this.setChequeInformation(this.currentSales.cheque.data);
  this.setVoucherAllocationUsingReference();
  this.onChangePayType();
  this.calculateTotals();
}

  setAdditionalDetailsFromFill(transactionAddditional: any) {
    let vehiclename = "";
    this.vehicleNoData.forEach((vehicle: any) => {
      if (vehicle.id == transactionAddditional.vehicleID) {
        vehiclename = vehicle.vehicleNo;
      }
    });

    this.additionalDetailsForm.patchValue({
      invoiceno: transactionAddditional.entryNo,
      invoicedate: transactionAddditional.entryDate ? new Date(transactionAddditional.entryDate) : null,
      orderno: transactionAddditional.referenceNo,
      orderdate: transactionAddditional.referenceDate ? new Date(transactionAddditional.referenceDate) : null,
      partyaddress: transactionAddditional.name,
      expirydate: transactionAddditional.expiryDate ? new Date(transactionAddditional.expiryDate) : null,
      transportationtype: transactionAddditional.lcApplnTransID,
      creditperiod: transactionAddditional.period,
      vehicleno: vehiclename,
      attention: transactionAddditional.bankAddress,
      deliverynote: transactionAddditional.passNo,
      deliverydate: transactionAddditional.submitDate,
      dispatchno: transactionAddditional.documentNo,
      dispatchdate: transactionAddditional.documentDate,
      partyname: transactionAddditional.partyName,
      addressline1: transactionAddditional.address1,
      addressline2: transactionAddditional.address2,
      deliverylocation: transactionAddditional.recommendNote,
      terms: transactionAddditional.address,
      salesarea: transactionAddditional.areaID,
      staffincentive: transactionAddditional.interestAmt,
      mobilenumber: transactionAddditional.lcNo
    });
    this.updatedDeliveryLocation = transactionAddditional?.recommendNote;
    this.updatedVehicleNo = transactionAddditional?.vehicleNo;
  }

  setGridDetailsFromFill(invTransactions: any) {
    if (invTransactions.length > 0) {
      this.itemDetails = [];
      invTransactions.forEach((trn: any) => {
        let unitInfoOptions: any = [];
        let priceCategoryOptions: any = [];
        let selectedxpireItemObj: any = {};
        this.fillItemsData.forEach((itemInfo: any) => {
          if (itemInfo.item.itemCode === trn.itemCode) {
            //setting unit popup details...
            itemInfo.unitPopup.forEach((unitInfo: any) => {
              let unitObj = {
                "unit": unitInfo.unit,
                "basicunit": unitInfo.basicUnit,
                "factor": unitInfo.factor
              }
              unitInfoOptions.push(unitObj);
            });

            //setting price category details...
            itemInfo.priceCategory.forEach((pricecategory: any) => {
              priceCategoryOptions.push({
                "id": pricecategory.id,
                "pricecategory": pricecategory.priceCategory,
                "perc": pricecategory.perc,
                "rate": pricecategory.rate
              });
            });

          }
        });
        let itemunitObj = unitInfoOptions.find((unit: any) => unit.unit === trn.unit);
        let itemPricecategoryObj = priceCategoryOptions.find((pricecategory: any) => pricecategory.id === trn.priceCategoryId);

        let gridItem = { ...this.itemDetailsObj };
        gridItem.transactionId = trn.transactionId;
        gridItem.itemId = trn.itemId;
        gridItem.itemCode = trn.itemCode;
        gridItem.itemName = trn.itemName;
        gridItem.batchNo = trn.batchNo,
          gridItem.unit = itemunitObj;
        gridItem.unitsPopup = unitInfoOptions;
        gridItem.qty = Number(trn.qty);
        gridItem.focQty = Number(trn.focQty);
        gridItem.rate = this.baseService.formatInput(Number(trn.rate));
        gridItem.printedMRP = this.baseService.formatInput(Number(trn.printedMrp));
        gridItem.grossAmt = trn.grossAmount;
        gridItem.discountPerc = Number(trn.discountPerc);
        gridItem.discount = this.baseService.formatInput(Number(trn.discount));
        gridItem.amount = this.baseService.formatInput(Number(trn.amount));
        gridItem.taxPerc = trn.taxPerc;
        gridItem.taxValue = this.baseService.formatInput(Number(trn.taxValue));
        gridItem.total = trn.totalAmount;
        gridItem.expiryDate = trn.expiryDate ? trn.expiryDate : null;
        gridItem.stockItemId = trn.stockItemId;
        gridItem.stockItem = trn.stockItem;
        gridItem.taxAccountId = trn.taxAccountId;
        gridItem.priceCategoryOptions = priceCategoryOptions;
        gridItem.priceCategory = {
          "id": itemPricecategoryObj?.id,
          "code": itemPricecategoryObj?.perc.toString(),
          "name": itemPricecategoryObj?.pricecategory,
          "description": itemPricecategoryObj?.rate
        };
        this.itemDetails.push(gridItem);
        //set size master...
        this.onSizemasterSelected(trn.sizeMasterName, this.itemDetails.length - 1, false);

      });
      this.itemDetails.push(this.itemDetailsObj);
      this.noGridItem = false;
      this.currentItemTableIndex = this.itemDetails.length - 1;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
      this.calculateTotals();
    }
  }

  setTransactionEntries(transactionEntries: any) {
    this.additonalChargesGridDetails = [];
    let totalAddCharges = 0.00;
    this.taxPopupObj = [];
    transactionEntries.forEach((item: any) => {

      if (item.tranType == 'Expense') {
        totalAddCharges = totalAddCharges + item.amount;
        let accountData = {
          "accountCode": {
            "alias": item.alias.toString(),
            "name": item.name,
            "id": item.accountId
          },
          "description": item.description,
          "amount": item.amount,
          "payableAccount": {}
        }
        this.additonalChargesGridDetails.push(accountData);
      } else if (item.tranType == 'Tax') {
        this.taxPopupObj.push({
          taxid: item.accountId,
          accountCode: {
            alias: item.alias.toString(),
            name: item.name,
            id: item.accountId
          },
          discription: item.description,
          amount: item.amount,
          payableAccount: {}
        });
      } else if (item.tranType == 'RoundOff') {
        let amount = this.baseService.formatInput(item.amount);
        this.salesForm.patchValue({
          "roundoff": amount
        })
        this.roundValue = amount;
      }
    });
    totalAddCharges = this.baseService.formatInput(totalAddCharges);
    this.salesForm.patchValue({
      "addcharges": totalAddCharges
    });
    this.totalAdditioanalCharges = totalAddCharges;
  }

  setExpiryDetailsFromFill(invTransactions: any) {
    this.expireItemDetails = [];
    if (invTransactions.length > 0) {
      invTransactions.forEach((trn: any) => {
        // Create a map for faster lookups if item codes are unique
        const itemInfoMap = new Map(this.fillItemsData.map((itemInfo: any) => [itemInfo.item.itemCode, itemInfo]));

        // Check if the item code exists in the map
        const itemInfo = itemInfoMap.get(trn.itemCode);

        if (itemInfo) {
          // Set unit popup details only once
          const unitInfoOptions = itemInfo.unitPopup.map((unitInfo: any) => ({
            unit: unitInfo.unit,
            basicunit: unitInfo.basicUnit,
            factor: unitInfo.factor
          }));

          // Check and process expiry items if they exist
          if (itemInfo.expiryItem.isExpiry) {
            const selectedxpireItemObj = {
              id: itemInfo.item.id,
              itemCode: itemInfo.item.itemCode,
              itemName: itemInfo.item.itemName,
              manufactureDate: trn.manufactureDate ? this.datePipe.transform(new Date(trn.manufactureDate), 'dd/MM/yyyy') : null,
              expiryDate: trn.expiryDate ? trn.expiryDate : null,
              expiryPeriod: itemInfo.expiryItem.expiryPeriod,
              gridIndex: this.itemDetails.length - 1
            };

            this.expireItemDetails.push(selectedxpireItemObj);
            this.copyExpireItemDetails = [...this.expireItemDetails];
          }
        }
      });
    }

  }

  calculateTotals() {
    this.calculateQantityTotal();
    this.calculateFOCQantityTotal();
    this.calculateGrossAmountTotal();
    this.calculateDiscountTotal();
    this.calculateAmountTotal();
    this.calculateTaxTotal();
    this.calculateGridItemTotal();
    this.calculateBalanceAndPaidAmount();
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
      this.salesForm.patchValue({
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
        this.bankPopupObj.map((item: any) => {
          if (item.id == chequeData.BankID) {
            bankinfo = {
              "alias": item.accountcode,
              "name": item.accountname,
              "id": item.id
            };
          }
        });
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
    this.salesForm.patchValue({
      "cheque": this.chequeAmount == 0 ? "" : this.baseService.formatInput(this.chequeAmount)
    });

  }

  setVoucherAllocationUsingReference() {
    if (this.referenceData) {
      this.salesForm.patchValue({
        "advance": this.baseService.formatInput(this.referenceData.amount)
      })
      this.advancePayableAmount = this.referenceData.amount;

    }
  }

  fetchSalesman(accountId: number | null) {
    this.PurchaseService
      .getDetails(EndpointConstant.FETCHSALESMAN+accountId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.salesmanData = response?.data;
          console.log("Salesman name:"+this.salesmanData[0].name)
          this.onSalesmanSelected(this.salesmanData[0].name)
          // this.salesForm.patchValue({
          //   "salesman":this.salesmanData[0].name
          // })
          //console.log("Salesman according to the user:"+JSON.stringify(this.salesmanData,null,2))
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchSalesmanOfCustomer(accountId:number)
  {
    
    this.PurchaseService
      .getDetails(EndpointConstant.FETCHSALESMANOFCUST+accountId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.salesmanData = response?.data;
          //console.log("Salesman according to the customer:"+JSON.stringify(this.salesmanData,null,2))
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  address:any;
  onCustomerSelected(option: any, userInput: any = true): any {
   // console.log("Hi")
    if (userInput == true && option != '') {
      this.isFormDirty = true;
      //console.log("isFormDirty:"+this.isFormDirty)
    }
    this.selectedPartyId = option;
    this.fetchPartyBalance();
    //this.fetchSalesmanOfCustomer(this.selectedPartyId)
    this.fetchSalesman(this.selectedPartyId);
   
    //console.log("USer salesman:"+JSON.stringify(this.salesmanData,null,2))
    this.customerData.forEach((item) => {
      if (item.id === option) {
        this.salesForm.patchValue({
          customer: item.accountName,
          vatno: item.vatNo
        });
        this.address=item.address;
        console.log("customer address:"+this.address)
        this.updatedCustomer = item.accountName;
        this.selectedCustomerObj = {
          "id": item.id,
          "name": item.accountName,
          "code": item.accountCode,
          "description": ""
        };
        this.fetchDeliveryLocation();
        this.checkItemCodeCanAdd();
        this.checkAdvanceAmount();
        this.isPartySelected = true;
        if (this.selectedPartyId == this.defaultCustomer) {
          this.moveFocusToItemGrid();
        }
        //check default customer is cash customer then set pay type as Cash
        if (this.selectedSalesId == 0) {
          this.setPayTypeBasedOnCustomer();
        }
      }
    });
  }

  setPayTypeBasedOnCustomer() {
    // if(this.selectedPartyId == this.defaultCustomer){
    if (this.updatedCustomer == 'Cash Customer') {
      // / Find the object where name is 'Cash'
      const foundPayType = this.payTypeObj.find(item => item.name === 'Cash');

      // Get the id if the object is found
      const cashTypeId = foundPayType ? foundPayType.id : null;
      this.salesForm.patchValue({
        "paytype": cashTypeId
      });
      this.onChangePayType();
    } else {
      this.salesForm.patchValue({
        "paytype": this.prevPayType
      })
      this.onChangePayType();
    }

  }

  moveFocusToItemGrid() {
    this.currentColIndex = 1;
    this.currentRowIndex = 0;
    this.scrollToCell(this.currentRowIndex, this.currentColIndex);
    this.enableInlineEditing = false;
    this.focusGridCell(this.currentRowIndex, this.currentColIndex);
  }

  onProjectSelected(option: string, userInput: any = true): any {
    this.updatedProject = option;
    this.salesForm.patchValue({
      project: option,
    });
    this.moveFocusToDropdown('customer');
    if (userInput) {
      this.isFormDirty = true;
    }
  }

  onSalesmanSelected(option: string, userInput: any = true): any {
    this.updatedSalesman = option;
    this.salesForm.patchValue({
      salesman: option,
    });
    if (userInput) {
      this.isFormDirty = true;
    }
  }

  checkItemCodeCanAdd() {
    const warehouseId = this.salesForm.get('warehouse')?.value;
    const customerId = this.salesForm.get('customer')?.value;
    if (warehouseId && customerId) {
      console.log("checkItemcode")
      this.fetchItemFillData();
    }
  }

  // onItemCodeSelected(option: any, rowIndex: number, userInput: any = true): any {
  //   if (option != "") {
  //     if (userInput == true) {
  //       this.isFormDirty = true;
  //     }
  //     let selectedItemObj: any = {};
  //     let selectedxpireItemObj: any = {};
  //     this.fillItemsData.forEach((itemInfo: any) => {
  //       if (itemInfo.itemCode === option) {
  //         //setting item unit options....
  //          let unitInfoOptions: any = [];
  //         // itemInfo.unitPopup.forEach((unitInfo: any) => {
  //         //   let unitObj = {
  //         //     "unit": unitInfo.unit,
  //         //     "basicunit": unitInfo.basicUnit,
  //         //     "factor": unitInfo.factor
  //         //   }
  //         //   unitInfoOptions.push(unitObj);
  //         // });
  //         let firstUnit = itemInfo.unitPopup[0];

  //         //setting item price category...
  //         let priceCategoryOptions: any = [];
  //         itemInfo.priceCategory.forEach((pricecategory: any) => {
  //           priceCategoryOptions.push({
  //             "id": pricecategory.id,
  //             "pricecategory": pricecategory.priceCategory,
  //             "perc": pricecategory.perc,
  //             "rate": pricecategory.rate
  //           });
  //         });
  //         selectedItemObj = { ...this.itemDetailsObj };
  //         selectedItemObj.itemId = itemInfo.id;
  //         selectedItemObj.itemCode = itemInfo.itemCode;
  //         selectedItemObj.itemName = itemInfo.itemName;
  //         // selectedItemObj.batchNo = this.itemDetails[rowIndex]['batchNo'] ? this.itemDetails[rowIndex]['batchNo'] : (this.itemTransactionData.batchNo ?? 0);
  //         // selectedItemObj.batchNo = this.itemDetails[rowIndex]['batchNo'] 
  //         // ? this.itemDetails[rowIndex]['batchNo'] 
  //         // : (this.itemTransactionData.batchNo ?? 0);
  //         selectedItemObj.batchNo = "";
  //         this.fetchBatchNoPopup(itemInfo.item.id).subscribe((batchNoOptions: any) => {
  //           selectedItemObj.batchNoPopup = batchNoOptions;
  //           selectedItemObj.batchNo = selectedItemObj.batchNoPopup[0]?.batchNo;
  //         });
  //         selectedItemObj.unit = firstUnit;
  //         selectedItemObj.unitsPopup = unitInfoOptions;
  //         selectedItemObj.qty = this.defaultQtySetting;
  //         selectedItemObj.focQty = 0.0000;
  //         selectedItemObj.rate = itemInfo.rate;
  //         if (this.showRateWithTax == 1 && firstUnit.mrp) {
  //           selectedItemObj.printedMRP = firstUnit.mrp;
  //         }
  //         selectedItemObj.grossAmt = 0.0000;
  //         selectedItemObj.discountPerc = 0.0000;
  //         selectedItemObj.discount = 0.0000;
  //         selectedItemObj.amount = 0.0000;
  //         selectedItemObj.taxPerc = itemInfo.taxPerc ? itemInfo.taxPerc : 0.0000,
  //           selectedItemObj.taxValue = 0.0000;
  //         selectedItemObj.total = 0.0000;
  //         selectedItemObj.expiryDate = null;
  //         selectedItemObj.stockItem = '';
  //         selectedItemObj.stockItemId = 0;//itemInfo.item.stock;
  //         selectedItemObj.taxAccountId = itemInfo.item.taxAccountID;
  //         selectedItemObj.priceCategoryOptions = priceCategoryOptions;
  //         selectedItemObj.remarks = itemInfo.item.remarks;

  //         if (itemInfo.expiryItem.isExpiry) {
  //           selectedxpireItemObj = {
  //             id: itemInfo.item.id,
  //             itemCode: itemInfo.item.itemCode,
  //             itemName: itemInfo.item.itemName,
  //             manufactureDate: null,
  //             expiryDate: itemInfo.item.expiryDate,
  //             expiryPeriod: itemInfo.expiryItem.expiryPeriod,
  //             gridIndex: rowIndex
  //           }
  //         }
  //       }
  //     });
  //     this.itemDetails[rowIndex] = selectedItemObj;
  //     this.itemDetails = [...this.itemDetails];
  //     this.tempItemFillDetails = [...this.itemDetails];

  //     //calculate itemgrid totals ..
  //     this.calculateItemAmount(rowIndex);
  //     if (Object.keys(selectedxpireItemObj).length != 0) {
  //       this.expireItemDetails.push(selectedxpireItemObj);
  //       this.copyExpireItemDetails = [...this.expireItemDetails];
  //     }

  //     //adding new rowon item grid when item selected...
  //     this.addRow(true);

  //     if (selectedItemObj.rate == 0 || selectedItemObj.rate == null) {
  //       this.dialog.open(CustomDialogueComponent, {
  //         width: '300px',
  //         height: '200px',
  //         data: {
  //           message: "Rate is zero",
  //           key: "custom"
  //         }
  //       });
  //     }

  //     //find batch no column and its' index...
  //     const batchNoIndex = this.tablecolumns.findIndex(column => column.name === 'BatchNo');
  //     this.currentColIndex = batchNoIndex - 1;
  //     this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
  //     this.setMaxHeight();
  //   } else {
  //     this.tempItemFillDetails[this.currentRowIndex]['itemCode'] = "";
  //   }

  // }

  fetchUnitPopup(itemId: number): Observable<any> {
    return this.PurchaseService.getDetails(`${EndpointConstant.unitpop}?itemId=${itemId}`);
  }

  onItemCodeSelected(option: any, rowIndex: number, userInput: any = true): any {
    if (option != "") {
      if (userInput === true) {
        this.isFormDirty = true;
      }
  
      let selectedItemObj: any = {};
      let selectedxpireItemObj: any = {};
  
      this.fillItemsData.forEach((itemInfo: any) => {
        if (itemInfo.itemCode === option) {
          // Setting item unit options (placeholder if needed in future)
          let unitInfoOptions: any = [];
  
          this.fetchUnitPopup(itemInfo.id)
          // Use fallback if unitPopup not present
          let firstUnit = itemInfo.unitPopup?.[0] || {
            unit: itemInfo.unit,
            factor: itemInfo.factor,
            basicunit: itemInfo.unit
          };
  
          // Setting price category options (guarded for undefined)
          let priceCategoryOptions: any = [];
          if (itemInfo.priceCategory) {
            itemInfo.priceCategory.forEach((pricecategory: any) => {
              priceCategoryOptions.push({
                id: pricecategory.id,
                pricecategory: pricecategory.priceCategory,
                perc: pricecategory.perc,
                rate: pricecategory.rate
              });
            });
          }
  
          selectedItemObj = { ...this.itemDetailsObj };
  
          selectedItemObj.itemId = itemInfo.id;
          selectedItemObj.itemCode = itemInfo.itemCode;
          selectedItemObj.itemName = itemInfo.itemName;
          selectedItemObj.batchNo = this.itemDetails[rowIndex]?.batchNo
  ? this.itemDetails[rowIndex].batchNo
  : (this.itemTransactionData?.batchNo ?? 0);

// Fetch the batchNo options for the item
this.fetchBatchNoPopup(itemInfo.id).subscribe((batchNoOptions: any) => {
  selectedItemObj.batchNoPopup = batchNoOptions;
  // Set batchNo to first option only if it wasn't already set
  if (!selectedItemObj.batchNo && selectedItemObj.batchNoPopup?.length) {
    selectedItemObj.batchNo = selectedItemObj.batchNoPopup[0]?.batchNo;
  }
});

          selectedItemObj.unit = firstUnit;
          selectedItemObj.unitsPopup = unitInfoOptions;
          selectedItemObj.qty = this.defaultQtySetting;
          selectedItemObj.focQty = 0.0000;
          selectedItemObj.rate = itemInfo.rate;
          if (this.showRateWithTax == 1 && firstUnit.mrp) {
            selectedItemObj.printedMRP = firstUnit.mrp;
          }
          selectedItemObj.grossAmt = 0.0000;
          selectedItemObj.discountPerc = 0.0000;
          selectedItemObj.discount = 0.0000;
          selectedItemObj.amount = 0.0000;
          selectedItemObj.taxPerc = itemInfo.taxPerc ?? 0.0000;
          selectedItemObj.taxValue = 0.0000;
          selectedItemObj.total = 0.0000;
          selectedItemObj.expiryDate = itemInfo.expiryDate ?? null;
          selectedItemObj.stockItem = '';
          selectedItemObj.stockItemId = 0;
          selectedItemObj.taxAccountId = itemInfo.taxAccountID ?? 0;
          selectedItemObj.priceCategoryOptions = priceCategoryOptions;
          selectedItemObj.remarks = itemInfo.remarks ?? '';
  
          if (itemInfo.expiryItem?.isExpiry) {
            selectedxpireItemObj = {
              id: itemInfo.id,
              itemCode: itemInfo.itemCode,
              itemName: itemInfo.itemName,
              manufactureDate: null,
              expiryDate: itemInfo.expiryDate,
              expiryPeriod: itemInfo.expiryItem.expiryPeriod,
              gridIndex: rowIndex
            };
          }
        }
      });
  
      this.itemDetails[rowIndex] = selectedItemObj;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
  
      this.calculateItemAmount(rowIndex);
  
      if (Object.keys(selectedxpireItemObj).length !== 0) {
        this.expireItemDetails.push(selectedxpireItemObj);
        this.copyExpireItemDetails = [...this.expireItemDetails];
      }
  
      this.addRow(true);
  
      if (selectedItemObj.rate === 0 || selectedItemObj.rate == null) {
        this.dialog.open(CustomDialogueComponent, {
          width: '300px',
          height: '200px',
          data: {
            message: "Rate is zero",
            key: "custom"
          }
        });
      }
  
      const batchNoIndex = this.tablecolumns.findIndex(column => column.name === 'BatchNo');
      this.currentColIndex = batchNoIndex - 1;
      this.gridnavigationService.focusCell(this.gridCells.toArray(), this.currentRowIndex, this.currentColIndex);
      this.setMaxHeight();
  
    } else {
      this.tempItemFillDetails[this.currentRowIndex]['itemCode'] = "";
    }
  }
  

  fetchBatchNoPopup(itemId: any): Observable<any> {
    let warehouseId = this.salesForm.get('warehouse')?.value;
    return this.PurchaseService
      .getDetails(EndpointConstant.FETCHBATCHNOFORSALES + warehouseId + '&ItemID=' + itemId)
      .pipe(
        takeUntil(this.destroySubscription),
        map(response => response.data) // Extract the data here
      );
  }


  onStockItemSelected(option: any, rowIndex: number, userInput: any = true): any {
    if (option != "") {
      if (userInput == true) {
        this.isFormDirty = true;
      }
      this.itemDetails[rowIndex]['stockItem'] = option;
      let stockitem = this.stockItemObj.find((stock: any) => stock.itemname == option);
      this.itemDetails[rowIndex]['stockItemId'] = stockitem?.id;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
    }
  }

  onSizemasterSelected(option: any, rowIndex: number, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    let sizemaster = this.sizeMasterObj.find((sizemaster: any) => sizemaster.name == option);
    this.itemDetails[rowIndex]['sizeMaster'] = sizemaster;
  }

  onPriceCategorySelected(option: any, rowIndex: number, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    let itemPriceCategory = this.itemDetails[rowIndex]['priceCategoryOptions'];
    let priceCategoryObj = itemPriceCategory.find((pricecategory: any) => pricecategory.pricecategory === option)
    this.itemDetails[rowIndex]['priceCategory'] = {
      "id": priceCategoryObj?.id,
      "name": priceCategoryObj?.pricecategory,
      "code": priceCategoryObj?.perc.toString(),
      "description": priceCategoryObj?.rate
    };
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
  }

  onChangeBatchNo(rowIndex: any, event: any) {
    let batchno = event.target.value;
    this.itemDetails[rowIndex]['batchNo'] = batchno;
  }

  onChangeQuantity(rowIndex: any, event: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    // Assuming row contains the rate value
    const rate = this.itemDetails[rowIndex]['rate'];
    let qty = event.target.value;
    this.itemDetails[rowIndex]['qty'] = Number(qty);
    this.calculateItemAmount(rowIndex);
  }

  onChangeRateWithTax(rowIndex: any, event: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    let ratewithTax = event.target.value;
    let taxPerc = this.itemDetails[rowIndex]['taxPerc'];
    let calRate = this.baseService.formatInput(ratewithTax / ((taxPerc / 100) + 1));
    this.itemDetails[rowIndex]['rate'] = calRate;
    this.itemDetails[rowIndex]['printedMRP'] = ratewithTax;
    this.calculateItemAmount(rowIndex);
  }

  onMouseLeaveQty(rowIndex: any, event: any) {
    const rate = this.itemDetails[rowIndex]['rate'];
    if (rate == 0) {
      this.dialog.open(CustomDialogueComponent, {
        width: '300px',
        height: '200px',
        data: {
          message: "Rate is zero",
          key: "custom"
        }
      });
    }
  }

  onChangeFocQuantity(rowIndex: any, event: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    let focQty = event.target.value;
    this.itemDetails[rowIndex]['focQty'] = focQty;
    this.calculateItemAmount(rowIndex);
  }

  onChangeRate(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const qty = this.itemDetails[rowIndex]['Qty'];
    let rate = event.target.value;
    this.itemDetails[rowIndex]['rate'] = rate;
    this.calculateItemAmount(rowIndex);
  }

  onRateBlur(rowIndex: any, event: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    // Assuming row contains the rate value
    let rate = event.target.value;
    let itemRate = 0;
    this.fillItemsData.forEach((item: any) => {
      if (item.item.id == this.itemDetails[rowIndex]['itemId']) {
        itemRate = item.unitPopup[0].purchaseRate;
      }
    });
    // if (itemRate != 0 && rate != itemRate) {
    //   if (rate < itemRate) {
    //     if (confirm('Do you want to reduce price?')) {
    //       this.showPricePopup = true;

    //       //call api to get units details ...
    //       this.setUpdateUnitDetails(rowIndex);
    //     }
    //   } else {
    //     if (confirm('Do you want to update price?')) {
    //       this.showPricePopup = true;
    //       this.setUpdateUnitDetails(rowIndex);
    //     }
    //   }

    // }
  }

  setUpdateUnitDetails(rowIndex: any) {
    this.currentItemUnitDetails = [];
    let itemId = this.itemDetails[rowIndex]['itemId'];
    this.fillItemsData.forEach((item: any) => {
      if (item.item.id == this.itemDetails[rowIndex]['itemId']) {
        let rateDetails = item.updatePrice;
        rateDetails.forEach((rate: any) => {
          if (rate.itemID == itemId) {
            this.currentItemUnitDetails.push(rate);
          }
        });

        this.currentItemUnitDetails = [...this.currentItemUnitDetails];
        this.currentItemId = itemId;
      }
    });
  }

  onChangeGrossAmount(rowIndex: any, event: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    // Assuming row contains the rate value
    const qty = this.itemDetails[rowIndex]['qty'];
    let grossAmount = event.target.value;
    let rate = grossAmount / qty;
    this.itemDetails[rowIndex]['rate'] = rate;
    this.calculateItemAmount(rowIndex);
  }

  onChangeDiscountPercent(rowIndex: any, event: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    // Assuming row contains the rate value
    const grossAmount = this.itemDetails[rowIndex]['grossAmt'];
    let discountPercent = Number(event.target.value);
    discountPercent = this.baseService.formatInput(discountPercent);
    let discountValue = (grossAmount * discountPercent) / 100;
    this.itemDetails[rowIndex]['discountPerc'] = discountPercent;
    this.itemDetails[rowIndex]['discount'] = discountValue;
    this.calculateItemAmount(rowIndex);
  }

  onChangeDiscount(rowIndex: any, event: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    // Assuming row contains the rate value
    // const grossAmount = this.itemDetails[rowIndex]['GrossAmt'];
    let discountValue = Number(event.target.value);
    discountValue = this.baseService.formatInput(discountValue);
    // let discountPercent =(discountValue*100)/grossAmount;
    if (this.userTyping) {
      this.itemDetails[rowIndex]['discountPerc'] = "";
    }
    this.itemDetails[rowIndex]['discount'] = discountValue;
    this.calculateItemAmount(rowIndex);
    this.userTyping = false;
  }

  onInputDiscount(rowIndex: number, event: any) {
    this.userTyping = true; // Set the flag when user is typing
  }

  onChangeTaxPercent(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const amount = this.itemDetails[rowIndex]['amount'];
    let taxPercent = event.target.value;
    let taxValue = (amount * taxPercent) / 100;
    this.itemDetails[rowIndex]['taxPerc'] = taxPercent;
    this.itemDetails[rowIndex]['taxValue'] = taxValue;
    this.calculateTaxTotal();
    this.calculateItemAmount(rowIndex);
  }

  onChangeTaxValue(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    let taxValue = Number(event.target.value);
    taxValue = this.baseService.formatInput(taxValue);
    this.itemDetails[rowIndex]['taxValue'] = taxValue;
    this.calculateTaxTotal();
    this.setTaxPopupDetails();
  }

  calculateTaxTotal() {
    let total = 0.0000;
    this.itemDetails.forEach(function (item) {
      total = total + Number(item.taxValue);
    });
    this.taxTotal = this.baseService.formatInput(total);
  }

  setTaxPopupDetails() {

  }

  calculateQantityTotal() {
    let total = 0;
    this.itemDetails.forEach(function (item) {
      total = total + Number(item.qty);
    });
    this.qtyTotal = this.baseService.formatInput(total);
  }

  calculateFOCQantityTotal() {
    let total = 0.0000;
    this.itemDetails.forEach(function (item) {
      total = total + Number(item.focQty);
    });
    this.FOCQtyTotal = this.baseService.formatInput(total);
  }

  calculateGrossAmountTotal() {
    let total = 0.0000;
    this.itemDetails.forEach(function (item) {
      total = total + Number(item.grossAmt);
    });
    this.grossAmountTotal = this.baseService.formatInput(total);
  }

  calculateDiscountTotal() {
    let total = 0.0000;
    this.itemDetails.forEach(function (item) {
      total = total + Number(item.discount);
    });
    this.discountTotal = this.baseService.formatInput(total);
    this.commonDiscountAmount = total;
    this.salesForm.patchValue({
      "discountamount": total
    });
  }

  calculateAmountTotal() {
    let total = 0.0000;
    this.itemDetails.forEach(function (item) {
      total = total + Number(item.amount);
    });
    this.amountTotal = this.baseService.formatInput(total);
    this.salesForm.patchValue({
      "netamount": this.amountTotal
    });
  }

  calculateGridItemTotal() {
    let total = 0.0000;
    this.itemDetails.forEach(function (item) {
      total = total + Number(item.total);
    });
    this.gridItemTotal = this.baseService.formatInput(Number(total));
    this.calculateGrandTotal()
  }

  calculateGrandTotal(manualroundoff = false) {
    // Calculate the grand total before rounding
    let calculatedGrandTotal = Number(this.amountTotal) + Number(this.taxTotal) + Number(this.totalAdditioanalCharges);

    // Apply auto round-off if enabled and manual round-off is not requested
    // if (this.autoroundoffEnabled && !manualroundoff) {
    //   this.calculateAutoroundoff(calculatedGrandTotal);
    // }

    // Add round-off value to grand total
    let grandTotalValue = calculatedGrandTotal + Number(this.roundValue);
    // Format grand total for display
    this.grandTotal = this.baseService.formatInput(Number(grandTotalValue));

    // If advancePayableAmount is zero, set it to the formatted grand total
    // if (this.advancePayableAmount == 0) {
    this.advancePayableAmount = grandTotalValue; // Store the number
    // }

    // Calculate balance and paid amount
    this.calculateBalanceAndPaidAmount();

    // Update form control with formatted grand total for display
    this.salesForm.patchValue({
      "grandtotal": this.grandTotal
    });
  }


  // calculateAutoroundoff(oldgrandtotal: number) {
  //   this.roundValue = Number(Math.round(oldgrandtotal) - oldgrandtotal);
  //   this.roundValue = this.baseService.formatInput(this.roundValue);
  //   this.salesForm.patchValue({
  //     "roundoff": this.roundValue
  //   });
  // }

  calculateAutoroundoff(oldgrandtotal: number): number {
    let value = Number(Math.round(oldgrandtotal) - oldgrandtotal);
    value = this.baseService.formatInput(value); // Format if needed
    this.roundValue = value;
    this.salesForm.patchValue({
      roundoff: value
    });
    return value; // <-- return the calculated value
  }
  


  calculateBalanceAndPaidAmount() {
    this.totalAmountPaid = this.convertAmount(this.cardAmount) + this.convertAmount(this.cashAmount) + this.convertAmount(this.chequeAmount) + this.convertAmount(this.advanceAmount);
    this.balanceAmount = Math.abs(this.grandTotal - this.totalAmountPaid);
    this.totalAmountPaid = this.baseService.formatInput(this.totalAmountPaid);
    this.balanceAmount = this.baseService.formatInput(this.balanceAmount);
    this.salesForm.patchValue({
      "totalpaid": this.totalAmountPaid,
      "balance": this.balanceAmount
    });
  }

  calculateItemAmount(rowIndex: number) {

    let qty = this.itemDetails[rowIndex]['qty'];
    let rate = this.itemDetails[rowIndex]['rate'];
    let discPercent = this.itemDetails[rowIndex]['discountPerc'];
    let taxPercent = this.itemDetails[rowIndex]['taxPerc'];
    let oldTaxValue = this.itemDetails[rowIndex]['taxValue'];
    let discount = 0;
    // Calculate gross amount and Assign the calculated gross amount to the row object
    let grossAmount = this.baseService.formatInput(Number(qty * rate));
    if (discPercent) {
      discount = (grossAmount * discPercent) / 100;
    } else {
      discount = this.itemDetails[rowIndex]['discount'];
    }
    discount = this.baseService.formatInput(discount);
    let amount = grossAmount - discount;  // Do calculations using raw numbers
    let taxValue = (amount * taxPercent) / 100;  // Calculate tax

    // If you want to display these values formatted:
    let formattedAmount = this.baseService.formatInput(amount);
    let formattedTaxValue = this.baseService.formatInput(taxValue);
    let formattedTotal = this.baseService.formatInput(amount + taxValue);

    this.itemDetails[rowIndex]['grossAmt'] = grossAmount;
    this.itemDetails[rowIndex]['discount'] = discount;
    this.itemDetails[rowIndex]['amount'] = formattedAmount;
    this.itemDetails[rowIndex]['taxValue'] = formattedTaxValue;
    this.itemDetails[rowIndex]['total'] = formattedTotal;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    //change tax value obj ...
    if (taxValue && taxValue != oldTaxValue && this.itemDetails[rowIndex]['taxAccountId']) {
      //set tax popup details...
      this.FillTaxAccount(this.itemDetails[rowIndex]['taxAccountId'], oldTaxValue, rowIndex);
    }

    //calculate total of tax value..
    this.calculateTaxTotal();
    this.calculateQantityTotal();
    this.calculateFOCQantityTotal();
    this.calculateGrossAmountTotal();
    this.calculateDiscountTotal();
    this.calculateAmountTotal();
    this.calculateGridItemTotal();

  }

  onCategorySelected(option: string): any {
    this.salesForm.patchValue({
      category: option,
    });
    let selectedCategory: any = {};
    this.allCategories.forEach(function (item) {
      if ((item.code + ' - ' + item.description) === option) {
        selectedCategory.id = item.id;
        selectedCategory.code = item.code;
        selectedCategory.category = item.description;
        selectedCategory.categoryType = "";
      }
    });
    this.selectedCategoryObj = selectedCategory;
    this.selectedCategory = option;
  }

  onChangeTaxType(): void {
    const selectedTaxTypeId = this.salesForm.get('taxtype')?.value;
    const selectedTaxTypeName = this.allTaxTypes.find(taxtype => taxtype.id === selectedTaxTypeId)?.name;
    this.selectedTaxTypeObj = { id: selectedTaxTypeId, name: selectedTaxTypeName || '' };
  }

  onParentItemSelected(option: string): any {
    let selectedParentItem: any = {};
    this.salesForm.patchValue({
      parentitem: option,
    });
    this.allParentItems.forEach(function (item) {
      if (item.itemName === option) {
        selectedParentItem = item;
      }
    });
    this.selectedParentItemObj = selectedParentItem;
    this.selectedParentItemName = option;
  }
  onChangeQuality(): void {
    const selectedQualityId = this.salesForm.get('quality')?.value;
    const selectedQualityValue = this.allQualities.find(quality => quality.id == selectedQualityId)?.value;
    this.selectedItemQualityObj = { id: selectedQualityId, value: selectedQualityValue || '' };
  }

  onItemColorSelected(option: string): any {
    let selectedItemColor: any = {};
    this.allItemColors.forEach(function (item) {
      if (item.value === option) {
        selectedItemColor.id = item.id;
        selectedItemColor.code = item.code;
        selectedItemColor.name = item.value;
        selectedItemColor.description = "";
      }
    });
    this.selectedItemColorObj = selectedItemColor;
    this.selectedItemColorName = option;
  }

  onItemBrandSelected(option: string): any {
    let selectedItemBrand: any = {};
    this.allItemBrands.forEach(function (item) {
      if (item.value === option) {
        selectedItemBrand.id = item.id;
        selectedItemBrand.code = item.code;
        selectedItemBrand.name = item.value;
        selectedItemBrand.description = "";
      }
    });
    this.selectedItemBrandObj = selectedItemBrand;
    this.selectedItemBrandName = option;
  }

  onItemOriginSelected(option: string): any {
    let selectedCountryOfOrigin: any = {};
    this.allCountryOfOrigin.forEach(function (item) {
      if (item.value === option) {
        selectedCountryOfOrigin.id = item.id;
        selectedCountryOfOrigin.code = item.code;
        selectedCountryOfOrigin.name = item.value;
        selectedCountryOfOrigin.description = "";
      }
    });
    this.selectedCountryOfOriginObj = selectedCountryOfOrigin;
    this.selectedCountryOfOriginName = option;
  }

  onInvAccountSelected(option: string): any {
    let selectedInvAccountId = 0;
    this.allInvAccounts.forEach(function (item) {
      if (item.name === option) {
        selectedInvAccountId = item.id;
      }
    });
    this.selectedInvAccountId = selectedInvAccountId;
    this.selectedInvAccountName = option;
  }

  onCostAccountSelected(option: string): any {
    let selectedCostAccountId = 0;
    this.allCostAccounts.forEach(function (item) {
      if (item.name === option) {
        selectedCostAccountId = item.id;
      }
    });
    this.selectedCostAccountId = selectedCostAccountId;
    this.selectedCostAccountName = option;
  }

  onSalesAccountSelected(option: string): any {
    let selectedSalesAccountId = 0;
    this.allSalesAccounts.forEach(function (item) {
      if (item.name === option) {
        selectedSalesAccountId = item.id;
      }
    });
    this.selectedSalesAccountId = selectedSalesAccountId;
    this.selectedSalesAccountName = option;
  }

  onPurchaseAccountSelected(option: string): any {
    let selectedPurchaseAccountId = 0;
    this.allPurchaseAccounts.forEach(function (item) {
      if (item.name === option) {
        selectedPurchaseAccountId = item.id;
      }
    });
    this.selectedPurchaseAccountId = selectedPurchaseAccountId;
    this.selectedPurchaseAccountName = option;
  }

  onUnitFactorChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['factor'] = option.target.value;
    if (rowIndex != 0) {
      this.changeRatesInGrid(option.target.value, rowIndex);
    }
  }

  onPurchaseRateChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['purchaseRate'] = option.target.value;
  }

  onSellingPriceChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['sellingPrice'] = option.target.value;
  }

  onMrpChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['mrp'] = option.target.value;
  }


  onWholeSalePriceChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['wholeSalePrice'] = option.target.value;
  }

  onRetailPriceChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['retailPrice'] = option.target.value;
  }

  onDiscountPriceChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['wholeSalePrice2'] = option.target.value;
  }

  onOtherPriceChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['retailPrice2'] = option.target.value;
  }

  onLowestRateChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['lowestRate'] = option.target.value;
  }

  onBarcodeChange(option: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['barcode'] = option.target.value.toString();
  }

  onUnitActiveChange(event: any, rowIndex: any) {
    let unitactive = event.target.checked ? true : false;
    this.itemUnitDetails[rowIndex]['active'] = unitactive;
  }

  onStockItemChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.isStockItem = checkbox.checked;
    if (this.isStockItem == false) {
      this.salesForm.get('invaccount')?.enable();
      this.salesForm.get('salesaccount')?.enable();
      this.salesForm.get('costaccount')?.enable();
      this.salesForm.get('purchaseaccount')?.enable();
    } else {
      this.salesForm.get('invaccount')?.disable();
      this.salesForm.get('salesaccount')?.disable();
      this.salesForm.get('costaccount')?.disable();
      this.salesForm.get('purchaseaccount')?.disable();
    }
  }

  changeRatesInGrid(factor: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['purchaseRate'] = (this.itemUnitDetails[0]['purchaseRate']) * factor;
    this.itemUnitDetails[rowIndex]['sellingPrice'] = (this.itemUnitDetails[0]['sellingPrice']) * factor;
    this.itemUnitDetails[rowIndex]['mrp'] = (this.itemUnitDetails[0]['mrp']) * factor;
  }

  onImageSelected(event: any) {
    const file: File = event.target.files[0];

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      console.error('Only image files are allowed.');
      return;
    }

    // Check file size (e.g., 5 MB maximum)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSizeInBytes) {
      console.error('File size exceeds the maximum allowed size.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.imageData = reader.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imageData = null;
  }

  onChangePartyInvNo(event: any) {
    let partyinvNo = event.target.value;
    this.additionalDetailsForm.patchValue({
      "invoiceno": partyinvNo
    });
  }

  onChangePartyInvDate(event: any) {
    let partyinvDate = event.target.value;
    this.additionalDetailsForm.patchValue({
      "invoicedate": partyinvDate
    });
  }

  translateItemName() {
    let itemName = this.salesForm.get('itemname')?.value;


    // this.PurchaseService
    // .getTranslateDetails(EndpointConstant.TRANSLATETEXT+itemName)
    // .pipe(takeUntil(this.destroySubscription))
    // .subscribe({
    //   next: (response) => {
    //     console.log(response);        
    //   },
    //   error: (error) => {
    //     this.isLoading = false;
    //     console.error('An Error Occured', error);
    //   },
    // });
  }

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.itemDetails.filter(function (d: any) {
      const itemCodeMatch = d.itemCode.toString().toLowerCase().includes(val.toLowerCase());
      const itemnameMatch = d.itemName.toLowerCase().includes(val.toLowerCase());
      return itemCodeMatch || itemnameMatch || !val;
    });


    // update the rows
    this.tempItemFillDetails = temp;
    // Whenever the filter changes, always go back to the first page
    //this.table.offset = 0;
  }

  filterSales(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.tempSalesList.filter(function (d: any) {
      const trNoMatch = d.TransactionNo.toString().toLowerCase().includes(val.toLowerCase());
      return trNoMatch || !val;
    });

    // update the rows
    this.allSalesList = temp;
    // Whenever the filter changes, always go back to the first page
    //this.table.offset = 0;
  }

  openImportReferencePopup() {
    this.importedReferenceList = [];
    this.isReferenceImported = false;
    this.currentSalesInfo = [];
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showImportReferencePopup = true;
  }

  saveReferenceData(response: any) {
    //push reference list array...
    this.referenceListarray = response?.referenceList;
    if (Object.keys(response).length > 0) {
      if (response?.referenceVNoList.length > 0) {
        let refText = response?.referenceVNoList.join(', ');
        this.salesForm.patchValue({
          "reference": refText
        });
      }

      //set item details to grid..
      //check item already exists..
      if (response?.itemListArray.length > 0) {
        if (this.itemDetails.length == 1 && this.itemDetails[0].itemCode == "") {
          this.itemDetails = [];
        }
        this.importedReferenceList = response?.itemListArray;
        // overwrite form details only if overwritevoucher info is true..
        if (response?.isOverwriteVoucher) {
          this.currentSalesInfo = this.importedReferenceList[this.importedReferenceList.length - 1];
          //setting form data is overwrite option is true..
          let transactionId = this.currentSalesInfo.TransactionID;
          this.fetchTransactionDetailsById(transactionId);
        } else {
          this.setItemDetailsFromImportReference();
        }
      }
    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showImportReferencePopup = false;
  }

  fetchTransactionDetailsById(transactionId: number) {
    this.PurchaseService
      .getDetails(EndpointConstant.FILLTRANSACTIONDETAILSBYID + transactionId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let result = response?.data;
          //set transaction details....
          let transactionDetails = result.transactionData[0];
          this.salesForm.patchValue({
            customer: transactionDetails.AccountCode,
            description: transactionDetails.commonNarration,
            project: transactionDetails.CostCentreID
          });
          this.updatedCustomer = transactionDetails.AccountName;
          this.selectedPartyId = transactionDetails.AccountCode;
          this.updatedProject = transactionDetails.ProjectName;
          this.onCustomerSelected(Number(transactionDetails.AccountID), false);
          //set transaction additional details....
          let transactionAddditional = result.additionalData?.[0];
          this.salesForm.patchValue({
            warehouse: transactionAddditional.inLocId,
            vatno: transactionAddditional.vatno,
            partyinvoiceno: transactionAddditional.entryNo,
            partyinvoicedate: transactionAddditional.entryDate,
            terms: transactionAddditional.terms,
            paytype: transactionAddditional.modeID,
            duedate: transactionAddditional.dueDate ? new Date(transactionAddditional.dueDate) : null
          });
          this.updatedSalesman = this.currentSalesInfo.StaffName;
          this.onChangeWarehouse();

          //set additional details in popup...
          transactionAddditional.lcApplnTransID = transactionAddditional.lcapplnTransId;
          this.setAdditionalDetailsFromFill(transactionAddditional);

          //set expenses...
          let transactionExpenses = result.expenses;
          if (transactionExpenses) {
            let totalAddCharges = 0.00;
            transactionExpenses.forEach((expense: any) => {
              totalAddCharges = totalAddCharges + Number(expense.Amount);
              this.additonalChargesGridDetails.push({
                "accountCode": {
                  "alias": expense.AccountCode,
                  "name": expense.AccountName,
                  "id": expense.AccountID
                },
                "description": expense.Description,
                "amount": expense.Amount,
                "payableAccount": {}
              });
            });
            this.totalAdditioanalCharges = Number(totalAddCharges);
            this.salesForm.patchValue({
              "addcharges": this.baseService.formatInput(this.totalAdditioanalCharges)
            });
          }

        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  closeImportReferencePopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showImportReferencePopup = false;
  }

  closePriceDetails() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showPricePopup = false;
  }

  openItemDetails(event: Event) {
    event.preventDefault();
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showItemDetails = true;
  }

  closeItemDetails(expireDetails: any) {
    if (expireDetails.length == 0) {
      this.expireItemDetails = this.copyExpireItemDetails;
    } else {
      this.expireItemDetails = expireDetails;
    }

    this.expireItemDetails = [...this.expireItemDetails];
    this.renderer.removeStyle(document.body, 'overflow');
    this.showItemDetails = false;
  }

  openAdditionalChargesPopup() {
    this.additonalChargesGridDetailsCopy = this.additonalChargesGridDetails;
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showAdditionalChargesPopup = true;
  }

  closeAdditionalChargesPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showAdditionalChargesPopup = false;
  }

  saveAdditionalCharges(response: any) {
    this.totalAdditioanalCharges = response?.totalamount;
    if (Object.keys(response).length > 0) {
      this.salesForm.patchValue({
        "addcharges": this.totalAdditioanalCharges
      });
      this.additonalChargesGridDetails = response?.gridDetails;

      this.calculateGrandTotal();
    }
    this.renderer.removeStyle(document.body, 'overflow');
    this.showAdditionalChargesPopup = false;
  }

  openTaxPopup() {
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showTaxPopup = true;
  }

  saveTaxDetailsPopup(response: any) {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showTaxPopup = false;
  }

  closeTaxPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showTaxPopup = false;
  }

  openItemAdditionalChargesPopup() {
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showItemAdditionalChargesPopup = true;
  }

  closeItemAdditionalChargesPopup(response: any) {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showItemAdditionalChargesPopup = false;
  }

  openCashPopup() {
    if (this.cashPopupGridDetails.length == 0 && this.balanceAmount > 0) {
      if (this.isDefaultCash) {
        this.setDefaultAmounttoCash();
      } else {
        if (confirm('Do you want to allocate the balance amount to default cash account')) {
          this.setDefaultAmounttoCash();
        }
      }
    }

    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showCashPopup = true;

  }

  setDefaultAmounttoCash() {
    this.cashPopupGridDetails.push({
      id: this.defaultCashAccount[0].id,
      accountCode: {
        alias: this.defaultCashAccount[0].accountCode,
        name: this.defaultCashAccount[0].accountName,
        id: this.defaultCashAccount[0].id
      },
      description: "",
      amount: this.balanceAmount,
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
      this.salesForm.patchValue({
        "cash": this.cashAmount
      });
      this.cashPopupGridDetails = response?.gridDetails;
      this.calculateBalanceAndPaidAmount();
    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showCashPopup = false;
  }

  openCardPopup() {
    if (this.cardPopupGridDetails.length == 0 && this.balanceAmount > 0) {
      if (confirm('Do you want to allocate the balance amount to default card account')) {
        this.setDefaultAmounttoCard();
      }
    }
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showCardPopup = true;
  }

  setDefaultAmounttoCard() {
    this.cardPopupGridDetails.push({
      id: this.defaultCardAccount[0].id,
      accountCode: {
        alias: this.defaultCardAccount[0].accountCode,
        name: this.defaultCardAccount[0].accountName,
        id: this.defaultCardAccount[0].id
      },
      description: "",
      amount: this.balanceAmount,
      payableAccount: {}
    });
  }


  closeCardPopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showCardPopup = false;
  }

  saveCardPopup(response: any) {
    this.cardAmount = response?.totalamount;
    if (Object.keys(response).length > 0) {
      this.salesForm.patchValue({
        "card": this.cardAmount
      });
      this.cardPopupGridDetails = response?.gridDetails;
      this.calculateBalanceAndPaidAmount();
    }

    this.renderer.removeStyle(document.body, 'overflow');
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
      this.salesForm.patchValue({
        "cheque": this.chequeAmount
      });
      this.chequePopupGridDetails = response?.gridDetails;
      this.calculateBalanceAndPaidAmount();
    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showChequePopup = false;
  }

  onChangeWarehouse() {
    const warehouseId = this.salesForm.get('warehouse')?.value;
    const customerId = this.salesForm.get('customer')?.value;
    if (warehouseId && customerId) {
      console.log("warehouse")
      this.fetchItemFillData();
    }
  }
  checkAdvanceAmount() {
    let voucherDate = this.salesForm.get('purchasedate')?.value;
    if (voucherDate == null) {
      this.baseService.showCustomDialogue('Invalid Date');
      return false;
    }
    voucherDate = this.datePipe.transform(voucherDate, 'MM-dd-YYYY');
    let partyId = this.selectedPartyId ? this.selectedPartyId : 0;
    this.PurchaseService
      .getDetails(EndpointConstant.FILLADVANCE + partyId + '&voucherId=' + this.voucherNo + '&date=' + voucherDate)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.advanceAmountObj = response?.data;
          //if reference data exists the modify advance amount obj ...
          if (this.referenceData && Object.keys(this.referenceData).length !== 0) {
            this.advanceAmountObj.forEach((element: any) => {
              if (element.vNo == this.referenceData.vNo) {
                element.selection = true;
                element.allocated = this.referenceData.allocated;
                element.amount = this.referenceData.amount;
              }
            });
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
    return true;
  }

  validateItemGridEntry() {
    const warehouseId = this.salesForm.get('warehouse')?.value;
    const customerId = this.salesForm.get('customer')?.value;
    if (!warehouseId) {
      this.baseService.showCustomDialogue('Please select location');
      return false;
    }

    if (!customerId) {
      this.baseService.showCustomDialogue('Please select Party');
      return false;
    }
    return true;
  }

  onClickAddItem() {
    if (this.validateItemGridEntry()) {
      this.addRow(true);
    }
  }
  addRow(itemcodesel = false, event?: KeyboardEvent) {
    const allItemCodesFilled = this.itemDetails.every(item => item.itemCode && item.itemCode.trim() !== '');

    if (!allItemCodesFilled) {
      if (event && event.key === 'Enter') {

        this.currentColIndex = -1;
        this.currentRowIndex = -1;
        this.focusOnTabIndex(13);
      }
      return false; // Exit the function if any itemCode is empty
    }
    this.itemDetails.push(this.itemDetailsObj);
    this.currentItemTableIndex = this.itemDetails.length - 1;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    if (!itemcodesel) {
      //set row and column index....
      this.currentRowIndex++;
      this.currentColIndex = 0;
      this.scrollToCell(this.currentRowIndex, this.currentColIndex);// Reset column index to 0 for the new row
    }
    // Increase table height dynamically, assuming rowHeight = 50px
    this.tableHeight = Math.max(200, this.itemDetails.length * 30 + 60); // Header and footer height = 100px

    return true;
  }

  navigateToItemPage(itemId: number) {
    const urlTree = this.router.createUrlTree(['/inventory/masters/itemmaster'], { queryParams: { pageId: this.itemmasterPageId, itemid: itemId } });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  changeGrossAmountEditable(event: any) {
    this.isgrossAmountEditable = event.target.checked ? true : false;
  }

  onChangeCommonDiscountPercent(event: any) {
    let commondiscountpercent = Number(event.target.value);
    this.commonDiscountPercent = this.baseService.formatInput(commondiscountpercent);
    this.setCommonDiscountPercent(this.commonDiscountPercent);

  }

  setCommonDiscountPercent(commondiscountpercent: any) {
    this.salesForm.patchValue({
      totaldiscpercent: commondiscountpercent
    });
    this.itemDetails.forEach((item, index) => {
      item.discountPerc = commondiscountpercent;
      this.calculateItemAmount(index);
    });
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
  }

  onChangeCommonDiscountAmount(event: any) {
    let commondiscountamount = event.target.value;
    this.setCommonDiscountAmount(commondiscountamount);
  }

  setCommonDiscountAmount(discountAmount: any) {
    this.salesForm.patchValue({
      discountamount: discountAmount
    });
    this.commonDiscountAmount = discountAmount;
    this.commonDiscountPercent = (discountAmount * 100) / this.grossAmountTotal;
    this.commonDiscountPercent = this.baseService.formatInput(this.commonDiscountPercent);
    this.setCommonDiscountPercent(this.commonDiscountPercent);
  }

  onClickAdvanceAmountOption(event: Event) {
    if (this.advanceAmountObj.length == 0) {
      this.baseService.showCustomDialogue('No pending Bills');
    } else {
      event.preventDefault();
      this.renderer.setStyle(document.body, 'overflow', 'hidden');
      this.showAdvanceDetails = true;
    }
  }

  closeAdvancePopup(response: any) {
    if (Object.keys(response).length > 0) {
      this.salesForm.patchValue({
        "advance": response.allocatedAmount
      });
      this.advanceAmount = response.allocatedAmount;
      this.calculateBalanceAndPaidAmount();
      this.selectedAdvanceData = response?.selectedAdvanceData;
      this.advanceAmountObj = response.advanceData;
    }
    this.renderer.removeStyle(document.body, 'overflow');
    this.showAdvanceDetails = false;
  }

  // onClickRoundOff() {
  //   if (this.autoroundoffEnabled && !this.salesForm.get('roundoff')?.touched) {
  //     this.calculateAutoroundoff(this.salesForm.get('grandtotal')?.value);
  //   } else {
  //     this.roundValue = Number(this.salesForm.get('roundoff')?.value);
  //     this.calculateGrandTotal(true);
  //   }
  // }

  // onClickRoundOff() {
  //   const roundoffControl = this.salesForm.get('roundoff');
  //   const grandTotal = this.salesForm.get('grandtotal')?.value;
   
  //   //this.calculateAutoroundoff(grandTotal);
  
  //   if (this.autoroundoffEnabled && !roundoffControl?.touched) {
  //     const autoRoundoff = this.calculateAutoroundoff(grandTotal);
  //     roundoffControl?.setValue(autoRoundoff);
  //     roundoffControl?.markAsTouched(); // Mark as touched to ensure next click uses manual path
  //     this.roundValue = Number( this.roundValue);
  //   } else {
  //     this.roundValue = Number(roundoffControl?.value);
  //   }
  
  //   this.calculateGrandTotal(true);
  // }

  onClickRoundOff() {
    const roundoffControl = this.salesForm.get('roundoff');
    const grandTotal = this.salesForm.get('grandtotal')?.value;
  
    if (this.autoroundoffEnabled && !roundoffControl?.touched) {
      const autoRoundoff = this.calculateAutoroundoff(grandTotal);
      roundoffControl?.markAsTouched();
      this.roundValue = autoRoundoff; // Now gets correct value
    } else {
      this.roundValue = Number(roundoffControl?.value);
    }
  
    this.calculateGrandTotal(true);
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

  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }

  onSelectLeftTable(event: any) {
  }


  onRowSelect(row: any) {
    this.selected = [row];
  }

  deleteItemGrid(index: any, showConfirm = true) {
    console.log("Hi delete")
    if (showConfirm) {
      if (confirm("Are you sure you want to delete this details?")) {
        this.removeGridItems(index);
      }
    } else {
      this.removeGridItems(index);
    }
  }

  removeGridItems(index: any) {
    if (this.itemDetails.length == 1) {
      this.noGridItem = true;
      this.itemDetails = [];
      this.itemDetails.push(this.itemDetailsObj);
    } else if (index == this.itemDetails.length - 1) {
      this.itemDetails.splice(index, 1);
      this.selected = [];
      this.itemDetails.push(this.itemDetailsObj);
    } else if (index !== -1) {
      this.itemDetails.splice(index, 1);
      this.selected = [];
    }
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    this.deleteExpiryItems(index);
    this.selectedRowIndex = -1
  }

  deleteExpiryItems(gridindex: any) {
    const index = this.expireItemDetails.findIndex((items: any) => items.gridIndex === gridindex);
    if (index !== -1) {
      this.expireItemDetails.splice(index, 1);
    }
  }

  onChangeItemExpiry(changedItem: any) {
    this.itemDetails[changedItem['gridIndex']]['expiryDate'] = changedItem['expiryDate'];
    this.itemDetails[changedItem['gridIndex']]['manufactureDate'] = changedItem['manufactureDate'];
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
  }

  onItemUnitSelected(option: any, rowIndex: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    let unitPopup = this.itemDetails[rowIndex]['unitsPopup'];
    let unitObj = unitPopup.find((unit: any) => unit.unit === option)
    this.itemDetails[rowIndex]['unit'] = unitObj;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
  }

  onItemBatchNoSelected(option: any, rowIndex: any, userInput: any = true): any {
    if (userInput == true) {
      this.isFormDirty = true;
    }
    this.itemDetails[rowIndex]['batchNo'] = option;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
  }

  //on clicking button navigate to supplier page by loading selected supplier. if no supplier selected created one . 
  onClickCustomer() {
    let url = "/general/customer-supplier";
    let customerSupplierId = 0;
    if (this.selectedPartyId) {
      this.customerData.forEach((element: any) => {
        if (element.id == this.selectedPartyId) {
          customerSupplierId = element.partyId;
        }
      });
    }
    const baseUrl = window.location.origin;
    const relativeUrl = this.router.serializeUrl(
      this.router.createUrlTree([url], { queryParams: { pageId: this.customerSupplierPageId, partyId: customerSupplierId } })
    );
    const fullUrl = `${baseUrl}${relativeUrl}`;

    window.open(fullUrl, '_blank');
  }

  onChangeCustomerInStorage(event: StorageEvent) {
    if (event.key === 'customerSaved') {
      // Refresh data
      this.fetchCustomer();
    }
  }
  selectRow(event: Event, rowIndex: number): void {

  }

  onColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.gridnavigationService.moveToNextRow(this.tempItemFillDetails, this.focusGridCell.bind(this));
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
        if (this.currentColumname == 'itemcode') {
          const matchExists = this.fillItemDataOptions.some(option => option['itemCode'] == this.tempItemFillDetails[this.currentRowIndex]['itemCode']);
          if (!matchExists) {
            this.baseService.showCustomDialogue("Invalid Entry");
            this.deleteItemGrid(this.currentRowIndex, false);
          }
        }
        event.preventDefault();
        this.gridnavigationService.handleNavigationKey(this.tablecolumns, this.tempItemFillDetails, this.focusGridCell.bind(this), this.addRow.bind(this));
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
    if (this.isMobile) {
      this.deleteItemGrid(rowIndex); // or handle differently if needed
    }
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
      if (this.currentRowIndex < this.tempItemFillDetails.length - 1) {
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
          if (this.currentRowIndex < this.tempItemFillDetails.length - 1) {
            this.currentRowIndex++;
            this.scrollToCell(this.currentRowIndex, this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }
          // this.gridnavigationService.moveToNextRow(this.tempItemFillDetails, this.focusGridCell.bind(this));
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
          if (this.tempItemFillDetails.length > 1) {
            let index = this.tempItemFillDetails.length - 2;
            this.deleteItemGrid(index);
          }
        }
        break;

      case 'Enter':
        event.preventDefault();

        this.enableInlineEditing = false;
        if (this.currentColumname == 'itemcode' && this.tempItemFillDetails[this.currentRowIndex]['itemCode'] == "") {
          const matchExists = this.fillItemDataOptions.some(option => option['itemCode'] == this.tempItemFillDetails[this.currentRowIndex]['itemCode']);
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
          if (this.currentRowIndex < this.tempItemFillDetails.length - 1) {
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
          if (this.currentColumname == 'itemcode' && this.tempItemFillDetails[this.currentRowIndex]['itemCode'] == "") {
            const matchExists = this.fillItemDataOptions.some(option => option['itemCode'] == this.tempItemFillDetails[this.currentRowIndex]['itemCode']);
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
            if (this.tempItemFillDetails[this.currentRowIndex]['qty'] == 0) {
              this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'qty');
              this.scrollToCell(this.currentRowIndex, this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
            } else if (this.tempItemFillDetails[this.currentRowIndex]['rate'] == 0) {
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
            if (this.tempItemFillDetails[this.currentRowIndex]['rate'] == 0) {
              //show rate this.baseService.showCustomDialogue...
              this.onMouseLeaveQty(this.currentRowIndex, Event);
              this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'rate');
              this.scrollToCell(this.currentRowIndex, this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
            }
          }

          if (this.currentRowIndex < this.tempItemFillDetails.length - 1) {
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
          //handle CTl+Alt+q key ..
          if (event.altKey && event.ctrlKey && event.key === 'q') {
            event.preventDefault();
          }
          // Handle other keys for inline editing
          const cellId = (event.target as HTMLElement).id;
          const cellElement = document.getElementById(cellId);
          if (cellElement) {
            const columnName = cellElement.getAttribute('data-column-name');
            const columnKeyName = cellElement.getAttribute('data-column-key-name');
            if (columnName != null) {
              this.currentColumname = columnName;
            }
            if (this.enableInlineEditing == false && this.isPartySelected && (columnName != 'id' && columnName != 'itemname' && columnName != 'amount' && columnName != 'taxperc' && columnName != 'taxvalue' && columnName != 'total'
              && ((columnName === 'grossamount' && this.isgrossAmountEditable) || (columnName !== 'grossamount')))) {
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
                  if (this.currentColumname == 'itemcode') {
                    this.prevColumnValue = this.itemDetails[this.currentRowIndex]['itemCode'];
                  }
                  if (this.currentColumname == 'stockitem') {
                    this.prevColumnValue = this.itemDetails[this.currentRowIndex]['stockItem'];
                  }
                  if (columnKeyName !== null && columnKeyName !== undefined) {
                    if (columnName == 'unit') {
                      this.prevColumnValue = this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['unit'];
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['unit'] = event.key;
                    } else if (columnName == 'pricecategory') {
                      this.prevColumnValue = this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'];
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    } else if (columnName == 'sizemasterid') {
                      if (this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name']) {
                        this.prevColumnValue = this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'];
                      }
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    } else {
                      let tempRow = { ...this.tempItemFillDetails[this.currentRowIndex] };
                      tempRow[columnKeyName] = event.key;
                      this.tempItemFillDetails[this.currentRowIndex] = tempRow;
                    }
                  }
                  this.tempItemFillDetails = [...this.tempItemFillDetails];
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
      if (this.selectedSalesId == 0 && !this.isInputDisabled) {
        if (this.balanceAmount > 0) {
          this.openDialog();
        } else {
          this.baseService.showCustomDialogue('Amount must be greater than zero');
        }
      } else if (this.selectedSalesId > 0 && !this.isInputDisabled) {
        this.activePrintOption = true;
        this.onClickSaveSales();
      }
    } else if (event.key == 'F1') {
      event.preventDefault();  // Prevent browser help page from opening
      this.toggleMaximize();
    } else if (event.key === 'F2') {
      event.preventDefault();
      if (!this.isEditBtnDisabled) {
        this.onClickEditSales();
      }
    } else if (event.key == 'F5') {
      event.preventDefault();
      if (this.currentRowIndex >= 0) {
        //show popup only when itemcode is not empty...
        if (this.itemDetails[this.currentRowIndex]['itemCode']) {
          this.itemSearchCode = this.itemDetails[this.currentRowIndex]['itemCode'];
          this.itemSearchName = this.itemDetails[this.currentRowIndex]['itemName'];
          this.setOptionsForItemSearchPopup();
          this.showItemSearchPopup = true;
        }
      }
    } else if (event.key === 'F6') {
      event.preventDefault();
      if ((this.isEditBtnDisabled && !this.isInputDisabled) || (!this.isEditBtnDisabled && this.isInputDisabled)) {
        this.onClickNewSales();
      }
    } else if (event.key === 'F7') {
      event.preventDefault();
      if (!this.isInputDisabled) {
        this.onClickSaveSales();
      }
    } else if (event.key === 'F8') {
      event.preventDefault();

    } else if (event.key === 'F9') {
      event.preventDefault();
      if (!this.isDeleteBtnDisabled) {
        this.onClickDeleteSales(event);
      }
    } else if (event.altKey && event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      if (this.currentRowIndex >= 0) {
        if (this.itemDetails[this.currentRowIndex]['itemCode']) {
          //show popup for price category....

          let id = this.itemDetails[this.currentRowIndex]['itemId'];
          let unit = this.itemDetails[this.currentRowIndex]['unit']['unit'];
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
        if (this.itemDetails[this.currentRowIndex]['itemCode']) {
          this.selectedItemRemarks = this.itemDetails[this.currentRowIndex]['remarks'];
          this.showRemarksPopup = true;
        }
      }
    } else if (event.altKey && event.ctrlKey && event.key === 'j') {
      event.preventDefault();
      if (this.currentRowIndex >= 0) {
        if (this.itemDetails[this.currentRowIndex]['itemCode']) {
          let itemCode = this.itemDetails[this.currentRowIndex]['itemCode'];
          this.itemRateItemName = this.itemDetails[this.currentRowIndex]['itemName']
          this.getItemRatePopupDetails(itemCode);
          this.showItemRatePopup = true;
        }
      }
    } else if (event.key === 'F10') {
      event.preventDefault();
      this.onClickPrint(this.selectedSalesId);
    } else if (event.key === 'F11') {
      event.preventDefault();
      this.onClickPreview(this.selectedSalesId);
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

  // Toggle maximize
  toggleMaximize() {
    this.isMaximized = !this.isMaximized;
    if (this.isMaximized) {
      this.showLeftSection = false;
    } else {
      this.showLeftSection = true;
    }
    // Trigger the recalculation on window resize
    setTimeout(() => this.ngxTable.recalculate(), 0);
    setTimeout(() => this.setSummaryCellWidths(), 0);

  }

  openDialog(): void {
    const dialogRef = this.dialog.open(BalancedialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result == 'Card') {
          this.setDefaultAmounttoCard();
          this.activePrintOption = true;
          this.onClickSaveSales();
        } else if (result == 'Cash') {
          this.setDefaultAmounttoCash();
          this.activePrintOption = true;
          this.onClickSaveSales();
        }
      }
    });
  }

  showPrintConfirmBox() {
    confirm('Do you want to print?');
  }


  openSelectedItemUnitPopup() {
    if (this.itemDetails[this.currentRowIndex] && this.itemDetails[this.currentRowIndex]['unitsPopup']) {
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
      this.salesForm.patchValue({
        paytype: cashType.id  // Set the value of paytype to the id of 'cash'
      });
    }
  }

  changePayTypeToCredit() {
    let creditType = this.payTypeObj.find((type: any) => type.name === 'Credit');

    if (creditType) {
      this.salesForm.patchValue({
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
      this.showItemDetailsTab = true;
      this.showAdditionalDetailsTab = false;
    } else if (tabId == 2) {
      this.showAdditionalDetailsTab = true;
      this.showItemDetailsTab = false;
    } else {

    }
  }

  onDeliveryLocationSelected(option: string) {
    this.updatedDeliveryLocation = option;
    this.additionalDetailsForm.patchValue({
      "deliverylocation": option
    });
  }

  onVehicleNoSelected(option: string) {
    this.updatedVehicleNo = option;
    this.additionalDetailsForm.patchValue({
      "vehicleno": option
    });
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
      // console.log('View initialized');
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

    // Start observing the target div
    observer.observe(this.targetDiv.nativeElement);

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

  toggleActive(): void {
    this.istoggleActive = !this.istoggleActive;
  }

  openBarcodePopup() {
    const dialogRef = this.dialog.open(CustomDialogueComponent, {
      width: '400px',
      height: '200px',
      data: {
        key: "barcode"
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // console.log(result);
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
    //check if item exists in tempItemFillDetails...
    if (foundItem != null) {
      const foundItemDet = this.tempItemFillDetails.find((item: any) => item.itemCode === foundItem?.itemCode);
      if (foundItemDet) {
        foundItemDet.qty = foundItemDet.qty == 0 ? + Number(foundItemDet.qty) + 2 : Number(foundItemDet.qty) + 1; // Ensures that qty is incremented, even if it's undefined
      } else {
        this.onItemCodeSelected(foundItem.itemCode, this.tempItemFillDetails.length - 1)
      }
    } else {
      this.dialog.open(CustomDialogueComponent, {
        width: '300px',
        height: '200px',
        data: {
          message: "Invalid item",
          key: "custom"
        },
        hasBackdrop: true,
        disableClose: false
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
    this.onItemCodeSelected(itemData.itemCode, this.currentRowIndex);
    this.closeItemSearchPopup();
  }

  onSelectPriceCategory(rateInfo: any) {
    //set rate of current selected item with item selected from popup
    let rate = rateInfo.price;
    if (rate == 0) {
      this.baseService.showCustomDialogue('Rate is zero');
    }
    this.itemDetails[this.currentRowIndex]['rate'] = rate;
    this.closePriceCategoryPopup();
  }

  setPriceCategoryPopupData(id: any, unit: any) {
    this.PurchaseService
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
      // console.log('Clicked outside the datatable');
      if (this.enableInlineEditing) {
        if (this.currentColumname == 'itemcode') {
          let currentItemcode = this.tempItemFillDetails[this.currentRowIndex]['itemCode'];
          let validateItemcode = this.validateItemCode(currentItemcode);
          if (!validateItemcode) {
            this.tempItemFillDetails[this.currentRowIndex]['itemCode'] = this.prevColumnValue;
            this.tempItemFillDetails = [...this.tempItemFillDetails];
          }
        } else if (this.currentColumname == 'stockitem') {
          // console.log(this.tempItemFillDetails[this.currentRowIndex]['stockItem']);
          let currentstockItem = this.tempItemFillDetails[this.currentRowIndex]['stockItem'];
          let validateStockItem = this.validateStockItem(currentstockItem);
          if (!validateStockItem) {
            this.tempItemFillDetails[this.currentRowIndex]['stockItem'] = this.prevColumnValue;
            this.tempItemFillDetails = [...this.tempItemFillDetails];
            // this.enableInlineEditing = false;
          }
        } else if (this.currentColumname == 'unit') {
          if (this.tempItemFillDetails[this.currentRowIndex]['unit']) {
            let currentunit = this.tempItemFillDetails[this.currentRowIndex]['unit']['unit'];
            let validatUnit = this.validateUnitField(currentunit);
            if (!validatUnit) {
              this.tempItemFillDetails[this.currentRowIndex]['unit']['unit'] = this.prevColumnValue;
              this.tempItemFillDetails = [...this.tempItemFillDetails];
            }
          }
          // this.enableInlineEditing = false;       
        } else if (this.currentColumname == 'pricecategory') {
          if (this.tempItemFillDetails[this.currentRowIndex]['priceCategory']) {
            let currentpricecategory = this.tempItemFillDetails[this.currentRowIndex]['priceCategory']['name'];
            let validatPrice = this.validatePriceCategoryField(currentpricecategory);
            if (!validatPrice) {
              this.tempItemFillDetails[this.currentRowIndex]['priceCategory']['name'] = this.prevColumnValue;
              this.tempItemFillDetails = [...this.tempItemFillDetails];
            }
          }
          // this.enableInlineEditing = false;       
        } else if (this.currentColumname == 'sizemasterid') {
          if (this.tempItemFillDetails[this.currentRowIndex]['sizeMaster']) {
            let currentsizemaster = this.tempItemFillDetails[this.currentRowIndex]['sizeMaster']['name'];
            let validateSizemaster = this.validateSizemaster(currentsizemaster);
            if (!validateSizemaster) {
              this.tempItemFillDetails[this.currentRowIndex]['sizeMaster']['name'] = this.prevColumnValue;
              this.tempItemFillDetails = [...this.tempItemFillDetails];
            }
          }
          // this.enableInlineEditing = false;       
        }

        this.enableInlineEditing = false;

      }

      // Perform your desired actions here
    }
  }

  validateItemCode(inpItemCode: any) {
    return this.fillItemDataOptions.some(option => option['itemCode'] == inpItemCode);
  }

  validateStockItem(inpStockItem: any) {
    return this.stockItemObj.some((option: any) => option['itemname'] == inpStockItem);
  }

  validateUnitField(inpUnit: any) {
    let unitPopup = this.itemDetails[this.currentRowIndex]['unitsPopup'];
    return unitPopup.some((option: any) => option['unit']['unit'] == inpUnit);
  }

  validatePriceCategoryField(inpPrice: any) {
    let itemPriceCategory = this.itemDetails[this.currentRowIndex]['priceCategoryOptions'];
    return itemPriceCategory.some((option: any) => option['pricecategory'] == inpPrice);
  }

  validateSizemaster(inpSizemaster: any) {
    return this.sizeMasterObj.some((option: any) => option['name'] == inpSizemaster);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.setMaxHeight();
    this.checkScreenSize();
    this.checkDeviceType();
    this.setSettingsBasedGridFields();
  }

  //for print 
  checkDeviceType(): void {
    this.isMobile = window.innerWidth <= 768; // Mobile if <= 768px
    this.isTab = window.innerWidth <= 992 && window.innerWidth > 768; // Tablet if between 768px and 992px
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
      this.tablecolumns = this.originalTableColumns.filter(
        (col) => !fieldsToRemove.includes(col.field)
      );
    } else if (this.isTab) {
      // Remove fields listed in `fieldsToRemove` for mobile
      this.tablecolumns = this.originalTableColumns.filter(
        (col) => !fieldsToRemoveForTab.includes(col.field)
      );
    } else {
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
    // //this.overlayElement.nativeElement.style.height = `${leftContentHeight}px`;
  }

  @HostListener('window:beforeunload', ['$event'])
  // handleBeforeUnload(event: Event): boolean {
  //   if (this.isFormDirty) {
  //     return window.confirm('You have unsaved changes! Are you sure you want to leave?');
  //   }
  //   return true;
  // }

  // canDeactivate(): boolean {
  //   if (this.isFormDirty) {
  //     return window.confirm('You have unsaved changes! Are you sure you want to leave?');
  //   }
  //   return true;
  // }

  //petty cash account

  pettyCashObj: any = [];
  defaultWhData: any = [];
  isPettyCashLoaded = false;
  // fetchUserPettyCash() {
  //   this.PurchaseService.getDetails(EndpointConstant.PETTYCASH)
  //     .pipe(takeUntil(this.destroySubscription))
  //     .subscribe({
  //       next: (response) => {
  //         const pettyCashData = response?.data.pettyCashAccounts;
  //         this.pettyCashObj = pettyCashData.map((item: any) => ({
  //           accountcode: item.accountCode,
  //           accountname: item.accountName,
  //           id: item.id,
  //         }));
  //         console.log("PettyCash:", JSON.stringify(this.pettyCashObj, null, 2));
  //         this.isPettyCashLoaded = true; // Mark data as loaded
  //         console.log(this.isPettyCashLoaded)
  //         this.fetchDefaultCardAccount();
  //       },
  //       error: (error) => {
  //         console.error('An Error Occurred', error);
  //       },
  //     });

  // }

  // fetchDefaultCashAccount() {      
  //   console.log("enter in default acc")
  //   console.log("PettyCash:", JSON.stringify(this.selectedProjectObj, null, 2));
  //   if(this.pettyCashObj!==null){
  //     console.log("Pecctycash default:"+JSON.stringify(this.pettyCashObj,null,2))

  //   }
  //   this.PurchaseService
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

  fetchUserPettyCash() {
    this.PurchaseService.getDetails(EndpointConstant.PETTYCASH)
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
          this.defaultWhData = defaultWh;
          if (this.defaultWhData.length > 0) {

            this.warehouseData[0] = this.defaultWhData[0];
            // console.log("Default wh:" + JSON.stringify(this.warehouseData[0], null, 2))
            this.salesForm.patchValue({
              warehouse: this.warehouseData[0].id
            });
          }
          else {
            this.salesForm.patchValue({
              warehouse: this.warehouseData[0].id
            });
          }
          // this.isPettyCashLoaded = true;
          this.fetchDefaultCashAccount();
          this.fetchCashPopup();
        },
        error: (error) => {
          console.error('An Error Occurred', error);
        },
      });
  }

  fetchDefaultCashAccount() {
    // console.log("Fetching default cash account...");
    if (this.pettyCashObj.length > 0) {
      // console.log("Petty cash loaded:", JSON.stringify(this.pettyCashObj, null, 2));
      this.defaultCashAccount = this.pettyCashObj; // Assign loaded petty cash data
    }
    else {
      this.PurchaseService.getDetails(EndpointConstant.FILLDEFAULTCASHACCOUNT)
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
      // console.log("in cash ppp up:", JSON.stringify(this.pettyCashObj, null, 2));
      this.cashPopupObj = this.pettyCashObj;
    }
    else {
      this.PurchaseService
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
