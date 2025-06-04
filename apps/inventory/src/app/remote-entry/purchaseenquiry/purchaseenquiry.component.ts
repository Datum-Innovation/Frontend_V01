import { Component, ElementRef, HostListener, QueryList, Renderer2, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { additonalChargesPopup, Currency, Customer, GridSettings, ItemOptions, Items, itemTransaction, PayType, Projects, Purchase, Purchases, Reference, Salesman, SizeMaster, StockItems, Supplier, taxPopup, UnitPricePopup, VoucherType, Warehouse } from '../model/purchase.interface';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { PurchaseEnquiryService } from '../../services/purchaseenquiry.service';
import { BaseService, CustomDialogueComponent, EndpointConstant, GridNavigationService, MainHeaderComponent, MenuDataService, SearchableDropdownComponent, STATUS_MESSAGES } from '@dfinance-frontend/shared';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Account, Branches, Category, CountryOfOrigin, ItemBrand, ItemColor, ItemHistory, ItemUnitDetails, parentItem, Quality, TaxType } from '../model/itemmaster.interface';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { BalancedialogComponent } from '../purchase/balancedialog/balancedialog.component';

@Component({
  selector: 'dfinance-frontend-purchaseenquiry',
  templateUrl: './purchaseenquiry.component.html',
  styleUrls: ['./purchaseenquiry.component.css'],
})
export class PurchaseenquiryComponent {


  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  @ViewChild('tableWrapper', { static: true }) tableWrapper!: ElementRef;
  @ViewChildren('summaryCell') summaryCells!: QueryList<ElementRef>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('overlay') overlayElement!: ElementRef;

  //Form Decalaration
  PurchaseEnquiryForm!: FormGroup; 
  additionalDetailsForm!: FormGroup;  

  //common 
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isMaximized = false;
  isLoading = false;
  isDeleteBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  isInputDisabled: boolean = true;
  isUpdate: boolean = false;
  showLeftSection:boolean = true;
  showTopBar: boolean = false;
  istoggleActive = false;
  noGridItem = true;
  showDeleteOptions: boolean = false;
  isOverlayVisible: boolean = false;
  enableInlineEditing:boolean = false;  //enable editing
  selected: any[] = [];  //used for row selected
  destroySubscription: Subject<void> = new Subject<void>(); 


  //leftside  variable
  selectedleftrow:any = [];   //used for select the row in the left side
  SelectionType = SelectionType;   //Selectiontype is a enum class where here a single click select is made from left side
  allPurchaseEnqList = [] as Array<Purchases>;    //leftside fill data from api
  tempPUEList: any = [];  //

  //items
  itemDetails: any[] = [];
  fillItemsData = [] as Array<Items>;   //item fill data from api 
  tempItemFillDetails: any = [];  //to store itemdata into this var
  itemDetailsObj:any = {
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
    "priceCategoryOptions":[],
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
  showItemDetails = false;  
  fillItemDataOptions = [] as Array<ItemOptions>;
  itemCodereturnField = 'itemCode';
  itemCodeKeys = ['Item Code', 'Item Name', 'Bar Code', 'ID', 'Unit', 'Stock', 'Rate', 'Purchase Rate'];
  itemCodeExcludekeys = ['unit'];

  itemTransactionData: any = {} as itemTransaction;
  itemBatchNoreturnField = 'batchNo';
  itemBatchNoKeys = ['BatchNo', 'Qty', 'Expiry Date','Printed MRP'];
  itemUnitreturnField= 'unit';
  itemUnitKeys= ['Unit', 'Basic Unit', 'Factor'];
  showPricePopup = false;
  currentItemUnitDetails: any = [] as Array<UnitPricePopup>;

  //Fields in item grid
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
  isStockItem = true;
  itemUnitDetails = [] as Array<ItemUnitDetails>;
  expireItemDetails: any[] = [];
  copyExpireItemDetails: any = [];
  unitsInGrid: any = [];
  stockItemObj: any = [] as Array<StockItems>;
  stockItemreturnField = 'itemname';
  stockItemKeys = ['Item Code','Item Name','ID'];
  sizeMasterObj:any = [] as Array<SizeMaster>;
  sizemasterreturnField = 'name';
  sizemasterKeys = ['Code','Name','ID'];
  pricecategoryreturnField = 'pricecategory';
  pricecategoryKeys = ['ID','Price Category', 'Perc', 'Rate'];
  tipContent:any = "";  //content in the var is being displayed when user hovers ans pased to [ngbTooltip]. here(qty)

  //Initailization
  selectedPurEnqId!: number;  //store the id from left side click
  firstPurEnq!: number;   //store id of first from list
  today = new Date();   //used to show the current date in page load
  pageId=0;
  voucherNo = 0;
  customerSupplierPageId = 0;
  itemmasterPageId = 0;
  vocherName = "";
  partyId = 0;
  locId = 0;
  commonDiscountPercent = 0.00;  //discperc in bottom
  commonDiscountAmount = 0.00;  //discamt in bottom
  currentBranch = 0;
  currentItemId = 0;
  taxTotal = 0.0000;
  qtyTotal = 0.0000;
  FOCQtyTotal = 0.0000;
  balanceAmount = 0.0000;
  grossAmountTotal = 0.0000;
  discountTotal = 0.0000;
  amountTotal = 0.0000;
  gridItemTotal = 0.0000;
  totalAdditioanalCharges = 0.0000;
  roundValue = 0.0000;
  grandTotal = 0.0000;
  
  
  //FillById
  invTransactions:any = [];
  currentPurchaseEnq = {} as Purchase;

  //tax
  taxPopupObj = [] as Array<taxPopup>;  //store tax data from popup 
  showTaxPopup = false;


  //permission checking
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;
  isPurEnqCancelled = false;

  //Currency
  multiCurrencySupport = 0;
  currentCurrencyRate = 0;
  currencyDropdown:any = [] as Array<Currency>;
  currentcurrencyObj = {};
  selectedCurrencyId = 0;

  //Project
  projectData = [] as Array<Projects>;
  projectreturnField = 'projectname';
  projectKeys = ['Project Code', 'Project Name', 'ID'];
  updatedProject = '';
  selectedProjectObj:any = {};

  //WareHouse
  warehouseData = [] as Array<Warehouse>;
  selectedWarehouseObj:any = {}

  //salesman
  salesmanData = [] as Array<Salesman>;
  updatedSalesman = '';
  salesmanField = 'name';
  salesmanKeys = ['Code', 'Name', 'ID'];
  selectedSalesmanObj:any = {};

  //supplier
  supplierData = [] as Array<Supplier>;
  updatedSupplier = '';
  supplierreturnField = 'id';
  supplierKeys = ['Account Code', 'Account Name', 'Address', 'ID', 'Mobile No', 'VAT No'];
  selectedPartyId = 0;   //used to store the id from the selected supplier popup
  selectedSupplierObj:any = {};
  supplierExcludekeys = ['partyId'];

  //referenece
  importedReferenceList:any = [];
  isReferenceImported = false;
  showImportReferencePopup = false;
  referenceFillData = [] as Array<Reference>;
  referenceData:any = {};  //store ref data 
  referenceListarray:any = [];

  //vouchertype in reference
  voucherTypeData = [] as Array<VoucherType>;

  //AdditionalCharges
  additonalChargesPopupObj = [] as Array<additonalChargesPopup>;
  additonalChargesGridDetails:any = [];
  additonalChargesGridDetailsCopy:any = [];

  //transportationtype in add.Details
  transportationTypeArr:any = [];
  selectedtransPortationType:any = {};

  //paytype in add.Details
  payTypeArr:any=[];
  payTypeObj = [] as Array<PayType>;
  selectedPayType: string | undefined = "";
  selectedPayTypeObj:any = {};


  //delete operation
  showDeletePopup = false;

  //cancel
  cancelReason:string = "";
  showCancelPopup = false;
  isPurchaseEnqCancelled = false;
  
  //gridsettings
  gridsettings:any =  [] as Array<GridSettings>;
  gridColumns:any = [];
  prevColumnValue:any = "";

  constructor(
    private purchaseenqservice:PurchaseEnquiryService,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private baseService: BaseService, 
    private formBuilder: FormBuilder,
    private gridnavigationService: GridNavigationService,
    private router: Router, 
    private renderer: Renderer2,
    private datePipe: DatePipe,
    private dialog: MatDialog,
  ){
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

  //set datatable columns
  tablecolumns = [
    { name: 'ID', field: 'id'},
    { name: 'Item Code', field: 'itemcode'},
    { name: 'Item Name', field: 'itemname' },
    { name: 'Stock Item', field: 'stockitem' },
    { name: 'BatchNo', field: 'batchno' },
    { name: 'Unit', field: 'unit' },
    { name: 'Qty', field: 'qty' },
    { name: 'FOCQty', field: 'focqty' },
    { name: 'Pricecategory', field: 'pricecategory' },
    { name: 'Rate', field: 'rate' },
    //{ name: 'RateWithTax', field: 'ratewithtax' },
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
  
  
  
  //FormLoad
  ngOnInit(): void {
    this.createForm();
    this.fetchAllPurchaseEnq();
    this.onClickNewPurchaseEnq();
    this.fetchSettings();
    this.fetchCurrencyDropdown();
    this.fetchSupplier();
    this.fetchSalesman();
    this.fetchPayType();
    this.fetchCommonFillData();
    this.fetchTransportationType();
    this.fetchAdditionalChargesPopup();
    this.currentBranch = this.baseService.getLocalStorgeItem('current_branch') ? Number(this.baseService.getLocalStorgeItem('current_branch')) : 0;  //used to fetchitemuint
    this.FillReferenceData();
    this.fetchVoucherType(); 
    this.fetchItemTransactionData();
    //get page id of customer supplier and item master...
    this.setPageId();
    this.fetchGridSettingsByPageId();
    this.fetchStockItemPopup();
    this.fetchSizeMasterPopup();
    window.addEventListener('storage', this.storageEventHandler);
  }
  private storageEventHandler!: (event: StorageEvent) => void;

  createForm(){
    this.PurchaseEnquiryForm = this.formBuilder.group({
      vouchername: [{ value: '', disabled: true }],
      voucherno: [{ value: '', disabled: true }],
      date: [{ value: this.today, disabled: this.isInputDisabled }, Validators.required],
      reference: [{ value: '', disabled: this.isInputDisabled }],
      supplier: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      currency: [{ value: '', disabled: this.isInputDisabled }],
      exchangerate: [{ value: '', disabled: this.isInputDisabled }],
      warehouse: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      project: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      description: [{ value: '', disabled: this.isInputDisabled }],
      salesman: [{ value: false, disabled: this.isInputDisabled }],
      vatno: [{ value: false, disabled: this.isInputDisabled }],
      partyinvoiceno: [{ value: false, disabled: this.isInputDisabled }],
      partyinvoicedate: [{ value: false, disabled: this.isInputDisabled }],
      approve: [{ value: '', disabled: this.isInputDisabled }],
      terms: [{ value: '', disabled: this.isInputDisabled }],
      totaldiscpercent: [{ value: false, disabled: this.isInputDisabled }],
      discountamount: [{ value: '', disabled: this.isInputDisabled }],
      roundoff: [{ value: '', disabled: this.isInputDisabled }],
      netamount: [{ value: 0.0000, disabled: this.isInputDisabled }],
      tax: [{ value: '', disabled: true }],
      addcharges: [{ value: '', disabled: true }],
      grandtotal: [{ value: 0.0000, disabled: this.isInputDisabled }],
      //paytype: [{ value: '', disabled: this.isInputDisabled }],
      //advance: [{ value: 0.00, disabled: true }],
      //totalpaid: [{ value: 0.0000, disabled: this.isInputDisabled }],
      //cash: [{ value: 0.0000, disabled: true }],
      //card: [{ value: 0.0000, disabled: true }],
      balance: [{ value: 0.0000, disabled: this.isInputDisabled }],
      //cheque: [{ value: 0.0000, disabled: true }],
      //duedate: [{ value: '', disabled: this.isInputDisabled }],
      //additemcharges: [{ value: false, disabled: this.isInputDisabled }],
  
    });

    // Additional details form 

      this.additionalDetailsForm = this.formBuilder.group({
      invoiceno:[{ value: "", disabled: this.isInputDisabled }],
      invoicedate: [{ value: "", disabled: this.isInputDisabled }],   
      orderno:[{ value: "", disabled: this.isInputDisabled }, Validators.required],
      orderdate: [{ value: "", disabled: this.isInputDisabled }],
      partyaddress: [{ value: "", disabled: this.isInputDisabled }, Validators.required],
      expirydate: [{ value: "", disabled: this.isInputDisabled }],
      transportationtype: [{ value: "", disabled: this.isInputDisabled }],
      creditperiod: [{ value: "", disabled: this.isInputDisabled }, Validators.required],
      paytype: [{ value: "", disabled: this.isInputDisabled }]
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

  fetchAllPurchaseEnq(): void {
    // this.isLoading = true;
    this.purchaseenqservice
      .getDetails(EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true')
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allPurchaseEnqList = response?.data;
          this.tempPUEList = [...this.allPurchaseEnqList];   //(...) is a spread operator takes all array of datas and assign it into new array here
          this.firstPurEnq = this.allPurchaseEnqList[0].ID;
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  onClickPurchaseEnq(event: any): void {
    if (event.type === 'click') {
      
      this.selectedPurEnqId = event.row.ID;
      console.log(this.selectedPurEnqId)
      this.emptyAllSummaryTotalsAndObjects();
      this.fetchPurchaseEnqById();
    }
  }

  fetchPurchaseEnqById(): void {
    //this.isLoading = true;
    this.purchaseenqservice
      .getDetails(EndpointConstant.FILLPURCHASEBYID + this.selectedPurEnqId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentPurchaseEnq = response?.data;
          //console.log("Fill=", JSON.stringify( this.currentSalesEstimate, null, 2));
          this.FillPurchaseEnqDetails();        
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  
  FillPurchaseEnqDetails(){
    let transactionDetails = this.currentPurchaseEnq?.transaction.fillTransactions;
    let transactionAddditional = this.currentPurchaseEnq?.transaction.fillAdditionals;
    this.invTransactions = this.currentPurchaseEnq?.transaction.fillInvTransItems;
    let transactionEntries:any = this.currentPurchaseEnq?.transaction.fillTransactionEntries;

    //fill data from transexpanse 
    let transexpenses:any=this.currentPurchaseEnq?.transaction.fillTransactionExpenses;
    this.referenceData = this.currentPurchaseEnq?.transaction.fillVoucherAllocationUsingRef;
    this.PurchaseEnquiryForm.patchValue({
            vouchername:this.vocherName,
            voucherno: transactionDetails.transactionNo,
            date: transactionDetails.date ? new Date(transactionDetails.date) : null,
            project:transactionDetails.costCentreID,
            reference:transactionDetails.referenceNo,
            supplier:transactionDetails.accountName,
            warehouse:transactionAddditional.inLocID,
            vatno:transactionAddditional.vatNo,
            partyinvoiceno:transactionAddditional.entryNo,
            partyinvoicedate:transactionAddditional.entryDate,
            description:transactionDetails.commonNarration,
            salesman:transactionAddditional.accountID,
            terms:transactionAddditional.terms
    });

    //set currency
    this.currentcurrencyObj = {
      "id":transactionDetails.currencyID,
      "value":transactionDetails.currency
    };
    this.selectedCurrencyId = transactionDetails.currencyID;
    let currencyObj = this.currencyDropdown.find((currency: any) => currency.currencyID == this.selectedCurrencyId);
    // this.currentCurrencyRate = currencyObj.currencyRate;

     this.formVoucherNo = transactionDetails.transactionNo;    //pass this formvoucherno to payload

    // //set transaction is cancelled or not...
     this.isPurEnqCancelled = transactionDetails.cancelled;

    //set supplier data...
    this.onSupplierSelected(transactionDetails.accountID);

    //set salesman data...
    if(transactionAddditional.accountName != null){
      this.onSalesmanSelected(transactionAddditional.accountName);
    }

    //set project data...
    if(transactionDetails.projectName != null){
      this.onProjectSelected(transactionDetails.projectName);
    }

    //set additional details..
    this.setAdditionalDetailsFromFill(transactionAddditional);

    // //set transaction entries...
    // this.setTransactionEntries(transactionEntries);

     this.settransexpansedata(transexpenses);
     //this.setTransactionEntries(transactionEntries);

     this.setGridDetailsFromFill(this.invTransactions);

    // //calculate totals...    
     this.calculateTotals(); 

    //set payment information...
    //this.setPaymentInformation(payment); 
    //set cheque payment information...
    //this.setChequeInformation(chequeInfo); 
    //fill voucher allocation...
    //this.setVoucherAllocationUsingReference();
    //on change pay type...
    this.onChangePayType();
   
   
  }





  onScroll(event: any) {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    this.showTopBar = scrollTop > 50  ? true : false;  // Show the bar when scrolled more than 50px
  }

  onPurchaseTabChange(event: MatTabChangeEvent) {
   
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
        MultiCurrencySupport:0,
        SuperImposeItem: false
      }
    );
  
    this.grossAmountEditSettings = grossAmountEditSettings;
    this.autoroundoffEnabled = autoroundoffEnabled;
    this.itemExpiryManagement = ItemExpiryManagement;
    this.multiCurrencySupport = MultiCurrencySupport;
    this.showStockItemField = SuperImposeItem;   
  }



  onClickNewPurchaseEnq() {
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
    this.PurchaseEnquiryForm.reset();
    this.additionalDetailsForm.reset();
    this.selectedPurEnqId = 0;
    this.updatedSupplier = "";
    this.updatedProject = "";
    this.itemDetails = [];
    this.isPurEnqCancelled = false;


    this.fillItemsData = [];
    this.importedReferenceList = [];
    if (this.isInputDisabled == true) {
      this.disbaleFormControls();
      this.selectedPurEnqId = this.firstPurEnq;
      this.fetchPurchaseEnqById();
    } else {
      this.selectedPurEnqId = 0;
      this.PurchaseEnquiryForm.patchValue({
        date: this.today,
        advance: 0.0000,
        netamount: 0.0000,
        grandtotal: 0.0000
      });
      this.enableFormControls();
      this.currentItemTableIndex = 0;
      //empty item detaills....
      this.tempItemFillDetails = [];
      this.itemDetails = [];
      this.invTransactions = [];

      // empty payment popup grid details card,cash and cheque,tax ....
      //this.cashPopupGridDetails = [];
      //this.cardPopupGridDetails = [];
      //this.chequePopupGridDetails = [];
      this.taxPopupObj = [];

      this.addRow();
      this.fetchCommonFillData();
      this.emptyAllSummaryTotalsAndObjects();
      //set false for is party selected field to false...
      this.isPartySelected = false;
    }
    return true;
  }

  emptyAllSummaryTotalsAndObjects(){
    this.qtyTotal = 0.0000;
    this.FOCQtyTotal = 0.0000;
    this.grossAmountTotal = 0.0000;
    this.discountTotal = 0.0000;
    this.amountTotal = 0.0000;
    this.taxTotal = 0.0000;
    this.gridItemTotal = 0.0000;
    //this.totalAmountPaid = 0.0000;
    this.totalAdditioanalCharges = 0.0000;
    this.amountTotal = 0.0000;
    this.taxTotal = 0.0000;
    this.roundValue = 0.0000;
    // this.cardAmount = 0.0000;
    // this.cashAmount = 0.0000;
    // this.chequeAmount = 0.0000;
    this.grandTotal = 0.0000;
    this.noGridItem = true;
    this.selectedSupplierObj = {};
    this.PurchaseEnquiryForm.patchValue({
      "roundoff":""
    });
  }

  fetchCommonFillData() {
    this.purchaseenqservice
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
          this.warehouseData = this.commonFillData?.wareHouse;
          if (this.warehouseData?.length > 0) {
            this.PurchaseEnquiryForm.patchValue({
              warehouse: this.warehouseData[0].id
            });
          }
          //setting voucher data..
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
    this.PurchaseEnquiryForm.patchValue({
      vouchername: this.vocherName,
      voucherno: this.commonFillData.vNo?.result,
    });
    this.formVoucherNo = this.commonFillData.vNo?.result;
  }

  fetchSalesman() {
    this.purchaseenqservice
      .getDetails(EndpointConstant.FILLPURCHASESALESMAN)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.salesmanData = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchSupplier() {
    this.purchaseenqservice
    .getDetails(EndpointConstant.FILLPURCHASESUPPLIER+"&voucherId="+this.voucherNo+"&pageId="+this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data?.customerData;
          this.supplierData = responseData.map((item: any) => ({
            accountCode: item.accountCode,
            accountName: item.accountName,
            address: item.address,
            id: item.id,
            mobileNo: item.mobileNo,
            vatNo: item.vatNo,
            partyId:item.partyID
          }));
          this.prevPayType = response?.data?.prevPayType;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

 
  fetchVoucherType() {
    this.partyId = this.selectedPartyId;
    this.purchaseenqservice
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
    this.purchaseenqservice
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

  
  fetchPayType() {
    this.purchaseenqservice
      .getDetails(EndpointConstant.FILLPAYTYPE)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData  = response?.data;
          if (responseData) {
            this.payTypeObj = response?.data.payType;
            if (this.payTypeObj?.length > 0) {
              this.PurchaseEnquiryForm.patchValue({
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
    let paytypeId = this.additionalDetailsForm.get('paytype')?.value;
    this.payTypeObj.find(paytype => {
      if (paytype.id == paytypeId) {
        this.selectedPayType = paytype.name;
        this.selectedPayTypeObj =  {
          "id": paytype.id,
          "value": paytype.name
        };
      }
    });
   
  }

 


  fetchAdditionalChargesPopup() {
    this.purchaseenqservice
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
    this.purchaseenqservice
      .getDetails(EndpointConstant.FILLITEMTRANSACTIONDATA)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.itemTransactionData = response?.data;
          console.log("itemTranData="+ this.itemTransactionData)
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  

  fetchStockItemPopup() {
    if(this.showStockItemField){
      this.purchaseenqservice
        .getDetails(EndpointConstant.FILLSTOCKITEMPOPUP)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            let result = response?.data;
            if(result){
              result.forEach((stock:any) => {
                this.stockItemObj.push({
                  "itemcode":stock.itemCode,
                  "itemname":stock.itemName,
                  "id":stock.id
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
    if(this.showStockItemField){
      this.purchaseenqservice
        .getDetails(EndpointConstant.FILLSIZEMASTERPOPUP)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
           let result = response?.data;
           result.forEach((sizemaster:any) => {
            this.sizeMasterObj.push({
              "code":sizemaster.code,
              "name":sizemaster.sizeMasterName,
              "id":sizemaster.id,
              "description":""
            });
          });
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
  }  

  // fetchQtySettings() {
  //   this.DeliveryInService
  //     .getDetails(EndpointConstant.FETCHQTYSETTINGS)
  //     .pipe(takeUntil(this.destroySubscription))
  //     .subscribe({
  //       next: (response) => {
  //        this.defaultQtySetting = response ? response.data.defaultQuantity :0;
  //        this.showRateWithTax = response.data.rateWithTax;
  //       },
  //       error: (error) => {
  //         console.error('An Error Occured', error);
  //       },
  //     });
  // } 


  fetchGridSettingsByPageId() {
    if(this.showStockItemField){
      this.purchaseenqservice
        .getDetails(EndpointConstant.FILLGRIDSETTINGSBYPAGEID+this.pageId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            if(response?.data && response.httpCode == 200){
              this.gridsettings = response?.data;
              this.gridColumns = this.gridsettings.map((setting: any) => setting.columnName);
            }
           
             //set to show  fields for stockitem, pricecategory and sizemaster in grid 
            this.setSettingsBasedGridFields();
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
  }

  setSettingsBasedGridFields(){
    //check and remove stockitem, pricecategory and sizemaster id from column list
    if(!this.gridColumns.includes('StockItem') || !this.showStockItemField ){
      this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'stockitem');
    }
    if(!this.gridColumns.includes('PriceCategory')){
      this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'pricecategory');
    }
    if(!this.gridColumns.includes('SizeMasterID')){
      this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'sizemasterid');
    }
    if(this.showRateWithTax == 0){
      this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'ratewithtax');
    }
  }
    filterPurchaseEnq(event: any) {
    const val = event.target.value.toLowerCase();
    // filter our data
    const temp = this.tempPUEList.filter(function (d: any) {
      const trNoMatch = d.TransactionNo.toString().toLowerCase().includes(val.toLowerCase());
      return trNoMatch || !val;
    });
    // update the rows
    this.allPurchaseEnqList = temp;
  }




  fetchCurrencyDropdown() {
    if(this.multiCurrencySupport){
      this.purchaseenqservice
        .getDetails(EndpointConstant.FILLMULTICURRENCYDROPDOWN)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            this.currencyDropdown = response?.data;     
            this.currentCurrencyRate = this.currencyDropdown?.[0].currencyRate;  
            this.currentcurrencyObj =  {
              "id":this.currencyDropdown?.[0].currencyID,
              "value":this.currencyDropdown?.[0].abbreviation
            };   
            this.selectedCurrencyId = this.currencyDropdown?.[0].currencyID;
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
  }

  onChangeCurrency(event:any){
    let currencyId = event.target.value;
    let currencyObj = this.currencyDropdown.find((currency: any) => currency.currencyID == currencyId);
    this.currentCurrencyRate = currencyObj.currencyRate;
    this.currentcurrencyObj =  {
      "id":currencyObj.currencyID,
      "value":currencyObj.abbreviation
    };
    this.selectedCurrencyId = currencyObj.currencyID;
  }

  saveCurrencyRate(){
    //currency id and currency rate 
    if(confirm('Are you sure you want to update exchange rate for this currency?')){
      this.purchaseenqservice.updateDetails(EndpointConstant.UPDATEEXCHANGERATE+this.selectedCurrencyId+'&exchRate='+this.currentCurrencyRate, {})
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            if(response.httpCode == 200){
              alert('Rate updated');
            } else{
              alert('Please try again');
            }
            
          },
          error: (error) => {
            alert('Please try again');
          },
        });
      }
  }

  setPageId(){
    let customerSupplierUrl = "General/Customer-Supplier";
    let cusSupPageInfo = this.baseService.getMenuByUrl(customerSupplierUrl);
    this.customerSupplierPageId =  cusSupPageInfo?.id;

    //item master...
    let itemMasterUrl = "General/Customer-Supplier";
    let itemMasterPageInfo = this.baseService.getMenuByUrl(itemMasterUrl);
    this.itemmasterPageId =  itemMasterPageInfo?.id;
  }


  FillReferenceData(){
    this.purchaseenqservice
    .getDetails(EndpointConstant.FILLREFERENCEDATA+this.voucherNo)
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

  FillTaxAccount(taxAccountId: number, oldTaxAmount: number, rowIndex:number) {
    //taxAccountId=942
    console.log("filltaxaccc")
    let gridTaxAmount = this.itemDetails[rowIndex]['taxValue'];
    this.purchaseenqservice
      .getDetails(EndpointConstant.FILLTAXACCOUNTDATA + taxAccountId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let taxAccountData = response?.data[0];
          let taxExists = false;
          this.taxPopupObj.forEach((tax) => {
            if (tax.taxid === taxAccountId) {
              tax.amount = tax.amount - oldTaxAmount+ Number(gridTaxAmount);
              tax.amount = this.baseService.formatInput(tax.amount);
              taxExists = true;
            }
          });
          if (taxExists == false) {
            let taxobj: any = {
              taxid: taxAccountId,
              accountCode: {
                alias:taxAccountData.alias,
                name:taxAccountData.name,
                id:taxAccountData.id
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


  fetchItemFillData() {
    console.log("check!!!!!!!!!!!")
    this.partyId = this.selectedPartyId;
    this.locId = this.PurchaseEnquiryForm.get('warehouse')?.value;
    console.log(EndpointConstant.FILLPURCHASEITEMS + 'partyId=' + this.partyId + '&voucherId=' + this.voucherNo)
    this.purchaseenqservice
      .getDetails(EndpointConstant.FILLPURCHASEITEMS + 'partyId=' + this.partyId + '&voucherId=' + this.voucherNo)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let responseData = response?.data.items;
          console.log("items"+JSON.stringify(responseData,null,2))
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

          // push our inital complete list
          this.fillItemsData = responseData;
          this.fillItemDataOptions = itemData;

          if(this.fillItemsData.length > 0){
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






  setItemDetailsFromImportReference(){
    //set item details if import reference details are there ..
    if(this.importedReferenceList.length > 0 && !this.isReferenceImported){
      //remove last empty array from grid 
      let index = this.itemDetails.length - 1;
      this.itemDetails.splice(index, 1);
      this.importedReferenceList.forEach((element:any) => {
        const itemExists = this.itemDetails.some((existingItem:any) => 
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
          insertItem.discount =this.baseService.formatInput(Number(element.Discount));
          insertItem.amount = this.baseService.formatInput(Number(element.Amount));          
          insertItem.taxPerc = element.TaxPerc ? element.TaxPerc : 0;
          insertItem.taxValue = this.baseService.formatInput(Number(element.TaxValue));
          insertItem.total = 0.0000;
          insertItem.expiryDate = element.ExpiryDate ? new Date(element.ExpiryDate).toISOString() : null;
          insertItem.transactionId = element.TransactionID;
          insertItem.taxAccountId = element.TaxAccountID ? element.TaxAccountID : 0;         
          insertItem.refTransItemId = element.ID;
          this.itemDetails.push(insertItem);
          if(unitInfoOptions.length == 0){
            this.fetchItemUnits(element.ItemID,this.itemDetails.length-1,element.Unit);
          }
          let rowIndex = this.itemDetails.length - 1;
          this.calculateItemAmount(rowIndex);
          this.FillTaxAccount(this.itemDetails[rowIndex]['taxAccountId'], 0, rowIndex);
        }else {
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

  fetchItemUnits(itemId:any,rowIndex:any,unitInp:any){
    this.purchaseenqservice
      .getDetails(EndpointConstant.FETCHPURCHASEITEMUNITDETAILS+itemId+'&BranchId='+this.currentBranch)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
         let unitsArr = response?.data;
         let unitOptions:any = [];
         unitsArr.forEach((unitInfo:any) => {
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
    this.purchaseenqservice
      .getDetails(EndpointConstant.FETCHNEWITEMCODE)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.PurchaseEnquiryForm.patchValue({
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
    this.PurchaseEnquiryForm.get('date')?.enable();
    this.PurchaseEnquiryForm.get('reference')?.enable();
    this.PurchaseEnquiryForm.get('supplier')?.enable();
    this.PurchaseEnquiryForm.get('currency')?.enable();
    this.PurchaseEnquiryForm.get('exchangerate')?.enable();
    this.PurchaseEnquiryForm.get('warehouse')?.enable();
    this.PurchaseEnquiryForm.get('project')?.enable();
    this.PurchaseEnquiryForm.get('description')?.enable();
    this.PurchaseEnquiryForm.get('approve')?.enable();
    this.PurchaseEnquiryForm.get('terms')?.enable();
    this.PurchaseEnquiryForm.get('totaldiscpercent')?.enable();
    this.PurchaseEnquiryForm.get('discountamount')?.enable();
    this.PurchaseEnquiryForm.get('roundoff')?.enable();
    this.PurchaseEnquiryForm.get('netamount')?.enable();
    this.PurchaseEnquiryForm.get('grandtotal')?.enable();
    //this.DeliveryInForm.get('paytype')?.enable();
    //this.DeliveryInForm.get('totalpaid')?.enable();
    this.PurchaseEnquiryForm.get('balance')?.enable();
    //this.DeliveryInForm.get('duedate')?.enable();
    //this.DeliveryInForm.get('additemcharges')?.enable();
    this.PurchaseEnquiryForm.get('salesman')?.enable();
    this.PurchaseEnquiryForm.get('vatno')?.enable();
    this.PurchaseEnquiryForm.get('partyinvoiceno')?.enable();
    this.PurchaseEnquiryForm.get('partyinvoicedate')?.enable();

    //enable additional details form 
    
    this.additionalDetailsForm.get('invoiceno')?.enable();
    this.additionalDetailsForm.get('invoicedate')?.enable();
    this.additionalDetailsForm.get('orderno')?.enable();
    this.additionalDetailsForm.get('orderdate')?.enable();
    this.additionalDetailsForm.get('partyaddress')?.enable();
    this.additionalDetailsForm.get('expirydate')?.enable();
    this.additionalDetailsForm.get('transportationtype')?.enable();
    this.additionalDetailsForm.get('creditperiod')?.enable();
    this.additionalDetailsForm.get('paytype')?.enable();
   
  }

  disbaleFormControls() {
    this.PurchaseEnquiryForm.get('date')?.disable();
    this.PurchaseEnquiryForm.get('reference')?.disable();
    this.PurchaseEnquiryForm.get('supplier')?.disable();
    this.PurchaseEnquiryForm.get('currency')?.disable();
    this.PurchaseEnquiryForm.get('exchangerate')?.disable();
    this.PurchaseEnquiryForm.get('warehouse')?.disable();
    this.PurchaseEnquiryForm.get('project')?.disable();
    this.PurchaseEnquiryForm.get('description')?.disable();
    this.PurchaseEnquiryForm.get('approve')?.disable();
    this.PurchaseEnquiryForm.get('terms')?.disable();
    this.PurchaseEnquiryForm.get('totaldiscpercent')?.disable();
    this.PurchaseEnquiryForm.get('discountamount')?.disable();
    this.PurchaseEnquiryForm.get('roundoff')?.disable();
    this.PurchaseEnquiryForm.get('netamount')?.disable();
    this.PurchaseEnquiryForm.get('grandtotal')?.disable();
    //this.DeliveryInForm.get('paytype')?.enable();
    //this.DeliveryInForm.get('totalpaid')?.enable();
    this.PurchaseEnquiryForm.get('balance')?.disable();
    //this.DeliveryInForm.get('duedate')?.enable();
    //this.DeliveryInForm.get('additemcharges')?.enable();
    this.PurchaseEnquiryForm.get('salesman')?.disable();
    this.PurchaseEnquiryForm.get('vatno')?.disable();
    this.PurchaseEnquiryForm.get('partyinvoiceno')?.disable();
    this.PurchaseEnquiryForm.get('partyinvoicedate')?.disable();

    //Disable additional details ..
    this.additionalDetailsForm.get('invoiceno')?.disable();
    this.additionalDetailsForm.get('invoicedate')?.disable();
    this.additionalDetailsForm.get('orderno')?.disable();
    this.additionalDetailsForm.get('orderdate')?.disable();
    this.additionalDetailsForm.get('partyaddress')?.disable();
    this.additionalDetailsForm.get('expirydate')?.disable();
    this.additionalDetailsForm.get('transportationtype')?.disable();
    this.additionalDetailsForm.get('creditperiod')?.disable();
    this.additionalDetailsForm.get('paytype')?.disable();
    
  }


  onClickSavePurchaseEnq() {
    if(this.PurchaseEnquiryForm.get('supplier')?.value == null){
      alert('Enter Customer/Supplier and proceed');
      this.moveFocusToDropdown('supplier');
      return false;
    } 
  
    else if(this.itemDetails[0].itemCode === null || this.itemDetails[0].itemCode === ""){
      alert("Item cannot be empty. Please add items");
      return false;
    }

   
    else if(this.grandTotal == 0){
      alert('Amount must be greater than zero');
      return false;
    }


    const date=this.PurchaseEnquiryForm.get('date')?.value
    if(date === null){
      alert("Enter date and proceed")
    }
  
    //fetch project data...
     if (this.PurchaseEnquiryForm.value.project) {
      this.projectData.forEach((element:any)=>{
        if(element.projectname == this.PurchaseEnquiryForm.value.project){
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
    if(this.PurchaseEnquiryForm.get('warehouse')?.value){
      this.warehouseData.forEach((element:any)=>{
        if(element.id == this.PurchaseEnquiryForm.get('warehouse')?.value){
          this.selectedWarehouseObj = {
            "id": element.id,
            "value": element.name
          };
        }
        //console.log("warehouse="+this.selectedWarehouseObj)
      });
    }
    //set transportation type..
    if(this.additionalDetailsForm.get('transportationtype')?.value){
      this.transportationTypeArr.forEach((element:any)=>{
        if(element.id == this.additionalDetailsForm.get('transportationtype')?.value){
          this.selectedtransPortationType = {
            "id": element.id,
            "value": element.value
          };
        }
      });
    }
    //set salesman data...
    if(this.PurchaseEnquiryForm.get('salesman')?.value){
      this.salesmanData.forEach((element:any)=>{
        if(element.name == this.PurchaseEnquiryForm.get('salesman')?.value){
          this.selectedSalesmanObj = {
            "id": element.id,
            "name": element.name,
            "code": element.code,
            "description": ""
          };
        }
      });
    }

    
   
    //removing last entry from item details ..
    this.itemDetails.pop();

    
    const payload = {
      "id": this.selectedPurEnqId ? this.selectedPurEnqId : 0,
      "voucherNo": this.formVoucherNo,
      "date": this.PurchaseEnquiryForm.value.date,
      "reference": this.PurchaseEnquiryForm.value.reference,
      "references": this.referenceListarray,
      "party": this.selectedSupplierObj,
      "currency": this.currentcurrencyObj,
      "exchangeRate": this.currentCurrencyRate,
      "project": this.selectedProjectObj,
      "description":  this.PurchaseEnquiryForm.value.description,
      "grossAmountEdit": this.isgrossAmountEditable,
      "fiTransactionAdditional": {
        "transactionId": 0,
        "terms": this.PurchaseEnquiryForm.value.terms,
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
        "salesArea": {},
        "staffIncentives": 0,
        "mobileNo": "",
        "vehicleNo": {},
        "attention": "",
        "despatchNo": null,
        "despatchDate": null,
        "deliveryDate": null,
        "deliveryNote": "",
        "partyName": "",
        "addressLine1": "",
        "addressLine2": "",
        "delivaryLocation": {},
        "termsOfDelivery": "",
        "payType": this.selectedPayTypeObj,    
        "approve": this.PurchaseEnquiryForm.value.approve,
        "days": 0,
        "closeVoucher": true,
        "code": "string",
        "isHigherApproval": true
      },
      "items": this.itemDetails,
      "transactionEntries": {
        "totalDisc": 0,
        "amt": 0,
        "roundoff": 0,
        "netAmount": 0,
        "grandTotal": this.grandTotal,
        "payType": {},
        "dueDate": null,
        "totalPaid": this.PurchaseEnquiryForm.value.totalpaid,
        "balance": 0,
        "advance": [],
        "cash":[],
        "card": [],
        "cheque": [],
        "tax": this.taxPopupObj,
        "addCharges": this.additonalChargesGridDetails
      },
      "cancelled": false,
     
    };
    console.log("Payload="+JSON.stringify(payload, null, 2));
    if (this.isUpdate) {
      this.updateCallback(payload);
    } else {
      this.createCallback(payload);
    }
     return true;
  }

  updateCallback(payload: any) {
    //console.log("entering update")
    //console.log("Payload=", JSON.stringify(payload, null, 2));
    
    this.purchaseenqservice.updateDetails(EndpointConstant.UPDATEPUE+this.pageId+'&voucherId='+this.voucherNo, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(!this.activePrintOption){
            // alert(response.data);
          const status = response.httpCode as keyof typeof STATUS_MESSAGES; 
          const message =STATUS_MESSAGES[status] ; 
          alert(message); 
          } else{
            this.showPrintConfirmBox();
          }        
          this.selectedPurEnqId = 0;
          this.selectedPurEnqId = this.firstPurEnq;
          this.setInitialState();
          this.onClickNewPurchaseEnq();
        },
        error: (error) => {
          this.isLoading = false;
          alert('Please try again');
        },
      });
  }

  createCallback(payload: any) {
    //console.log("Payload=", JSON.stringify(payload, null, 2));
    this.purchaseenqservice.saveDetails(EndpointConstant.SAVEPUE+this.pageId+'&voucherId='+this.voucherNo, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          if(!this.activePrintOption){
            const status = response.httpCode as keyof typeof STATUS_MESSAGES;
            const message =STATUS_MESSAGES[status] ; 
            alert(message); 
          } else{
            this.showPrintConfirmBox();
          }   
          
          this.selectedPurEnqId = this.firstPurEnq;
          this.fetchAllPurchaseEnq();
          this.setInitialState();
          this.onClickNewPurchaseEnq();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving branch', error);
        },
      });
  }


  onClickEditPurchaseEnq() {
    if(!this.isEdit){
      alert('Permission Denied!');
      return false;
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
    this.itemDetails=[];
    this.updatedSupplier = "";
    this.updatedProject = "";
    
    if (this.isInputDisabled == false) {
      this.enableFormControls();
    } else {
      this.disbaleFormControls();
    }
    this.fetchPurchaseEnqById();
    return true;
  }

  onClickPrint(){
    console.log('print');
  }

  onClickPreview(){
    console.log('preview');
  }


  onClickDeletePurchaseEnq(event:Event) {
    event.preventDefault();
    if(!this.isDelete){
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

  confirmDelete(){
    this.purchaseenqservice.deleteDetails(EndpointConstant.DELETEPURCHASE + this.selectedPurEnqId+'&pageId='+this.pageId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            this.showDeletePopup = false;
            const status = response.httpCode as keyof typeof STATUS_MESSAGES;
            const message = STATUS_MESSAGES[status] ;
            alert(message);
            this.selectedPurEnqId = 0;
            this.showDeletePopup = false;
            this.fetchAllPurchaseEnq();
            this.setInitialState();
            this.onClickNewPurchaseEnq();
          },
          error: (error) => {
            this.isLoading = false;
            alert('Please try again');
          },
        });
  }

  closeDeletePopup(){
    this.showDeletePopup = false;
  }

  onClickCancelPurchaseEnq(event:Event){
    event.preventDefault();
    if(!this.isCancel){
      alert('Permission Denied!');
      return false;
    }
    this.showCancelPopup = true;
    this.toggleDeleteOptions();
    return true;
  }
  
  confirmCancel(){
    this.purchaseenqservice.updateDetails(EndpointConstant.CANCELPURCHASE + this.selectedPurEnqId+'&pageId='+this.pageId+'&reason='+this.cancelReason,{})
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            const status = response.httpCode as keyof typeof STATUS_MESSAGES;
            const message = STATUS_MESSAGES[status] ;
            alert(message);
            this.cancelReason = "";
            this.selectedPurEnqId = 0;
            this.showCancelPopup = false;
            this.fetchAllPurchaseEnq();
            this.setInitialState();
            this.onClickNewPurchaseEnq();
          },
          error: (error) => {
            alert('Please try again');
          },
        });
  }

  closeCancelPopup(){
    this.showCancelPopup = false;
  }

  onClickDeliverIn(event: any): void {
    if (event.type === 'click') {
      
      this.selectedPurEnqId = event.row.ID;
      console.log(this.selectedPurEnqId)
      this.emptyAllSummaryTotalsAndObjects();
      this.fetchPurchaseEnqById();
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




    settransexpansedata(transexpenses:any){    
    this.additonalChargesGridDetails = [];
    let totalAddCharges = 0.00;
    this.taxPopupObj = [];
    transexpenses.forEach((item:any) => {
      
      if(item.tranType == 'Expense'){
        totalAddCharges = totalAddCharges + item.amount;
        let accountData = {
          "accountCode": {
            "alias": item.alias,
            "name": item.name,
            "id": item.accountId
          },
          "description": item.description,
          "amount": item.amount,
          "payableAccount": {}
        }
        this.additonalChargesGridDetails.push(accountData);
      } else if(item.tranType == 'Tax'){  
        let tax = this.baseService.formatInput(item.amount);  
        this.PurchaseEnquiryForm.patchValue({
          "tax":tax
        })      
        
          this.taxPopupObj.push({
            taxid: item.accountId,
            accountCode: {
            alias:item.alias.toString(),
            name:item.name,
            id:item.accountId
          },
          discription: item.description,
          amount: item.amount,
          payableAccount: {}
        });
      }  else if(item.tranType == 'RoundOff'){ 
        let amount = this.baseService.formatInput(item.amount);       
        this.PurchaseEnquiryForm.patchValue({
          "roundoff":amount
        })
        this.roundValue = amount; 
      } 
    });
    totalAddCharges = this.baseService.formatInput(totalAddCharges);
    this.PurchaseEnquiryForm.patchValue({
      "addcharges":totalAddCharges
    });
    this.totalAdditioanalCharges = totalAddCharges;
  }

  setAdditionalDetailsFromFill(transactionAddditional:any){
    // let vehiclename = "";
    // this.vehicleNoData.forEach((vehicle:any) => {
    //   if(vehicle.id == transactionAddditional.vehicleID){
    //     vehiclename = vehicle.vehicleNo;
    //   }
    // });
   
    this.additionalDetailsForm.patchValue({
      invoiceno:transactionAddditional.entryNo,
      invoicedate: transactionAddditional.entryDate ? new Date(transactionAddditional.entryDate) : null,   
      orderno:transactionAddditional.referenceNo,
      orderdate: transactionAddditional.referenceDate ? new Date(transactionAddditional.referenceDate) : null,
      partyaddress: transactionAddditional.name,
      expirydate: transactionAddditional.expiryDate ? new Date(transactionAddditional.expiryDate) : null,
      transportationtype: transactionAddditional.lcApplnTransID,
      creditperiod: transactionAddditional.period,
      paytype: transactionAddditional.modeID
      //vehicleno:vehiclename,
      // attention: transactionAddditional.bankAddress,
      // deliverynote: transactionAddditional.passNo,
      // deliverydate: transactionAddditional.submitDate,
      // dispatchno: transactionAddditional.documentNo,
      // dispatchdate: transactionAddditional.documentDate,
      // partyname: transactionAddditional.partyName,
      // addressline1: transactionAddditional.address1,
      // addressline2: transactionAddditional.address2,
      // deliverylocation: transactionAddditional.recommendNote,
      // terms: transactionAddditional.address,   
      // salesarea: transactionAddditional.areaID,
      // staffincentive: transactionAddditional.interestAmt,
      // mobilenumber: transactionAddditional.lcNo            
    });
    // this.updatedDeliveryLocation = transactionAddditional?.recommendNote;
    // this.updatedVehicleNo = transactionAddditional?.vehicleNo;
   
  }

  setGridDetailsFromFill(invTransactions:any){
    if(invTransactions.length > 0){
      this.itemDetails = [];
      invTransactions.forEach((trn:any) => {
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
            // itemInfo.priceCategory.forEach((pricecategory: any) => {          
            //   priceCategoryOptions.push( {
            //     "id": pricecategory.id,
            //     "pricecategory": pricecategory.priceCategory,
            //     "perc": pricecategory.perc,
            //     "rate":pricecategory.rate
            //   });
            // });

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
        //gridItem.taxvalue = trn.taxValue;
        gridItem.total = trn.totalAmount;
        gridItem.expiryDate = trn.expiryDate ? trn.expiryDate : null;
        gridItem.stockItemId = trn.stockItemId;
        gridItem.stockItem = trn.stockItem; 
        gridItem.taxAccountId = trn.taxAccountId;
        gridItem.priceCategoryOptions = priceCategoryOptions;
        gridItem.priceCategory = {
          "id":itemPricecategoryObj?.id,
          "code":itemPricecategoryObj?.perc.toString(),
          "name":itemPricecategoryObj?.pricecategory,
          "description":itemPricecategoryObj?.rate
        };
        this.itemDetails.push(gridItem);
        //set size master...
       this.onSizemasterSelected(trn.sizeMasterName,this.itemDetails.length-1);

      });
      this.itemDetails.push(this.itemDetailsObj);   ///push
      this.noGridItem = false;
      this.currentItemTableIndex = this.itemDetails.length - 1;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
      this.calculateTotals(); 
    }
  }

  setTransactionEntries(transactionEntries:any){    
    this.additonalChargesGridDetails = [];
    let totalAddCharges = 0.00;
    this.taxPopupObj = [];
    transactionEntries.forEach((item:any) => {
      
      if(item.tranType == 'Expense'){
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
      } else if(item.tranType == 'Tax'){        
        this.taxPopupObj.push({
          taxid: item.accountId,
          accountCode: {
            alias:item.alias.toString(),
            name:item.name,
            id:item.accountId
          },
          discription: item.description,
          amount: item.amount,
          payableAccount: {}
        });
      }  else if(item.tranType == 'RoundOff'){ 
        let amount = this.baseService.formatInput(item.amount);       
        this.PurchaseEnquiryForm.patchValue({
          "roundoff":amount
        })
        this.roundValue = amount; 
      } 
    });
    totalAddCharges = this.baseService.formatInput(totalAddCharges);
    this.PurchaseEnquiryForm.patchValue({
      "addcharges":totalAddCharges
    });
    this.totalAdditioanalCharges = totalAddCharges;
  }

  setExpiryDetailsFromFill(invTransactions:any){
    this.expireItemDetails = [];
    if(invTransactions.length > 0){
      invTransactions.forEach((trn:any) => {
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
              manufactureDate: trn.manufactureDate ? this.datePipe.transform(new Date(trn.manufactureDate),'dd/MM/yyyy') : null,
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

  calculateTotals(){
    this.calculateQantityTotal();
    this.calculateFOCQantityTotal();
    this.calculateGrossAmountTotal();
    this.calculateDiscountTotal();
    this.calculateAmountTotal();
    this.calculateTaxTotal();
    this.calculateGridItemTotal();
    //this.calculateBalanceAndPaidAmount();
  }

 

  onSupplierSelected(option: any): any {
    this.selectedPartyId = option;
    console.log(option)
    console.log("supplierdata="+JSON.stringify(this.supplierData,null,2))
    this.supplierData.forEach((item) => {
      console.log("gfdfjeg")
      if (item.id === option) {
        this.PurchaseEnquiryForm.patchValue({
         
          supplier: item.accountName,
          vatno:item.vatNo
        });
        this.updatedSupplier = item.accountName;
        this.selectedSupplierObj = {
          "id": item.id,
          "name": item.accountName,
          "code": item.accountCode,
          "description": ""
        };
        //this.fetchDeliveryLocation();
        this.checkItemCodeCanAdd();
        //this.checkAdvanceAmount();
        this.moveFocusToItemGrid();
        this.isPartySelected = true;
        if(this.selectedPartyId == this.defaultCustomer){
          //this.moveFocusToItemGrid();
        }   
        //check default customer is cash customer then set pay type as Cash
        if(this.selectedPurEnqId == 0){
          //this.setPayTypeBasedOnCustomer();    
        }         
      }
    });
  }

 

  moveFocusToItemGrid(){
    this.currentColIndex = 1;
    this.currentRowIndex = 0;
    this.scrollToCell(this.currentRowIndex,this.currentColIndex);
    this.enableInlineEditing = false;
    this.focusGridCell(this.currentRowIndex, this.currentColIndex);
  }

  onProjectSelected(option: string): any {
    this.updatedProject = option;
    this.PurchaseEnquiryForm.patchValue({
      project: option,
    });
    this.moveFocusToDropdown('supplier');
  }

  onSalesmanSelected(option: string): any {
    this.updatedSalesman = option;
    this.PurchaseEnquiryForm.patchValue({
      salesman: option,
    });
  }

  checkItemCodeCanAdd() {
    const warehouseId = this.PurchaseEnquiryForm.get('warehouse')?.value;
    const customerId = this.PurchaseEnquiryForm.get('supplier')?.value;

    if (warehouseId && customerId) {
      this.fetchItemFillData();
    }
  }

  onItemCodeSelected(option: any, rowIndex: number) {
    if(option != ""){
      let selectedItemObj: any = {};
      let selectedxpireItemObj: any = {};
      this.fillItemsData.forEach((itemInfo: any) => {
        if (itemInfo.item.itemCode === option) 
        {
          //setting item unit options....
          let unitInfoOptions: any = [];
          itemInfo.unitPopup.forEach((unitInfo: any) => {
            let unitObj = {
              "unit": unitInfo.unit,
              "basicunit": unitInfo.basicUnit,
              "factor": unitInfo.factor
            }
            unitInfoOptions.push(unitObj);
          });
          let firstUnit = itemInfo.unitPopup[0];

          //setting item price category...
          let priceCategoryOptions: any = [];
          // itemInfo.priceCategory.forEach((pricecategory: any) => {          
          //   priceCategoryOptions.push( {
          //     "id": pricecategory.id,
          //     "pricecategory": pricecategory.priceCategory,
          //     "perc": pricecategory.perc,
          //     "rate":pricecategory.rate
          //   });
          // });

          selectedItemObj = { ...this.itemDetailsObj }; 
          selectedItemObj.itemId = itemInfo.item.id;
          selectedItemObj.itemCode = itemInfo.item.itemCode;
          selectedItemObj.itemName = itemInfo.item.itemName;
          // selectedItemObj.batchNo = this.itemDetails[rowIndex]['batchNo'] ? this.itemDetails[rowIndex]['batchNo'] : (this.itemTransactionData.batchNo ?? 0);
          // selectedItemObj.batchNo = this.itemDetails[rowIndex]['batchNo'] 
          // ? this.itemDetails[rowIndex]['batchNo'] 
          // : (this.itemTransactionData.batchNo ?? 0);
          selectedItemObj.batchNo = "";
          this.fetchBatchNoPopup(itemInfo.item.id).subscribe((batchNoOptions:any) => {
            selectedItemObj.batchNoPopup = batchNoOptions;
            selectedItemObj.batchNo = selectedItemObj.batchNoPopup[0]?.batchNo;
          });
          selectedItemObj.unit = firstUnit;
          selectedItemObj.unitsPopup = unitInfoOptions;
          selectedItemObj.qty =  0.0000;
          selectedItemObj.focQty =  0.0000;
          selectedItemObj.rate = firstUnit.purchaseRate;
          if(this.showRateWithTax == 1 && firstUnit.mrp){
            selectedItemObj.printedMRP = firstUnit.mrp;
          }          
          selectedItemObj.grossAmt = 0.0000;
          selectedItemObj.discountPerc = 0.0000;
          selectedItemObj.discount = 0.0000;
          selectedItemObj.amount = 0.0000;
          selectedItemObj.taxPerc = itemInfo.item.taxPerc ? itemInfo.item.taxPerc : 0.0000,
          selectedItemObj.taxValue = 0.0000;
          selectedItemObj.total = 0.0000;
          selectedItemObj.expiryDate = null;
          selectedItemObj.stockItem = '';
          selectedItemObj.stockItemId = 0;//itemInfo.item.stock;
          selectedItemObj.taxAccountId = itemInfo.item.taxAccountID;
          selectedItemObj.priceCategoryOptions = priceCategoryOptions;
          selectedItemObj.remarks = itemInfo.item.remarks;

          if (itemInfo.expiryItem.isExpiry) {
            selectedxpireItemObj = {
              id: itemInfo.item.id,
              itemCode: itemInfo.item.itemCode,
              itemName: itemInfo.item.itemName,
              manufactureDate: null,
              expiryDate: itemInfo.item.expiryDate,
              expiryPeriod: itemInfo.expiryItem.expiryPeriod,
              gridIndex: rowIndex
            }
          }
        }
      });
      this.itemDetails[rowIndex] = selectedItemObj;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];

      console.log("check itemcode for taxacc="+JSON.stringify(this.itemDetails,null,2))

      //calculate itemgrid totals ..
      //this.calculateItemAmount(rowIndex);
      if (Object.keys(selectedxpireItemObj).length != 0) {
        this.expireItemDetails.push(selectedxpireItemObj);
        this.copyExpireItemDetails = [...this.expireItemDetails];
      }

      //adding new rowon item grid when item selected...
      this.addRow(true);

      if (selectedItemObj.rate == 0) {
        this.dialog.open(CustomDialogueComponent, {
          width: '300px',
          height: '200px',
          data: { 
            message: "Rate is zero" ,
            key:"custom" 
          }
        });
      }

      //find batch no column and its' index...
      const batchNoIndex = this.tablecolumns.findIndex(column => column.name === 'BatchNo');
      this.currentColIndex = batchNoIndex -1;
      this.gridnavigationService.focusCell(this.gridCells.toArray(),this.currentRowIndex, this.currentColIndex);  
      this.setMaxHeight();  
    }

  }

 

  fetchBatchNoPopup(itemId: any): Observable<any> {
    let warehouseId = this.PurchaseEnquiryForm.get('warehouse')?.value;
    return this.purchaseenqservice
      .getDetails(EndpointConstant.FETCHBATCHNOFORSALES + warehouseId + '&ItemID=' + itemId)
      .pipe(
        takeUntil(this.destroySubscription),
        map(response => response.data) // Extract the data here
      );
  }
  

  onStockItemSelected(option: any, rowIndex: number) {
    if(option != ""){
      this.itemDetails[rowIndex]['stockItem'] = option;
      let stockitem = this.stockItemObj.find((stock: any) => stock.itemname == option);
      this.itemDetails[rowIndex]['stockItemId'] = stockitem?.id;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
    }
  }

  onSizemasterSelected(option: any, rowIndex: number) {
    let sizemaster = this.sizeMasterObj.find((sizemaster: any) => sizemaster.name == option);
    this.itemDetails[rowIndex]['sizeMaster'] = sizemaster;
  }

  onPriceCategorySelected(option: any, rowIndex: number) {
    let itemPriceCategory = this.itemDetails[rowIndex]['priceCategoryOptions'];
    let priceCategoryObj = itemPriceCategory.find((pricecategory: any) => pricecategory.pricecategory === option)
    this.itemDetails[rowIndex]['priceCategory'] = {
      "id":priceCategoryObj?.id,
      "name":priceCategoryObj?.pricecategory,
      "code":priceCategoryObj?.perc.toString(),
      "description":priceCategoryObj?.rate
    };
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
  }
  
  onChangeBatchNo(rowIndex: any, event: any) {
    let batchno = event.target.value;
    this.itemDetails[rowIndex]['batchNo'] = batchno;
  }

  onChangeQuantity(rowIndex: any, event: any) {
    console.log("onchangeqty")
    // Assuming row contains the rate value
    const rate = this.itemDetails[rowIndex]['rate'];
    let qty = event.target.value;
    this.itemDetails[rowIndex]['qty'] = Number(qty);
    this.calculateItemAmount(rowIndex);
  }

  onChangeRateWithTax(rowIndex: any, event: any) {
    let ratewithTax = event.target.value;
    let taxPerc = this.itemDetails[rowIndex]['taxPerc'];
    let calRate = this.baseService.formatInput(ratewithTax/((taxPerc/100)+1));  
    this.itemDetails[rowIndex]['rate'] = calRate;
    this.itemDetails[rowIndex]['printedMRP'] = ratewithTax;
    this.calculateItemAmount(rowIndex);
  }

  onMouseLeaveQty(rowIndex: any, event: any) {
    const rate = this.itemDetails[rowIndex]['rate'];
    if(rate == 0){
      this.dialog.open(CustomDialogueComponent, {
        width: '300px',
        height: '200px',
        data: { 
          message: "Rate is zero",
          key:"custom" 
        }
      });
    }
  }

  onChangeFocQuantity(rowIndex: any, event: any) {
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

  onRateBlur(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    let rate = event.target.value;
    let itemRate = 0;
    this.fillItemsData.forEach((item: any) => {
      if (item.item.id == this.itemDetails[rowIndex]['itemId']) {
        itemRate = item.unitPopup[0].purchaseRate;
      }
    });
    if (itemRate != 0 && rate != itemRate) {
      if (rate < itemRate) {
        if (confirm('Do you want to reduce price?')) {
          this.showPricePopup = true;

          //call api to get units details ...
          this.setUpdateUnitDetails(rowIndex);
        }
      } else {
        if (confirm('Do you want to update price?')) {
          this.showPricePopup = true;
          this.setUpdateUnitDetails(rowIndex);
        }
      }

    }
  }

  setUpdateUnitDetails(rowIndex: any) {
    this.currentItemUnitDetails = [];
    let itemId = this.itemDetails[rowIndex]['itemId'];
    this.fillItemsData.forEach((item: any) => {
      if (item.item.id == this.itemDetails[rowIndex]['itemId']) {
        let rateDetails = item.updatePrice;
        rateDetails.forEach((rate: any) => {
          if(rate.itemID == itemId){
            this.currentItemUnitDetails.push(rate);
          }
        });
        
        this.currentItemUnitDetails = [...this.currentItemUnitDetails];
        this.currentItemId = itemId;
      }
    });
  }

  onChangeGrossAmount(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const qty = this.itemDetails[rowIndex]['qty'];
    let grossAmount = event.target.value;
    let rate = grossAmount / qty;
    this.itemDetails[rowIndex]['rate'] = rate;
    this.calculateItemAmount(rowIndex);
  }

  onChangeDiscountPercent(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const grossAmount = this.itemDetails[rowIndex]['grossAmt'];
    let discountPercent = Number(event.target.value);
    discountPercent = this.baseService.formatInput(discountPercent);
    let discountValue = (grossAmount * discountPercent) / 100;
    this.itemDetails[rowIndex]['discountPerc'] = discountPercent;
    this.itemDetails[rowIndex]['discount'] = discountValue;
    this.calculateItemAmount(rowIndex);
  }

  onChangeDiscount(rowIndex: any, event: any) {
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
    this.PurchaseEnquiryForm.patchValue({
      "discountamount":total
    });
  }

  calculateAmountTotal() {
    let total = 0.0000;
    this.itemDetails.forEach(function (item) {
      total = total + Number(item.amount);
    });
    this.amountTotal = this.baseService.formatInput(total);
    this.PurchaseEnquiryForm.patchValue({
      "netamount" : this.amountTotal
      
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
    if (this.autoroundoffEnabled && !manualroundoff) {
        this.calculateAutoroundoff(calculatedGrandTotal);
    }

    // Add round-off value to grand total
    let grandTotalValue = calculatedGrandTotal + Number(this.roundValue);
    // Format grand total for display
    this.grandTotal = this.baseService.formatInput(Number(grandTotalValue));

    // If advancePayableAmount is zero, set it to the formatted grand total
    if (this.advancePayableAmount == 0) {
        this.advancePayableAmount = grandTotalValue; // Store the number
    }

    // Calculate balance and paid amount
    //this.calculateBalanceAndPaidAmount();

    // Update form control with formatted grand total for display
    this.PurchaseEnquiryForm.patchValue({
        "grandtotal": this.grandTotal
    });
}
advancePayableAmount = 0.00;

  calculateAutoroundoff(oldgrandtotal: number) {
    this.roundValue = Number(Math.round(oldgrandtotal) - oldgrandtotal);
    this.roundValue =  this.baseService.formatInput(this.roundValue);
    this.PurchaseEnquiryForm.patchValue({
      "roundoff": this.roundValue
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

    console.log("check for taxacc="+JSON.stringify(this.itemDetails,null,2))
    //change tax value obj ...
    if (taxValue && taxValue != oldTaxValue && 942) {    //here taxaccountId is passed as 942 because in itemfill in purchase with voucherid=17 only fet taxaccid or in other cases its become null

      console.log("filltaxdetinpopup=")
      //set tax popup details...
      this.FillTaxAccount(942, oldTaxValue, rowIndex);
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


  onChangeTaxType(): void {
    const selectedTaxTypeId = this.PurchaseEnquiryForm.get('taxtype')?.value;
    const selectedTaxTypeName = this.allTaxTypes.find(taxtype => taxtype.id === selectedTaxTypeId)?.name;
    this.selectedTaxTypeObj = { id: selectedTaxTypeId, name: selectedTaxTypeName || '' };
  }

  onParentItemSelected(option: string): any {
    let selectedParentItem: any = {};
    this.PurchaseEnquiryForm.patchValue({
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
    const selectedQualityId = this.PurchaseEnquiryForm.get('quality')?.value;
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
      this.PurchaseEnquiryForm.get('invaccount')?.enable();
      this.PurchaseEnquiryForm.get('salesaccount')?.enable();
      this.PurchaseEnquiryForm.get('costaccount')?.enable();
      this.PurchaseEnquiryForm.get('purchaseaccount')?.enable();
    } else {
      this.PurchaseEnquiryForm.get('invaccount')?.disable();
      this.PurchaseEnquiryForm.get('salesaccount')?.disable();
      this.PurchaseEnquiryForm.get('costaccount')?.disable();
      this.PurchaseEnquiryForm.get('purchaseaccount')?.disable();
    }
  }

  changeRatesInGrid(factor: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['purchaseRate'] = (this.itemUnitDetails[0]['purchaseRate']) * factor;
    this.itemUnitDetails[rowIndex]['sellingPrice'] = (this.itemUnitDetails[0]['sellingPrice']) * factor;
    this.itemUnitDetails[rowIndex]['mrp'] = (this.itemUnitDetails[0]['mrp']) * factor;
  }

  

  onChangePartyInvNo(event:any){
    let partyinvNo = event.target.value;
    this.additionalDetailsForm.patchValue({
      "invoiceno":partyinvNo
    });
  }

  onChangePartyInvDate(event:any){
    let partyinvDate = event.target.value;
    this.additionalDetailsForm.patchValue({
      "invoicedate":partyinvDate
    });
  }

  translateItemName() {
    let itemName = this.PurchaseEnquiryForm.get('itemname')?.value;


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



  openImportReferencePopup() {    
    this.importedReferenceList = [];
    this.isReferenceImported = false;
    this.currentSalesEstimateInfo = [];
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showImportReferencePopup = true;
  }

  saveReferenceData(response:any){
    //push reference list array...
    this.referenceListarray = response?.referenceList;
    if (Object.keys(response).length > 0) {
      if(response?.referenceVNoList.length > 0){
        let refText = response?.referenceVNoList.join(', ');      
        this.PurchaseEnquiryForm.patchValue({
          "reference":refText
        });
      }
      
      //set item details to grid..
      //check item already exists..
      if(response?.itemListArray.length > 0){
        if(this.itemDetails.length == 1 && this.itemDetails[0].itemCode == ""){
          this.itemDetails = [];
        }
        this.importedReferenceList = response?.itemListArray;
        // overwrite form details only if overwritevoucher info is true..
        if(response?.isOverwriteVoucher){
          this.currentSalesEstimateInfo = this.importedReferenceList[this.importedReferenceList.length - 1];
          //setting form data is overwrite option is true..
          let transactionId = this.currentSalesEstimateInfo.TransactionID;
          this.fetchTransactionDetailsById(transactionId);
        } else{
          this.setItemDetailsFromImportReference();
        }   
      }      
    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showImportReferencePopup = false;
  }

  fetchTransactionDetailsById(transactionId: number){
    this.purchaseenqservice
      .getDetails(EndpointConstant.FILLTRANSACTIONDETAILSBYID + transactionId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let result = response?.data;
          //set transaction details....
          let transactionDetails = result.transactionData[0];
          this.PurchaseEnquiryForm.patchValue({
            supplier:transactionDetails.AccountCode,
            description:transactionDetails.commonNarration,
            project:transactionDetails.CostCentreID
          });
          this.updatedSupplier = transactionDetails.AccountName;
          this.selectedPartyId = transactionDetails.AccountCode; 
          this.updatedProject = transactionDetails.ProjectName;
          this.onSupplierSelected(Number(transactionDetails.AccountID));
          //set transaction additional details....
          let transactionAddditional = result.additionalData?.[0];
          this.PurchaseEnquiryForm.patchValue({
            warehouse:transactionAddditional.inLocId,
            vatno:transactionAddditional.vatno,
            partyinvoiceno:transactionAddditional.entryNo,
            partyinvoicedate:transactionAddditional.entryDate,
            terms:transactionAddditional.terms,
            paytype:transactionAddditional.modeID,
            duedate:transactionAddditional.dueDate ? new Date(transactionAddditional.dueDate) : null
          });
          this.updatedSalesman = this.currentSalesEstimateInfo.StaffName;
          this.onChangeWarehouse();
          
          //set additional details in popup...
          transactionAddditional.lcApplnTransID = transactionAddditional.lcapplnTransId;
          this.setAdditionalDetailsFromFill(transactionAddditional);

          //set expenses...
          let transactionExpenses = result.expenses;
          if(transactionExpenses){
            let totalAddCharges = 0.00;
            transactionExpenses.forEach((expense:any) => {
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
            this.PurchaseEnquiryForm.patchValue({
              "addcharges":this.baseService.formatInput(this.totalAdditioanalCharges)
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

  saveAdditionalCharges(response:any){
    this.totalAdditioanalCharges = response?.totalamount;
    if (Object.keys(response).length > 0) {
      this.PurchaseEnquiryForm.patchValue({
        "addcharges":this.totalAdditioanalCharges
      });
      this.additonalChargesGridDetails = response?.gridDetails;

      this.calculateGrandTotal();
    }
    this.renderer.removeStyle(document.body, 'overflow');
    this.showAdditionalChargesPopup = false;
  } 

  //open the popup while click on dots...
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

  

  onChangeWarehouse() {
    const warehouseId = this.PurchaseEnquiryForm.get('warehouse')?.value;
    const customerId = this.PurchaseEnquiryForm.get('supplier')?.value;

    if (warehouseId && customerId) {
      this.fetchItemFillData();
    }
  }
 
  validateItemGridEntry() {
    const warehouseId = this.PurchaseEnquiryForm.get('warehouse')?.value;
    const customerId = this.PurchaseEnquiryForm.get('supplier')?.value;
    if (!warehouseId) {
      alert('Please select location');
      return false;
    }

    if (!customerId) {
      alert('Please select Party');
      return false;
    }
    return true;
  }

  onClickAddItem() {
    if (this.validateItemGridEntry()) {
      this.addRow(true);
    }
  }
  addRow(itemcodesel = false,event?: KeyboardEvent) {
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
    if(!itemcodesel){
      //set row and column index....
      this.currentRowIndex++;
      this.currentColIndex = 0; 
      this.scrollToCell(this.currentRowIndex,this.currentColIndex);// Reset column index to 0 for the new row
    }   
     // Increase table height dynamically, assuming rowHeight = 50px
     this.tableHeight = Math.max(200, this.itemDetails.length * 30 + 60); // Header and footer height = 100px

    return true;
  }

  navigateToItemPage(itemId: number) {
    const urlTree = this.router.createUrlTree(['/inventory/masters/itemmaster'], { queryParams: { pageId:this.itemmasterPageId,itemid: itemId } });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  changeGrossAmountEditable(event: any) {
    this.isgrossAmountEditable = event.target.checked ? true : false;
  }

  onChangeCommonDiscountPercent(event:any){
    let commondiscountpercent = Number(event.target.value);
    this.commonDiscountPercent = this.baseService.formatInput(commondiscountpercent);
    this.setCommonDiscountPercent(this.commonDiscountPercent);
   
  }

  setCommonDiscountPercent(commondiscountpercent:any){
    this.PurchaseEnquiryForm.patchValue({
      totaldiscpercent: commondiscountpercent
    });
    this.itemDetails.forEach((item,index) => {
      item.discountPerc = commondiscountpercent;
      this.calculateItemAmount(index);
    });
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
  }

  onChangeCommonDiscountAmount(event:any){
    let commondiscountamount = event.target.value;
    this.setCommonDiscountAmount(commondiscountamount);
  }

  setCommonDiscountAmount(discountAmount:any){
    this.PurchaseEnquiryForm.patchValue({
      discountamount: discountAmount
    });
    this.commonDiscountAmount = discountAmount;
    this.commonDiscountPercent = (discountAmount*100)/this.grossAmountTotal;
    this.commonDiscountPercent = this.baseService.formatInput(this.commonDiscountPercent);
    this.setCommonDiscountPercent(this.commonDiscountPercent);
  }

  

  onClickRoundOff(){
    this.roundValue = Number(this.PurchaseEnquiryForm.get('roundoff')?.value);
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
      //alert('Invalid Date');
    }
  }

  convertAmount(amount: any): number {
    return Number(amount?.toString().replace(/,/g, '') || 0);
  }

  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }

  onSelectLeftTable(event:any) {
  }
  

  onRowSelect(row:any) {
    this.selected = [row];
  }

  deleteItemGrid(index: any) {
    if (confirm("Are you sure you want to delete this details?")) {
      if ( this.itemDetails.length == 1) {
        this.noGridItem = true;
        this.itemDetails = [];
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
    return true;
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

  onItemUnitSelected(option: any, rowIndex: any) {console.log(option);
    let unitPopup = this.itemDetails[rowIndex]['unitsPopup'];
    let unitObj = unitPopup.find((unit: any) => unit.unit === option)
    this.itemDetails[rowIndex]['unit'] = unitObj;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
  }

  onItemBatchNoSelected(option: any, rowIndex: any) {
    console.log(option);
    this.itemDetails[rowIndex]['batchNo'] = option;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
  }

  //on clicking button navigate to supplier page by loading selected supplier. if no supplier selected created one . 
  onClickCustomer(){
    let url = "/general/customer-supplier";
    let customerSupplierId = 0;
    if(this.selectedPartyId){
      this.supplierData.forEach((element:any) => {
        if(element.id == this.selectedPartyId){
          customerSupplierId = element.partyId;
        }
      });
    }
    const baseUrl = window.location.origin; 
    const relativeUrl = this.router.serializeUrl(
      this.router.createUrlTree([url], { queryParams: { pageId: this.customerSupplierPageId ,partyId:customerSupplierId} })
    );
    const fullUrl = `${baseUrl}${relativeUrl}`;

    window.open(fullUrl, '_blank');
  }

  onChangeCustomerInStorage(event: StorageEvent) {
    if (event.key === 'customerSaved') {
      // Refresh data
      this.fetchSupplier();
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
        event.preventDefault();
        this.gridnavigationService.handleNavigationKey(this.tablecolumns, this.tempItemFillDetails, this.focusGridCell.bind(this), this.addRow.bind(this));
        break;
    }
  }

  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
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
  onClickSpan(event:any, rowIndex: number, colIndex: number): void {
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

  handleDoubleClick(event:any){
    if(this.currentColumname != 'id' && this.currentColumname != 'itemname' && this.currentColumname != 'amount' && this.currentColumname != 'taxperc' && this.currentColumname != 'taxvalue' && this.currentColumname != 'total'){
      this.enableInlineEditing  = true;
    }    
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
  }




  onKeyDown(event: KeyboardEvent) {
    //handle CTl+Alt+m key .
    if (event.altKey && event.ctrlKey && event.key === 'm') {
      event.preventDefault();
      this.toggleLeftSection();
    }
    
    if (event.ctrlKey && event.key === 'Enter') {
      // Logic for Ctrl+Enter
      if (this.currentRowIndex < this.tempItemFillDetails.length - 1) {
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
          if (this.currentRowIndex < this.tempItemFillDetails.length - 1) {
            this.currentRowIndex++;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }          
          // this.gridnavigationService.moveToNextRow(this.tempItemFillDetails, this.focusGridCell.bind(this));
        }
         break;
       

      case 'ArrowUp':
        if(this.enableInlineEditing == false){
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
        if(cursorPosition == 0){
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
          if(this.tempItemFillDetails.length > 1){
            let index = this.tempItemFillDetails.length - 2;
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
          //enter functionality if current column is qty...
          if(currentCoulmn.field == 'qty'){
            // check qty is Zero if yes move to those columns else move to next code ...
            if(this.tempItemFillDetails[this.currentRowIndex]['rate'] == 0){
              //show rate alert...
              this.onMouseLeaveQty(this.currentRowIndex,Event);
            }
          }

        } else {
          if (this.currentRowIndex < this.tempItemFillDetails.length - 1) {
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
          this.moveFocusToDropdown('supplier'); // Move focus to the supplier input or other logic
        } else {
          event.preventDefault();         
          this.enableInlineEditing = false; 
          //checking if column name is before qty then move to qty else move to next row 
          if(this.currentColumname == 'itemcode' || this.currentColumname == 'itemname' 
            || this.currentColumname == 'stockitem' || this.currentColumname == 'batchno' 
            || this.currentColumname == 'unit'){
              this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'qty');
              this.scrollToCell(this.currentRowIndex,this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
          }
          let currentCoulmn = this.tablecolumns[this.currentColIndex];
          //tab functionality if current column is item code...
          if(currentCoulmn.field == 'itemcode'){
            // check rate and qty is Zero if yes move to those columns else move to next code ...
            if(this.tempItemFillDetails[this.currentRowIndex]['qty'] == 0){
              this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'qty');
              this.scrollToCell(this.currentRowIndex,this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
            } else if(this.tempItemFillDetails[this.currentRowIndex]['rate'] == 0){
              this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'rate');
              this.scrollToCell(this.currentRowIndex,this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
            } 
          }
          //tab functionality if current column is qty...
          if(currentCoulmn.field == 'qty'){
            // check qty is Zero if yes move to those columns else move to next code ...
            if(this.tempItemFillDetails[this.currentRowIndex]['rate'] == 0){
              //show rate alert...
              this.onMouseLeaveQty(this.currentRowIndex,Event);
              this.currentColIndex = this.tablecolumns.findIndex(col => col.field === 'rate');
              this.scrollToCell(this.currentRowIndex,this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
            } 
          }

          if (this.currentRowIndex < this.tempItemFillDetails.length - 1) {
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
          if(columnName == 'itemcode' || columnName == 'stockitem' || columnName == 'unit' || columnName == 'pricecategory' || columnName == 'sizemasterid' ){
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
            if(columnName != null){
              this.currentColumname = columnName;
            }
            if(this.enableInlineEditing == false && this.isPartySelected && (columnName != 'id' &&columnName != 'itemname' && columnName != 'amount' && columnName != 'taxperc' && columnName != 'taxvalue' && columnName != 'total'
              && ((columnName === 'grossamount' && this.isgrossAmountEditable) || (columnName !== 'grossamount')))){
              this.enableInlineEditing = true;
              setTimeout(() => {
                const cellElement = document.getElementById(cellId);
                this.prevColumnValue = "";
                let newValue = event.key;
                // Check if the key is a character key
                const isCharacterKey = event.key.length === 1;
                if ((cellElement instanceof HTMLInputElement || cellElement instanceof HTMLTextAreaElement) && isCharacterKey) {
                  // If it's an input or textarea, set the value
                  cellElement.value = newValue;
                  if(this.currentColumname == 'itemcode'){
                    this.prevColumnValue = this.itemDetails[this.currentRowIndex]['itemCode'];
                  }
                  if(this.currentColumname == 'stockitem'){
                    this.prevColumnValue = this.itemDetails[this.currentRowIndex]['stockItem'];
                  }
                  if (columnKeyName !== null && columnKeyName !== undefined) {
                    if(columnName == 'unit'){
                      this.prevColumnValue = this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['unit'];
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['unit'] = event.key;
                    } else if(columnName == 'pricecategory'){
                      this.prevColumnValue = this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'];
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    } else if(columnName == 'sizemasterid'){
                      if(this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name']){
                        this.prevColumnValue = this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'];
                      } 
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    } else{
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

  scrollToCell(rowIndex: number, colIndex: number): void {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  moveFocusToDropdown(fieldName:any): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.focusInput();
    }
  }

  callKeydownEventToDropdown(fieldName:any,event:KeyboardEvent): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.onKeyDown(event);
    }
  }
  @ViewChild('gridInput', { static: false }) gridInput!: ElementRef;
  @ViewChild('itemcodesummarycell', { static: true }) itemcodesummarycell!: TemplateRef<any>;
  @ViewChild('qtysummarycell', { static: true }) qtysummarycell!: TemplateRef<any>;
  @ViewChild('focqtysummarycell', { static: true }) focqtysummarycell!: TemplateRef<any>;
  @ViewChild('defaultSummaryCell', { static: true }) defaultSummaryCell!: TemplateRef<any>;
  @ViewChild('tableSummary', { static: true }) tableSummary!: ElementRef;
  selectedTab = 1;
  showCommonPayment = true;
  showAdditionalPayment = false;
  selectedDetailTab = 1;
  showItemDetailsTab = true;
  showAdditionalDetailsTab = false;

  tableHeight = 200; 

  @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;
  
  defaultCustomer = 0;
  defaultQtySetting:any = "";
  prevPayType:number = 0;
  showRateWithTax:any = false;
  private subscription!: Subscription;
  selectedItemRemarks:any = "";
  showRemarksPopup:boolean = false;
  showItemRatePopup:boolean = false;
  prevTransactionData:any = [];
  itemRateItemName:any = "";
  showItemSearchPopup:boolean = false;
  itemSearchCode:any = "";
  itemSearchName:any = "";
  itemSearchPopupOptions:any = [];
  showPriceCategoryPopup:boolean = false;
  priceCategoryOptions:any = [];

 // Listen to the keydown event at the window level
 @HostListener('window:keydown', ['$event'])
  onBodyKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey && (event.key === 'p' || event.key === 'P')) {
      event.preventDefault();  // Prevent the default print behavior
      if(this.selectedPurEnqId == 0 && !this.isInputDisabled){
        if(this.balanceAmount > 0){
          this.openDialog();
        } else{
          alert('Amount must be greater than zero');
        }
      } else if(this.selectedPurEnqId > 0 && !this.isInputDisabled){
        this.activePrintOption = true;
        this.onClickSavePurchaseEnq();
      }     
    } else if(event.key == 'F1'){
      event.preventDefault();  // Prevent browser help page from opening
      this.toggleMaximize();
    } else if (event.key === 'F2') {
      event.preventDefault();
      if(!this.isEditBtnDisabled){
        this.onClickEditPurchaseEnq();
      }      
    } else if(event.key == 'F5'){
      event.preventDefault();
      if(this.currentRowIndex >= 0){
        //show popup only when itemcode is not empty...
        if(this.itemDetails[this.currentRowIndex]['itemCode']){
          this.itemSearchCode = this.itemDetails[this.currentRowIndex]['itemCode'];
          this.itemSearchName = this.itemDetails[this.currentRowIndex]['itemName'];
          this.setOptionsForItemSearchPopup();
          this.showItemSearchPopup = true;
        }
      }
    } else if (event.key === 'F6') {
      event.preventDefault();
      if((this.isEditBtnDisabled && !this.isInputDisabled ) || (!this.isEditBtnDisabled && this.isInputDisabled )){
        this.onClickNewPurchaseEnq();
      }      
    } else if (event.key === 'F7') {
      event.preventDefault();
      if(!this.isInputDisabled){
        this.onClickSavePurchaseEnq();
      }      
    } else if (event.key === 'F8') {
      event.preventDefault();
           
    } else if (event.key === 'F9') {
      event.preventDefault();
      if(!this.isDeleteBtnDisabled){
        this.onClickDeletePurchaseEnq(event);
      }      
    } else if (event.altKey && event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      if(this.currentRowIndex >= 0){
        if(this.itemDetails[this.currentRowIndex]['itemCode']){
          //show popup for price category....

           let id = this.itemDetails[this.currentRowIndex]['itemId'];
           let unit = this.itemDetails[this.currentRowIndex]['unit']['unit'];
          this.showPriceCategoryPopup = true;
          this.setPriceCategoryPopupData(id,unit);  
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
      //this.changePayTypeToCash();
    } else if (event.altKey && event.ctrlKey && event.key === 'd') {
      event.preventDefault();
      //this.changePayTypeToCredit();
    } else if (event.altKey && event.ctrlKey && event.key === 'u') {
      event.preventDefault();
      if(this.currentRowIndex >= 0){
        if(this.itemDetails[this.currentRowIndex]['itemCode']){
          this.selectedItemRemarks = this.itemDetails[this.currentRowIndex]['remarks'];
          this.showRemarksPopup = true;
        }
      }
    } else if (event.altKey && event.ctrlKey && event.key === 'j') {
      event.preventDefault();
      if(this.currentRowIndex >= 0){
        if(this.itemDetails[this.currentRowIndex]['itemCode']){
          let itemCode = this.itemDetails[this.currentRowIndex]['itemCode'];
          this.itemRateItemName = this.itemDetails[this.currentRowIndex]['itemName']
          this.getItemRatePopupDetails(itemCode);
          this.showItemRatePopup = true;
        }
      }
    } else if (event.key === 'F10') {
      event.preventDefault();
      this.onClickPrint();    
    }  else if (event.key === 'F11') {
      event.preventDefault();
      this.onClickPreview();     
    } else if (event.altKey ){

    } else if (event.ctrlKey ){
      
    }
  }

  onFormKeyDown(event: KeyboardEvent,index:number): void {
    if(event.key == 'Enter'){
      event.preventDefault(); 
      if(index == -1){
        this.moveFocusToItemGrid();
      } else{
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
        if(result == 'Card'){
          //this.setDefaultAmounttoCard();
          this.activePrintOption = true;
          this.onClickSavePurchaseEnq();
        } else if(result == 'Cash'){
          //this.setDefaultAmounttoCash();
          this.activePrintOption = true;
          this.onClickSavePurchaseEnq();
        }
      }
    });
  }

  showPrintConfirmBox(){
    confirm('Do you want to print?');
  }

  
  openSelectedItemUnitPopup(){    
    if(this.itemDetails[this.currentRowIndex] && this.itemDetails[this.currentRowIndex]['unitsPopup'] ){
      this.enableInlineEditing = false;
      let unitColumnIndex = this.tablecolumns.findIndex(col => col.field === 'unit');
      console.log(unitColumnIndex);
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



  getSummaryTemplate(columnName: string): TemplateRef<any>{
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

  onClickTab(tabId:any): void {    
    this.selectedTab = tabId;
    if(tabId == 1){ 
      this.showCommonPayment = true;
      this.showAdditionalPayment = false;
    } else if(tabId == 2){
      this.showAdditionalPayment = true;
      this.showCommonPayment = false;
    } else{

    }
  }

  onClickDetailsTab(tabId:any): void {    
    this.selectedDetailTab = tabId;
    if(tabId == 1){ 
      this.showItemDetailsTab = true;
      this.showAdditionalDetailsTab = false;
    } else if(tabId == 2){
      this.showAdditionalDetailsTab = true;
      this.showItemDetailsTab = false;
    } else{

    }
  }  
  currentItemTableIndex: number | null = null;
  isPartySelected:boolean = false;
  private storageEventHandlerSales!: (event: StorageEvent) => void;
  
  settings:any;
  grossAmountEditSettings = false;
  isgrossAmountEditable = false;
  autoroundoffEnabled = false;
  itemExpiryManagement = false;
  showStockItemField = false;
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname:any = "";
  //set datatable columns
  commonFillData:any = [];
  formVoucherNo:any = 0;
  userTyping:any = false;
  activePrintOption = false;
  currentSalesEstimateInfo:any = [];
  active = true;   //items
  stockitem = true;
  isUnitsOpen = false;
  isOtherDetailsOpen = false; 
  expiryitem = true;
  allTaxTypes = [] as Array<TaxType>;
  selectedTaxTypeObj: any = {};
  selectedParentItemObj: any = {};
  selectedParentItemName: string = "";
  parentItemOptions: any = [];
  allParentItems = [] as Array<parentItem>;
  selectedBranches: { id: number, company: string, nature: string }[] = [];
  selectedBranchId: number = 0;
  filledBranchId: number = 0;
  stockToDisplay: number = 0;
  allItemHistoryDetails = [] as Array<ItemHistory>;
  showItemAdditionalChargesPopup = false;
  showAdditionalChargesPopup = false;
  selectedRowIndex:any = -1;
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
        this.scrollToCell(this.currentRowIndex,this.currentColIndex);
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

    // Start observing the target div
    // observer.observe(this.targetDiv.nativeElement);
  
  }
  showBottomBar: boolean = false;
  scrollToTop() {
    const scrollDuration = 600; // Duration in milliseconds
  const startPosition = this.scrollContainer.nativeElement.scrollTop;
  const startTime = performance.now();

  const scrollStep = (timestamp:any) => {
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

  const scrollStep = (timestamp:any) => {
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

  toggleLeftSection(){
    this.showLeftSection = !this.showLeftSection;
    // Trigger the recalculation on window resize
    setTimeout(() => this.ngxTable.recalculate(), 0);
    setTimeout(() => this.setSummaryCellWidths(), 0);
  }

  toggleActive(): void {
    this.istoggleActive = !this.istoggleActive;
  }

  openBarcodePopup(){
    const dialogRef = this.dialog.open(CustomDialogueComponent,
      {
        width: '400px',
        height: '200px',
        data: { 
         key:"barcode" 
        }
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

  checkBarcodeFromItems(barcode:any){
    const foundItem = this.fillItemDataOptions.find(item => item.barCode === barcode);
    //check if item exists in tempItemFillDetails...
    if(foundItem!= null){
      const foundItemDet = this.tempItemFillDetails.find((item:any) => item.itemCode === foundItem?.itemCode);
      if (foundItemDet) {
        foundItemDet.qty = foundItemDet.qty == 0 ? + Number(foundItemDet.qty)+2 : Number(foundItemDet.qty)+1; // Ensures that qty is incremented, even if it's undefined
      } else {
        this.onItemCodeSelected( foundItem.itemCode,this.tempItemFillDetails.length-1)        
      }
    } else {
      this.dialog.open(CustomDialogueComponent, {
        width: '300px',
        height: '200px',
        data: { 
          message: "Invalid item" ,
          key:"custom" 
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

  getItemRatePopupDetails(itemCode:any){
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

  setOptionsForItemSearchPopup(){
    this.itemSearchPopupOptions = this.fillItemsData.map((itemInfo:any) => ({
      itemname: itemInfo.item.itemName,   
      itemcode: itemInfo.item.itemCode,   
      partno: itemInfo.item.partNo,      
      id: itemInfo.item.id              
    }));
  }

  onSelectRelatedItem(itemData:any){
    this.onItemCodeSelected(itemData.itemCode,this.currentRowIndex);
    this.closeItemSearchPopup();
  }

  onSelectPriceCategory(rateInfo:any){
    //set rate of current selected item with item selected from popup
    let rate = rateInfo.price;
    if(rate == 0){
      alert('Rate is zero');
    }
    this.itemDetails[this.currentRowIndex]['rate'] = rate;
    this.closePriceCategoryPopup();
  }

  setPriceCategoryPopupData(id:any,unit:any){
    this.purchaseenqservice
      .getDetails(EndpointConstant.FETCHPRICECATEGORYBYIDUNIT + id+'&Unit='+unit)
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
      console.log('Clicked outside the datatable');
      if(this.enableInlineEditing){
        if(this.currentColumname == 'itemcode'){
          let currentItemcode = this.tempItemFillDetails[this.currentRowIndex]['itemCode'];
          let validateItemcode = this.validateItemCode(currentItemcode);
          if(!validateItemcode){
            this.tempItemFillDetails[this.currentRowIndex]['itemCode'] = this.prevColumnValue;
            this.tempItemFillDetails = [...this.tempItemFillDetails];
            this.enableInlineEditing = false;
          }
        } else if(this.currentColumname == 'stockitem'){console.log(this.tempItemFillDetails[this.currentRowIndex]['stockItem']);
          let currentstockItem = this.tempItemFillDetails[this.currentRowIndex]['stockItem'];
          let validateStockItem = this.validateStockItem(currentstockItem);
          if(!validateStockItem){
            this.tempItemFillDetails[this.currentRowIndex]['stockItem'] = this.prevColumnValue;
            this.tempItemFillDetails = [...this.tempItemFillDetails];
            this.enableInlineEditing = false;
          }
        } else if(this.currentColumname == 'unit'){
          if(this.tempItemFillDetails[this.currentRowIndex]['unit']){
            let currentunit= this.tempItemFillDetails[this.currentRowIndex]['unit']['unit'];
            let validatUnit = this.validateUnitField(currentunit);
            if(!validatUnit){
              this.tempItemFillDetails[this.currentRowIndex]['unit']['unit'] = this.prevColumnValue;
              this.tempItemFillDetails = [...this.tempItemFillDetails];
            }
          }  
          this.enableInlineEditing = false;       
        } else if(this.currentColumname == 'pricecategory'){
          if(this.tempItemFillDetails[this.currentRowIndex]['priceCategory']){
            let currentpricecategory= this.tempItemFillDetails[this.currentRowIndex]['priceCategory']['name'];
            let validatPrice = this.validatePriceCategoryField(currentpricecategory);
            if(!validatPrice){
              this.tempItemFillDetails[this.currentRowIndex]['priceCategory']['name'] = this.prevColumnValue;
              this.tempItemFillDetails = [...this.tempItemFillDetails];
            }
          }  
          this.enableInlineEditing = false;       
        } else if(this.currentColumname == 'sizemasterid'){
          if(this.tempItemFillDetails[this.currentRowIndex]['sizeMaster']){
            let currentsizemaster= this.tempItemFillDetails[this.currentRowIndex]['sizeMaster']['name'];
            let validateSizemaster = this.validateSizemaster(currentsizemaster);
            if(!validateSizemaster){
              this.tempItemFillDetails[this.currentRowIndex]['sizeMaster']['name'] = this.prevColumnValue;
              this.tempItemFillDetails = [...this.tempItemFillDetails];
            }
          }  
          this.enableInlineEditing = false;       
        }
        
        
      }
      
      // Perform your desired actions here
    }
  }

  validateItemCode(inpItemCode:any){
    return this.fillItemDataOptions.some(option => option['itemCode'] == inpItemCode);    
  }
  
  validateStockItem(inpStockItem:any){
    return this.stockItemObj.some((option:any) => option['itemname'] == inpStockItem);    
  }

  validateUnitField(inpUnit:any){
   let unitPopup = this.itemDetails[this.currentRowIndex]['unitsPopup'];
   return unitPopup.some((option:any) => option['unit']['unit'] == inpUnit);   
  }

  validatePriceCategoryField(inpPrice:any){
    let itemPriceCategory = this.itemDetails[this.currentRowIndex]['priceCategoryOptions'];
    return itemPriceCategory.some((option:any) => option['pricecategory'] == inpPrice);   
  }

  validateSizemaster(inpSizemaster:any){
    return this.sizeMasterObj.some((option:any) => option['name'] == inpSizemaster);   
  }  

  @HostListener('window:resize')
  onWindowResize(): void {
    this.setMaxHeight();
  }
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('btngroup') btngroup!: ElementRef;
  @ViewChild('leftsearch') leftsearch!: ElementRef;
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
  }

  adjustOverlayHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0; // Adjust if you have a footer
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight;
    // //this.overlayElement.nativeElement.style.height = `${leftContentHeight}px`;
  }

  ngOnDestroy(): void {
    this.destroySubscription.next();
    this.destroySubscription.complete();
    window.removeEventListener('storage', this.storageEventHandlerSales);
    // Destroy DataTables when the component is destroyed
    // if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
    //   $(this.table.nativeElement).DataTable().destroy();
    // }
  }


  //trying to bring details in taxpopup from purchase

 
  onCategorySelected(option: string): any {
    this.PurchaseEnquiryForm.patchValue({
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

  selectedCategory = "";
  selectedCategoryObj = {};
  categoryOptions: any = [];
  allCategories = [] as Array<Category>;


  






}
