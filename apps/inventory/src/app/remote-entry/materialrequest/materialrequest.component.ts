import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, QueryList, Renderer2, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { BaseService, CustomDialogueComponent, EndpointConstant, GridNavigationService, MainHeaderComponent, MenuDataService, SearchableDropdownComponent, STATUS_MESSAGES } from '@dfinance-frontend/shared';
import { Account, Branches, Category, CountryOfOrigin, ItemBrand, ItemColor, ItemHistory, ItemMaster, ItemMasters, ItemUnitDetails, Quality, TaxType, UnitData, parentItem } from '../model/itemmaster.interface';
import { Subject, takeUntil } from 'rxjs';
import { DatatableComponent, id, SelectionType } from '@swimlane/ngx-datatable';
import { PurchaseService } from '../../services/purchase.service';
import { additonalChargesPopup, bankPopup, cardPopup, cashPopup, chequePopup, Currency, DeliveryLocation, GridSettings, ItemOptions, Items, itemTransaction, PayType, Projects, Purchase, Purchases, Reference, Salesman, SizeMaster, StockItems, Supplier, taxPopup, UnitPopup, UnitPricePopup, VehicleNo, VoucherType, Warehouse } from '../model/purchase.interface';
import { DatePipe, formatDate, formatNumber } from '@angular/common';
import {
  NativeDateAdapter, DateAdapter,
  MAT_DATE_FORMATS
} from '@angular/material/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { BalancedialogComponent } from '../purchase/balancedialog/balancedialog.component';
import { MaterialRequestService } from '../../services/materialrequest.service';
import { DropDown, DropDownName, materialrequest } from '../model/materialrequest.interface';
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
class PickDateAdapter extends NativeDateAdapter {
    override format(date: Date, displayFormat: Object): string {
      if (displayFormat === 'input') {
        return formatDate(date, 'dd/MM/yyyy', this.locale);
      } else {
        return date.toDateString();
      }
    }
  }

@Component({
    selector: 'dfinance-frontend-materialrequest',
    templateUrl: './materialrequest.component.html',
    styleUrls: ['./materialrequest.component.scss'],
  })

export class MaterialrequestComponent {
    @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;
  isMaximized = false;
  isLoading = false;

  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('gridInput', { static: false }) gridInput!: ElementRef;
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname:any = "";

  @ViewChild('btngroup') btngroup!: ElementRef;
  @ViewChild('leftsearch') leftsearch!: ElementRef;
  @ViewChild('bottomDiv') bottomDiv!: ElementRef;
  private storageEventHandler!: (event: StorageEvent) => void;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  isInputDisabled: boolean = true;
  materialRequestForm!: FormGroup;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  active = true;
  isUpdate: boolean = false;

  isMaterialCancelled = false;

  allMaterialList = [] as Array<Purchases>;
  tempMaterialList: any = [];
  selectedMaterialId!: number;
  firstMaterial!: number;

  SelectionType = SelectionType;

  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  @ViewChild('tableWrapper', { static: true }) tableWrapper!: ElementRef;
  @ViewChild('tableSummary', { static: true }) tableSummary!: ElementRef;
  @ViewChildren('summaryCell') summaryCells!: QueryList<ElementRef>;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  showTopBar: boolean = false;
  showBottomBar: boolean = false;
  showLeftSection:boolean = true;

    //set datatable columns
    enableInlineEditing:boolean = false;

   // Get a list of all SearchableDropdownComponent instances
   @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;
   activePrintOption = false;

  tableHeight = 200; 
  istoggleActive = false;

  pageId = 0;
  voucherId = 0;
  transId=0;

  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  //define settings for left side datatable...
  selectedleftrow:any = [];

  showDeleteOptions: boolean = false;

  today = new Date();

  selected: any[] = [];

  BranchData = [] as Array<DropDownName>
  mainBranchData = [] as Array<DropDown>;
  selectedmainBranchDataObj:any = {}
  subBranchData = [] as Array<DropDown>;
  selectedsubBranchDataObj:any = {}

  WarehouseData = [] as Array<Warehouse>;
  fromWarehouseData = [] as Array<DropDown>;
  selectedFromWarehouseObj:any = {}
  toWarehouseData = [] as Array<DropDown>;
  selectedToWarehouseObj:any = {}

  commonFillData:any = [];
  vocherName = "";
  formVoucherNo:any = 0;
  fillItemsData = [] as Array<Items>;

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
    "discount": 0,
    "discountPerc": 0,
    "amount": "",
    "taxValue": 0,
    "taxPerc": 0,
    "printedMRP": 0,
    "ptsRate": 0,
    "ptrRate": 0,
    "pcs": 0,
    "stockItemId": 0,
    "total": 0,
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
  itemTransactionData: any = {} as itemTransaction;
  itemUnitreturnField = 'unit';
  itemUnitKeys = ['Unit', 'Basic Unit', 'Factor'];

  isStockItem = true;
  itemUnitDetails = [] as Array<ItemUnitDetails>;
  itemDetails: any[] = [];
  tempItemFillDetails: any = [];
  showItemDetails = false;

  expireItemDetails: any[] = [];
  copyExpireItemDetails: any = [];

  currentItemTableIndex: number | null = null;
  tablecolumns = [
    { name: 'ID', field: 'id'},
    { name: 'Item Code', field: 'itemcode'},
    { name: 'Item Name', field: 'itemname' },
    //{ name: 'Stock Item', field: 'stockitem' },
    //{ name: 'BatchNo', field: 'batchno' },
    { name: 'Unit', field: 'unit' },
    { name: 'Qty', field: 'qty' },
   // { name: 'FOCQty', field: 'focqty' },
  // { name: 'Pricecategory', field: 'pricecategory' },
    { name: 'Rate', field: 'rate' },
    // { name: 'GrossAmt', field: 'grossamount' },
    // { name: 'Disc %', field: 'discperc' },
    // { name: 'Discount', field: 'discount' },
    { name: 'Amount', field: 'amount' },
    // { name: 'Tax %', field: 'taxperc' },
    // { name: 'TaxValue', field: 'taxvalue' },
    // { name: 'SizeMasterID', field: 'sizemasterid' },
    // { name: 'Total', field: 'total' },
    // { name: 'ExpiryDate', field: 'expirydate' },
  ];
  itemCodereturnField = 'itemCode';
  itemCodeKeys = ['Item Code', 'Item Name', 'Bar Code', 'ID', 'Unit', 'Stock', 'Rate', 'Purchase Rate'];
  itemCodeExcludekeys = ['unit'];
  fillItemDataOptions = [] as Array<ItemOptions>;

  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private renderer: Renderer2,
    private MaterialRequestService: MaterialRequestService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private baseService: BaseService,    
    private gridnavigationService: GridNavigationService,    
    private menudataService: MenuDataService,
    private dialog: MatDialog,
    private el: ElementRef
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
  if (queryParams && queryParams['voucherNo']) {
      this.voucherId = queryParams['voucherNo'];
    }
   
  }

  currentBranch = 0;
  currentItemId = 0;
  ngOnInit(): void {
    this.currentBranch = this.baseService.getLocalStorgeItem('current_branch') ? Number(this.baseService.getLocalStorgeItem('current_branch')) : 0;
    this.materialRequestForm=this.formBuilder.group({
      vouchername: [{ value: '', disabled: true }, Validators.required],
      voucherno: [{ value: '', disabled: this.isInputDisabled },Validators.required],
      voucherDate: [{ value: this.today, disabled: this.isInputDisabled }, Validators.required],
      mainBranch: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      subBranch: [{ value: '',disabled:true }, Validators.required],
      fromWarehouse: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      toWarehouse: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      description: [{ value: '', disabled: this.isInputDisabled }],
      terms: [{ value: '', disabled: this.isInputDisabled }],
    });
    this.materialRequestForm.controls["subBranch"].disable();
    this.fetchAllMaterialRequest();

this.fetchCommonFillData();
this.onClickNewMaterialRequest();
this.fetchItemTransactionData();
this.fetchGridSettingsByPageId();
this.fetchStockItemPopup();
  }
  stockItemObj: any = [] as Array<StockItems>;
  stockItemreturnField = 'itemname';
  stockItemKeys = ['Item Code','Item Name','ID'];
  fetchStockItemPopup() {
    if(this.showStockItemField){
      this.MaterialRequestService
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

  fetchMaterialRequestById(): void {
    //this.isLoading = true;
    this.MaterialRequestService
      .getDetails(EndpointConstant.FILLPURCHASEBYID + this.selectedMaterialId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentMaterial = response?.data;
          this.FillPurchaseDetails();      
          //this.setGridDetailsFromFill(this.invTransactions);  
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  currentMaterial = {} as Purchase;
  invTransactions:any = [];
  FillPurchaseDetails(){
    let transactionDetails = this.currentMaterial?.transaction.fillTransactions;
    let transactionAddditional = this.currentMaterial?.transaction.fillAdditionals;
    this.invTransactions = this.currentMaterial?.transaction.fillInvTransItems;
    this.materialRequestForm.patchValue({
      vouchername:this.vocherName,
      voucherno: transactionDetails.transactionNo,
      voucherDate: transactionDetails.date ? new Date(transactionDetails.date) : null,
      fromWarehouse:transactionAddditional.fromLocationID,
      toWarehouse:transactionAddditional.toLocationID,
      mainBranch:transactionAddditional.otherBranchID,
      description:transactionDetails.description,
      terms:transactionAddditional.terms,
      subBranch:this.currentBranch,
    });    

   
    this.formVoucherNo = transactionDetails.transactionNo;
    //set transaction is cancelled or not...
    this.isMaterialCancelled = transactionDetails.cancelled;
    this.setGridDetailsFromFill(this.invTransactions);
   
  }
  locId = 0;
  fetchItemFillData() {
     this.locId = this.materialRequestForm.get('fromWarehouse')?.value;
    this.MaterialRequestService
      .getDetails(EndpointConstant.FILLPURCHASEITEMS + 'PageId='+this.pageId+ '&voucherId=' + this.voucherId+'&locId='+this.locId)
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

          // push our inital complete list
          this.fillItemsData = responseData;
          this.fillItemDataOptions = itemData;
console.log(this.invTransactions);
          if(this.fillItemsData.length > 0){
             //set expiry details ...
           //// this.setExpiryDetailsFromFill(this.invTransactions);
            //set gridDetails
            this.setGridDetailsFromFill(this.invTransactions);
          }
          //set item details from import reference...
         // this.setItemDetailsFromImportReference();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
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
            itemInfo.priceCategory.forEach((pricecategory: any) => {          
              priceCategoryOptions.push( {
                "id": pricecategory.id,
                "pricecategory": pricecategory.priceCategory,
                "perc": pricecategory.perc,
                "rate":pricecategory.rate
              });
            });

          }
        });
        let itemunitObj = unitInfoOptions.find((unit: any) => unit.unit === trn.unit);
        let itemPricecategoryObj = priceCategoryOptions.find((pricecategory: any) => pricecategory.id === trn.priceCategoryId);
        console.log("Unit:"+itemunitObj +"popup:"+unitInfoOptions)
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
        gridItem.grossAmt = trn.grossAmount;
       // gridItem.discountPerc = Number(trn.discountPerc);
       // gridItem.discount = this.baseService.formatInput(Number(trn.discount));
        gridItem.amount = this.baseService.formatInput(Number(trn.amount));
        //gridItem.taxPerc = trn.taxPerc;
       // gridItem.taxValue = this.baseService.formatInput(Number(trn.taxValue));
        gridItem.total = trn.totalAmount;
       // gridItem.expiryDate = trn.expiryDate ? trn.expiryDate : null;
        gridItem.stockItemId = trn.stockItemId;
        gridItem.stockItem = trn.stockItem; 
       // gridItem.taxAccountId = trn.taxAccountId;
        // gridItem.priceCategoryOptions = priceCategoryOptions;
        // gridItem.priceCategory = {
        //   "id":itemPricecategoryObj?.id,
        //   "code":itemPricecategoryObj?.perc.toString(),
        //   "name":itemPricecategoryObj?.pricecategory,
        //   "description":itemPricecategoryObj?.rate
        // };
        this.itemDetails.push(gridItem);
        //set size master...
     //  this.onSizemasterSelected(trn.sizeMasterName,this.itemDetails.length-1);

      });
      this.itemDetails.push(this.itemDetailsObj);
      this.noGridItem = false;
      this.currentItemTableIndex = this.itemDetails.length - 1;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
      //this.calculateTotals(); 
    }
  }

  fetchItemTransactionData() {
    this.MaterialRequestService
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
  fetchCommonFillData() {
    this.MaterialRequestService
      .getDetails(EndpointConstant.MATERIALREQUESTLOADDATA + this.pageId + '&voucherId=' + this.voucherId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.commonFillData = response?.data;
         
          //set project data..
          if (this.commonFillData.mainBranch && this.commonFillData.mainBranch.length > 0) {
            this.BranchData=this.commonFillData.mainBranch;
            this.mainBranchData = this.BranchData.map((item: any) => ({
              value: item.name,
              id: item.id
            }));
            this.materialRequestForm.patchValue({
                mainBranch: this.currentBranch
              });
              this.subBranchData = this.BranchData.map((item: any) => ({
                value: item.name,
                id: item.id
              }));
              this.materialRequestForm.patchValue({
                  subBranch: this.subBranchData[0].id
                });
          }
          //warehouse data...
          this.WarehouseData = this.commonFillData?.toWarehouse;
          if (this.WarehouseData?.length > 0) {
            this.fromWarehouseData=this.WarehouseData.map((item: any) => ({
                value: item.name,
                id: item.id
              }));
            this.materialRequestForm.patchValue({
                fromWarehouse: this.fromWarehouseData[0].id
            });
            this.toWarehouseData=this.WarehouseData.map((item: any) => ({
                value: item.name,
                id: item.id
              }));
            this.materialRequestForm.patchValue({
                toWarehouse: this.toWarehouseData[0].id
            });
          }
          //setting voucher data..
          this.setVoucherData();
          this.fetchItemFillData();
          //this.setGridDetailsFromFill(this.invTransactions);
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  
  onChangeWarehouse() {
    const warehouseId = this.materialRequestForm.get('fromWarehouse')?.value;
    if (warehouseId) {
        this.fetchItemFillData();
      }
  }
  onClickNewMaterialRequest() {
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
    this.materialRequestForm.reset();
    this.selectedMaterialId = 0;
    this.itemDetails = [];
    this.isMaterialCancelled = false;


    this.fillItemsData = [];
    if (this.isInputDisabled == true) {
      this.disbaleFormControls();
      this.selectedMaterialId = this.firstMaterial;
      this.fetchMaterialRequestById();
    } else {
      this.selectedMaterialId = 0;
      this.materialRequestForm.patchValue({
        voucherDate: this.today,
        advance: 0.0000,
        netamount: 0.0000,
        grandtotal: 0.0000
      });
       this.enableFormControls();
       this.currentItemTableIndex = 0;
    //   //empty item detaills....
       this.tempItemFillDetails = [];
       this.itemDetails = [];
      this.invTransactions = [];

    

      this.addRow();
      this.fetchCommonFillData();
      
    }
    return true;
  }
  disbaleFormControls() {
    //this.materialRequestForm.get('voucherno')?.disable();
    this.materialRequestForm.get('voucherDate')?.disable();
    this.materialRequestForm.get('mainBranch')?.disable();
    //this.materialRequestForm.get('subBranch')?.disable();
    this.materialRequestForm.get('fromWarehouse')?.disable();
    this.materialRequestForm.get('toWarehouse')?.disable();
    this.materialRequestForm.get('description')?.disable();
  }
  
  fetchGridSettingsByPageId() {
    if(this.showStockItemField){
      this.MaterialRequestService
        .getDetails(EndpointConstant.FILLGRIDSETTINGSBYPAGEID+this.pageId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            this.gridsettings = response?.data;
            if(response?.data  && response.httpCode == 200){
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
    // if(!this.gridColumns.includes('PriceCategory')){
    //   this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'pricecategory');
    // }
    // if(!this.gridColumns.includes('SizeMasterID')){
    //   this.tablecolumns = this.tablecolumns.filter(column => column.field !== 'sizemasterid');
    // }
  }

  onClickEditMaterialRequest() {
    if(!this.isEdit){
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    this.itemUnitDetails = [];
    if (this.isInputDisabled == false) {
      this.enableFormControls();
    } else {
      this.disbaleFormControls();
    }
    this.fetchMaterialRequestById();
    return true;
  }
  enableFormControls() {
    this.materialRequestForm.get('voucherno')?.enable();
    this.materialRequestForm.get('voucherDate')?.enable();
    this.materialRequestForm.get('mainBranch')?.enable();
    this.materialRequestForm.get('subBranch')?.disable();
    this.materialRequestForm.get('fromWarehouse')?.enable();
    this.materialRequestForm.get('toWarehouse')?.enable();
    this.materialRequestForm.get('description')?.enable();
    this.materialRequestForm.get('terms')?.enable();;

    }
    

  onClickMaterial(event: any): void {
    if (event.type === 'click') {
      this.selectedMaterialId = event.row.ID;
     // this.emptyAllSummaryTotalsAndObjects();
      this.fetchMaterialRequestById();
    }
  }

  setVoucherData(){
    //set voucher name and number...
    this.vocherName = this.commonFillData.voucherNo?.code;
    this.materialRequestForm.patchValue({
      vouchername: this.vocherName,
      voucherno: this.commonFillData.voucherNo?.result,
    });
    this.formVoucherNo = this.commonFillData.voucherNo?.result;
  }
  onScroll(event: any) {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    this.showTopBar = scrollTop > 50  ? true : false;  // Show the bar when scrolled more than 50px
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
  moveFocusToItemGrid(){
    this.currentColIndex = 1;
    this.currentRowIndex = 0;
    this.scrollToCell(this.currentRowIndex,this.currentColIndex);
    this.enableInlineEditing = false;
    this.focusGridCell(this.currentRowIndex, this.currentColIndex);
  }
  setInitialState() {
    this.isNewBtnDisabled = false;
    this.isEditBtnDisabled = false;
    this.isDeleteBtnDisabled = false;
    this.isSaveBtnDisabled = true;
    this.isInputDisabled = true;
    this.isUpdate = false;
   // this.disbaleFormControls();
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
  fetchAllMaterialRequest(): void {
    this.isLoading = true;
    this.MaterialRequestService
      .getDetails(EndpointConstant.MATERIALREQUESTLEFTFILL + this.pageId +'&transId='+ this.transId+ '&voucherId='+this.voucherId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.allMaterialList = response?.data;
          this.tempMaterialList = [...this.allMaterialList];
          this.firstMaterial = this.allMaterialList[0].ID;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fillterMaterialRequest(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.tempMaterialList.filter(function (d: any) {
      const trNoMatch = d.TransactionNo.toString().toLowerCase().includes(val.toLowerCase());
      return trNoMatch || !val;
    });

    // update the rows
    this.allMaterialList = temp;
    // Whenever the filter changes, always go back to the first page
    //this.table.offset = 0;
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

  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }

  onSelectLeftTable(event:any) {
  }
  

  onRowSelect(row:any) {
    this.selected = [row];
  }
  
  selectRow(event: Event, rowIndex: number): void {

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

 callKeydownEventToDropdown(fieldName:any,event:KeyboardEvent): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.onKeyDown(event);
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
    if(this.currentColumname != 'id' && this.currentColumname != 'itemname' && this.currentColumname != 'amount'){
      this.enableInlineEditing  = true;
    }    
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
  }
  onItemCodeSelected(option: any, rowIndex: number) {
    if(option != ""){
      let selectedItemObj: any = {};
      let selectedxpireItemObj: any = {};
      this.fillItemsData.forEach((itemInfo: any) => {
        if (itemInfo.item.itemCode === option) {
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

        //   //setting item price category...
        //   let priceCategoryOptions: any = [];
        //   itemInfo.priceCategory.forEach((pricecategory: any) => {          
        //     priceCategoryOptions.push( {
        //       "id": pricecategory.id,
        //       "pricecategory": pricecategory.priceCategory,
        //       "perc": pricecategory.perc,
        //       "rate":pricecategory.rate
        //     });
        //   });

          selectedItemObj = { ...this.itemDetailsObj }; 
          selectedItemObj.itemId = itemInfo.item.id;
          selectedItemObj.itemCode = itemInfo.item.itemCode;
          selectedItemObj.itemName = itemInfo.item.itemName;
          // selectedItemObj.batchNo = this.itemDetails[rowIndex]['batchNo'] ? this.itemDetails[rowIndex]['batchNo'] : (this.itemTransactionData.batchNo ?? 0);
          selectedItemObj.batchNo = this.itemDetails[rowIndex]['batchNo'] 
          ? this.itemDetails[rowIndex]['batchNo'] 
          : (this.itemTransactionData.batchNo ?? 0);
          selectedItemObj.unit = firstUnit;
          selectedItemObj.unitsPopup = unitInfoOptions;
          selectedItemObj.qty =  0.0000;
          selectedItemObj.focQty =  0.0000;
          selectedItemObj.rate = firstUnit.purchaseRate;
        //   selectedItemObj.grossAmt = 0.0000;
        //   selectedItemObj.discountPerc = 0.0000;
        //   selectedItemObj.discount = 0.0000;
          selectedItemObj.amount = 0.0000;
        //   selectedItemObj.taxPerc = itemInfo.item.taxPerc ? itemInfo.item.taxPerc : 0.0000,
        //   selectedItemObj.taxValue = 0.0000;
        //   selectedItemObj.total = 0.0000;
          selectedItemObj.expiryDate = null;
          selectedItemObj.stockItem = '';
          selectedItemObj.stockItemId = 0;//itemInfo.item.stock;
        //   selectedItemObj.taxAccountId = itemInfo.item.taxAccountID;
        //   selectedItemObj.priceCategoryOptions = priceCategoryOptions;
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
    }

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
  validateItemGridEntry() {
    const warehouseId = this.materialRequestForm.get('fromWarehouse')?.value;
    if (!warehouseId) {
      alert('Please select location');
      return false;
    }
    return true;
  }
  onKeyDown(event: KeyboardEvent) {
    //handle CTl+Alt+m key .
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
        
        } else {
          event.preventDefault();         
          this.enableInlineEditing = false; 
          
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
            this.currentColIndex = 0;
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
            if(this.enableInlineEditing == false  && (columnName != 'id' &&columnName != 'itemname' && columnName != 'amount' && columnName != 'taxperc' && columnName != 'taxvalue' && columnName != 'total'
              && ((columnName === 'grossamount' ) || (columnName !== 'grossamount')))){
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
                    if(columnName == 'unit'){
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['unit'] = event.key;
                    } else if(columnName == 'pricecategory'){
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    } else if(columnName == 'sizemasterid'){
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
  noGridItem = true;
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
  selectedRowIndex:any = -1;
  gridsettings:any =  [] as Array<GridSettings>;
  gridColumns:any = [];

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

  onItemUnitSelected(option: any, rowIndex: any) {
    let unitPopup = this.itemDetails[rowIndex]['unitsPopup'];
    let unitObj = unitPopup.find((unit: any) => unit.unit === option)
    this.itemDetails[rowIndex]['unit'] = unitObj;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
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
      alert('Invalid Date');
    }
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
  onChangeGrossAmount(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const qty = this.itemDetails[rowIndex]['qty'];
    let grossAmount = event.target.value;
    let rate = grossAmount / qty;
    this.itemDetails[rowIndex]['rate'] = rate;
    this.calculateItemAmount(rowIndex);
  }
  calculateItemAmount(rowIndex: number) {

    let qty = this.itemDetails[rowIndex]['qty'];
    let rate = this.itemDetails[rowIndex]['rate'];
    // let discPercent = this.itemDetails[rowIndex]['discountPerc'];
    // let taxPercent = this.itemDetails[rowIndex]['taxPerc'];
    // let oldTaxValue = this.itemDetails[rowIndex]['taxValue'];
     let discount = 0;
    // Calculate gross amount and Assign the calculated gross amount to the row object
     let grossAmount = this.baseService.formatInput(Number(qty * rate)); 
    // if (discPercent) {
    //   discount = (grossAmount * discPercent) / 100;
    // } else {
    //   discount = this.itemDetails[rowIndex]['discount'];
    // }
    // discount = this.baseService.formatInput(discount);
     let amount = grossAmount ;  // Do calculations using raw numbers
    // let taxValue = (amount * taxPercent) / 100;  // Calculate tax

    // If you want to display these values formatted:
    let formattedAmount = this.baseService.formatInput(amount);  
   // let formattedTaxValue = this.baseService.formatInput(taxValue);
   // let formattedTotal = this.baseService.formatInput(amount + taxValue);

    this.itemDetails[rowIndex]['grossAmt'] = grossAmount;
    this.itemDetails[rowIndex]['discount'] = discount;
    this.itemDetails[rowIndex]['amount'] = formattedAmount;
    //this.itemDetails[rowIndex]['taxValue'] = formattedTaxValue;
   // this.itemDetails[rowIndex]['total'] = formattedTotal;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    //change tax value obj ...
    // if (taxValue && taxValue != oldTaxValue && this.itemDetails[rowIndex]['taxAccountId']) {
    //   //set tax popup details...
     
    // }
    
   

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
  onChangeBatchNo(rowIndex: any, event: any) {
    let batchno = event.target.value;
    this.itemDetails[rowIndex]['batchNo'] = batchno;
  }

  userTyping:any = false;
  tipContent:any = "";
  onChangeQuantity(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const rate = this.itemDetails[rowIndex]['rate'];
   
    let qty = event.target.value;
    this.itemDetails[rowIndex]['qty'] = qty;
    this.calculateItemAmount(rowIndex);
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
  grossAmountEditSettings = false;
  isgrossAmountEditable = false;
  autoroundoffEnabled = false;
  itemExpiryManagement = false;
  showStockItemField = false;
  multiCurrencySupport = 0;
  settings:any;
  itemmasterPageId = 0;
  navigateToItemPage(itemId: number) {
    const urlTree = this.router.createUrlTree(['/inventory/masters/itemmaster'], { queryParams: { pageId:this.itemmasterPageId,itemid: itemId } });
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank');
  }

  changeGrossAmountEditable(event: any) {
    this.isgrossAmountEditable = event.target.checked ? true : false;
  }

  updateCallback(payload: any) {
    this.MaterialRequestService.updateDetails(EndpointConstant.UPDATEMATERIALREQUEST+'voucherId='+this.voucherId+'&pageId='+this.pageId, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if(!this.activePrintOption){
            alert(response.data);
          } else{
           // this.showPrintConfirmBox();
          }        
          this.selectedMaterialId = 0;
          this.selectedMaterialId = this.firstMaterial;
          //this.fetchPurchaseById();
          this.setInitialState();
          this.onClickNewMaterialRequest();
        },
        error: (error) => {
          this.isLoading = false;
          alert('Please try again');
        },
      });
  }

  createCallback(payload: any) {
    this.MaterialRequestService.saveDetails(EndpointConstant.SAVEMATERIALREQUEST+'voucherId='+this.voucherId+'&pageId='+this.pageId, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
        //   if(!this.activePrintOption){
        //     if (response.httpCode == 201) {
        //       alert(response.data);
        //     } else {
        //       alert(response.data);
        //     }
        //   } else{
        //    // this.showPrintConfirmBox();
        //   }   
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;          
          const message =STATUS_MESSAGES[status] ;
          alert(message);
          this.selectedMaterialId = this.firstMaterial;
          //this.fetchPurchaseById();
          this.fetchAllMaterialRequest();
          this.setInitialState();
          this.onClickNewMaterialRequest();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving branch', error);
        },
      });
  }
  onClickSaveMaterialRequest() {   
    //set Branch data..
    if(this.materialRequestForm.get('mainBranch')?.value){
        this.BranchData.forEach((element:any)=>{
          if(element.id == this.materialRequestForm.get('mainBranch')?.value){
            this.selectedmainBranchDataObj = {
              "id": element.id,
              "value": element.name
            };
          }
        //   else
        //   {
        //     alert("MainBranch Requried");
        //     return;
        //   }     
        });
      }
     
       //set Branch data..
    if(this.materialRequestForm.get('subBranch')?.value){
        this.BranchData.forEach((element:any)=>{
          if(element.id == this.materialRequestForm.get('subBranch')?.value){
            this.selectedsubBranchDataObj = {
              "id": element.id,
              "value": element.name
            };
          }
        });
      }     
    //set warehouse data..
    if(this.materialRequestForm.get('fromWarehouse')?.value){
      this.WarehouseData.forEach((element:any)=>{
        if(element.id == this.materialRequestForm.get('fromWarehouse')?.value){
          this.selectedFromWarehouseObj = {
            "id": element.id,
            "value": element.name
          };
        }
    //     else
    //     {
    //     alert("FromWarehouse Required");
    // return;
    //     }
      });
    }
   
    //set warehouse data..
    if(this.materialRequestForm.get('toWarehouse')?.value){
        this.WarehouseData.forEach((element:any)=>{
          if(element.id == this.materialRequestForm.get('toWarehouse')?.value){
            this.selectedToWarehouseObj = {
              "id": element.id,
              "value": element.name
            };
          }
        //   else
        //   {
        //   alert("ToWarehouse Required");
        //   return;
        //   }
        });
      }
      if(this.materialRequestForm.value.voucherDate=="")
    {
        alert("Date Required")
        return;
    }
     // this.dateValidator(this.materialRequestForm.value.voucherDate);
      this.dateValidation(this.materialRequestForm.value.voucherDate);
           
    
    //removing last entry from item details ..
   this.itemDetails.pop();
   //const items=this.itemDetails.filter((item:any)=>item.id && item.id!=0);
   if(this.itemDetails.length<1)
   {
    alert("Items Required");
    return;
   }
    const payload = {
      "transactionId": this.selectedMaterialId ? this.selectedMaterialId : 0,
      "voucherNo": this.materialRequestForm.value.voucherno,
      "voucherDate": this.materialRequestForm.value.voucherDate,
      "description":  this.materialRequestForm.value.description,
      "branchAccount":{
        "Id":null,
      },
      "account":null,
      "reference":null,
      "total":null,
      "materialTransAddDto": {
        "mainBranch": this.selectedmainBranchDataObj,
        "subBranch": this.selectedsubBranchDataObj,
        "fromWarehouse": this.selectedFromWarehouseObj,
        "toWarehouse": this.selectedToWarehouseObj,
        "terms":this.materialRequestForm.value.terms,
      },
      "items": this.itemDetails,
      "references": null,
    };
    console.log(payload)
    if (this.isUpdate) {
      this.updateCallback(payload);
    } else {
      this.createCallback(payload);
    }
    return true;
  }
  showDeletePopup = false;
  cancelReason:string = "";
  showCancelPopup = false;
  onClickDeleteMaterial(event:Event) {
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
    console.log(EndpointConstant.DELETEPURCHASE + this.selectedMaterialId+'&pageId='+this.pageId)
    this.MaterialRequestService.deleteDetails(EndpointConstant.DELETEPURCHASE + this.selectedMaterialId+'&pageId='+this.pageId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            this.showDeletePopup = false;
            if (response.httpCode == 200) {
              alert(response.data.data);
            } else {
              alert(response.data);
            }
            this.selectedMaterialId = 0;
            this.showDeletePopup = false;
            this.fetchAllMaterialRequest();
            this.setInitialState();
            this.onClickNewMaterialRequest();
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

  onClickCancelMaterial(event:Event){
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
    this.MaterialRequestService.updateDetails(EndpointConstant.CANCELPURCHASE + this.selectedMaterialId+'&pageId='+this.pageId+'&reason='+this.cancelReason,{})
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            if (response.httpCode == 200) {
              alert(response.data.data);
            }
            this.cancelReason = "";
            this.selectedMaterialId = 0;
            this.showCancelPopup = false;
            this.fetchAllMaterialRequest();
            this.setInitialState();
            this.onClickNewMaterialRequest();
          },
          error: (error) => {
            alert('Please try again');
          },
        });
  }

  closeCancelPopup(){
    this.showCancelPopup = false;
  }
//Date future checking
  dateValidation(value:any)  
  {
// The date you want to check
const inputDate = new Date(value); 

// Get the current date
const currentDate = new Date();
if(inputDate>currentDate)
{
    alert("This Date is not Allowed");
    return;
}

  }
  checkIncludeArrayList(selectedObj:any,arrayList:any[])
  {
   if(!arrayList.includes(selectedObj))
   {
        alert("Selected Object not included");
        return;
   }

  }

}