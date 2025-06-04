import { Component, ElementRef, numberAttribute, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { Currency, ItemOptions, Items, itemTransaction, Purchase, Purchases, Reference, Salesman, UnitPricePopup, VoucherType } from '../model/purchase.interface';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { FormBuilder, FormGroup } from '@angular/forms';
import { StockItemDto, WAREHOUSE } from '../model/stockreceipt.interface';
import { GridNavigationService, CustomDialogueComponent,SearchableDropdownComponent, MenuDataService, EndpointConstant, BaseService, STATUS_MESSAGES } from '@dfinance-frontend/shared';
import { MatDialog } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { OpeningStockService } from '../../services/openingstock.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { ActivatedRoute } from '@angular/router';
import { DatePipe, formatDate } from '@angular/common';
import { NativeDateAdapter } from '@angular/material/core';
import { OpenStock } from '../model/openingstock.interface';


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
  selector: 'dfinance-frontend-openingstock',
  templateUrl: './openingstock.component.html',
  styleUrls: ['./openingstock.component.css'],
})
export class OpeningstockComponent {

  stockForm!:FormGroup;

  isCreate = true;
  isUpdate: boolean = false;
  isView = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;
  tipContent: any = "";
  showImportReferencePopup = false;
  noGridItem = true;
  showCancelPopup = false;
  showDeletePopup = false;
  cancelReason: string = "";
  pageId = 0;
  locId = 0;
  voucherNo = 0;
  voucherName = "";
  formVoucherNo: any = 0;
  formattedDate='';

  isLoading = false;
  isMaximized = false;
  destroySubscription: Subject<void> = new Subject<void>();
 
  isInputDisabled: boolean = true;
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  isDeleteBtnDisabled: boolean = false;
  enableInlineEditing: boolean = false;

  isStockCancelled = false;
  showLeftSection: boolean = true;
  showDeleteOptions: boolean = false;
  showTopBar: boolean = false;

  voucherFillData: any = [];
  tempStockList: any = [];
  selectedleftrow: any = [];
  tempItemFillDetails: any = [];
  stockMasterList = [] as Array<Purchases>;
  currentStock = {} as Purchase;
  fillItemsData = [] as Array<Items>;
  fillItemDataOptions = [] as Array<ItemOptions>;
  itemTransactionData: any = {} as itemTransaction;
  referenceFillData = [] as Array<Reference>;
  referenceListarray: any = [];
  voucherTypeData = [] as Array<VoucherType>;
  importedReferenceList: any = [];
  selectedStockId!: number;
  tableHeight = 200;
  itemDetails: any[] = [];
  invTransactions: any = [];
  selected: any[] = [];
  selectedRowIndex: any = -1;
  firstStock!: number;
  referenceData: any = {};
  isReferenceImported = false;
  selectedWarehouseObj: any = {}

  currentRowIndex: number = -1;
  currentColIndex: number = 0;
  currentColumname: any = "";
  currentItemTableIndex: number | null = null;
  currentStockInfo: any = [];
  currentBranch = 0;

  salesmanData = [] as Array<Salesman>;
  updatedSalesman = '';
  salesmanField = 'name';
  salesmanKeys = ['Code', 'Name', 'ID'];
  selectedSalesmanObj:any = {};
  isFormDirty = false;

  currencyDropdown:any = [] as Array<Currency>;
  multiCurrencySupport = 1;
  currentCurrencyRate = 0;
  currentcurrencyObj = {};
  selectedCurrencyId = 0;

  istoggleActive = false;
  SelectionType = SelectionType;
  voucherDate: string | null = null;

   showPricePopup = false;
    currentItemUnitDetails: any = [] as Array<UnitPricePopup>;
    currentItemId = 0;
  
  tablecolumns = [
    { name: 'SlNo', field: 'id' },
    { name: 'Item Code', field: 'itemcode' },
    { name: 'Item Name', field: 'itemname' },
    //{ name: 'BatchNo', field: 'batchno' } ,
    { name: 'Unit', field: 'unit' },
    { name: 'Qty', field: 'qty' },
    { name: 'Rate', field: 'rate' },
    { name: 'Amount', field: 'amount' },
    { name: 'Tax%', field: 'taxPerc' },
    { name: 'TaxValue', field: 'taxValue' },
    { name: 'ExpiryDate', field: 'ExpiryDate' }
  ];

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
    // "total": "",
    // "expiryDate": null,
    // "description": null,
    // "lengthFt": 0,
    // "lengthIn": 0,
    // "lengthCm": 0,
    // "girthFt": 0,
    // "girthIn": 0,
    // "girthCm": 0,
    // "thicknessFt": 0,
    // "thicknessIn": 0,
    // "thicknessCm": 0,
    // "remarks": "",
    // "taxTypeId": 0,
    // "taxAccountId": 0,
    // "priceCategoryOptions":[],
    // "costAccountId": 0,
    // "brandId": 0,
    // "profit": 0,
    // "repairsRequired": "",
    // "finishDate": null,
    // "updateDate": null,
    // "replaceQty": 0,
    // "printedRate": 0,
    // "hsn": "string",
    // "avgCost": 0,
    // "isReturn": true,
    // "manufactureDate": null,
    // "priceCategory": {
    //   "id": null,
    //   "name": "",
    //   "code": "",
    //   "description": ""
    // },
    // "sizeMaster": {
    //   "id": null,
    //   "name": "",
    //   "code": "",
    //   "description": ""
    // },
    // "uniqueItems": [
    //   {
    //     "uniqueNumber": "string"
    //   }
    // ]
  };

 
  itemCodeKeys = ['Item Code', 'Item Name', 'Bar Code', 'ID', 'Unit', 'Stock', 'Rate', 'Purchase Rate','Amount'];
  itemCodereturnField = 'itemCode';
  itemCodeExcludekeys = ['unit'];
  itemUnitKeys = ['Unit', 'Basic Unit', 'Factor'];
  itemUnitreturnField = 'unit';

  warehouseData = [] as Array<WAREHOUSE>;
  fillStockItemsData = [] as Array<OpenStock>;
  index: any;
  row: any;
  voucherFillDate: any;
  taxTotal = 0.0000;
  qtyTotal = 0.0000;
  amountTotal = 0.0000;
  originalItemList: any;
  

  constructor(
    private gridnavigationService: GridNavigationService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private menudataService: MenuDataService,
    private route: ActivatedRoute,
    private openingstockService: OpeningStockService,
    private baseService: BaseService,
    private renderer: Renderer2,
    private datePipe: DatePipe,
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

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  @ViewChild('tableWrapper', { static: true }) tableWrapper!: ElementRef;
  @ViewChildren('summaryCell') summaryCells!: QueryList<ElementRef>;
  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;

  ngOnInit(): void {
    console.log("haiiii");
    this.stockForm = this.formBuilder.group({
      vouchername: [{ value: '', disabled: true }],
      voucherno: [{ value: '', disabled: true }],
      date: [{ value: '', disabled: this.isInputDisabled }],
      reference: [{ value: '', disabled: this.isInputDisabled }],
      warehouse: [{ value: '', disabled: this.isInputDisabled }],
      salesman: [{ value: '', disabled: this.isInputDisabled }],
      terms: [{value: '', disabled: this.isInputDisabled}],
      currency: [{ value: '', disabled: this.isInputDisabled }],
      exchangerate: [{ value: '', disabled: this.isInputDisabled }],
    });
    this.currentBranch = this.baseService.getLocalStorgeItem('current_branch') ? Number(this.baseService.getLocalStorgeItem('current_branch')) : 0;

    this.fetchStockMaster();    
    this.fetchCommonData();
    this.FillReferenceData();
     this.fetchVoucherType();
     this.onClickNewStock();
     this.fetchItemTransactionData();
     this.loadDate();
     this.fetchCurrencyDropdown();
     this.fetchItemFillData();
  }
  checkItemCodeCanAdd() {
    const warehouseId = this.stockForm.get('warehouse')?.value;
  
    if (warehouseId) {
      this.fetchItemFillData();
    }
  }
  
  fetchCurrencyDropdown() {
    if(this.multiCurrencySupport){
      this.openingstockService
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
    //this.setTaxPopupDetails();
  }

  // calculateTaxTotal() {
  //   let total = 0.0000;
  //   this.itemDetails.forEach(function (item) {
  //     total = total + Number(item.taxValue);
  //   });
  //   this.taxTotal = this.baseService.formatInput(total);
  // }

  saveCurrencyRate(){
    //currency id and currency rate 
    if(confirm('Are you sure you want to update exchange rate for this currency?')){
      this.openingstockService.updateDetails(EndpointConstant.UPDATEEXCHANGERATE+this.selectedCurrencyId+'&exchRate='+this.currentCurrencyRate, {})
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            if(response.httpCode == 200){
              this.baseService.showCustomDialogue('Rate updated');
            } else{
              this.baseService.showCustomDialogue('Please try again');
            }
            
          },
          error: (error) => {
            this.baseService.showCustomDialogue('Please try again');
          },
        });
      }
  }

  fetchItemFillData() {

    const warehouseId = this.stockForm.get('fromwarehouse')?.value;
    const dateValue = this.stockForm.get('voucherdate')?.value;
    if (dateValue == null) {
     // alert("Enter  Date and Proceed");
    }
    this.voucherDate = this.datePipe.transform(dateValue, 'dd-MM-yyyy');
    console.log("FillItems:" + EndpointConstant.FILLSTOCKITEMS + this.voucherNo + '&VoucherDate=' + this.voucherDate + '&LocationID=' + warehouseId)
    this.openingstockService
      .getDetails(EndpointConstant.FILLSTOCKITEMS + this.voucherNo + '&VoucherDate=05-11-2024&LocationID=' + this.locId)
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
              qty: item.item.qty,
              rate: item.item.rate,
              amount: item.item.amount,
              taxPerc: item.item.taxPerc,
              taxValue: item.item.taxValue,
              expiryDate: item.item.expiryDate,
              purchaseRate: item.item.purchaseRate,
              unit: unitObj ? {
                unit: unitObj.unit,
                basicUnit: unitObj.basicUnit,
                factor: unitObj.factor
              } : {},
            };
          });

          // push our inital complete list
          this.fillStockItemsData = responseData;
          this.fillItemDataOptions = itemData;
          this.calculateQantityTotal();
          this.calculateAmountTotal();
          this.calculateTaxTotal();
          this.setItemDetailsFromImportReference();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
      
  }

  fetchVoucherType() {
    this.openingstockService
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

  onClickStock(event: any): void {
    if (event.type === 'click') {
      this.selectedStockId = event.row.ID;
      this.fetchStockById();
    }
  }

  onClickNewStock(){
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
    this.stockForm.reset();
    this.selectedStockId = 0;
    this.itemDetails = [];
    this.isStockCancelled = false;

    if (this.isInputDisabled == true) {
      this.disableFormControls();
      this.selectedStockId = this.firstStock;
      this.fetchStockById();
    }
    else {
      this.itemDetails = [];
      this.stockForm.patchValue({
        voucherdate: this.formattedDate
      });
      this.addRow();
      this.enableFormControls();
      this.fetchCommonData();
      this.loadDate();
    }
    return true;
  }
  
  enableFormControls() {
    this.stockForm.get('voucherdate')?.enable();
    this.stockForm.get('reference')?.enable();
    this.stockForm.get('warehouse')?.enable();
    this.stockForm.get('salesman')?.enable();
    this.stockForm.get('terms')?.enable();
    this.stockForm.get('exchangerate')?.enable();

  }

  disableFormControls() {
    this.stockForm.get('voucherdate')?.disable();
    this.stockForm.get('reference')?.disable();
    this.stockForm.get('warehouse')?.disable();
    this.stockForm.get('salesman')?.disable();
    this.stockForm.get('terms')?.disable();
    this.stockForm.get('currency')?.disable();
    this.stockForm.get('exchangerate')?.enable();
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

  fetchStockById(): void {
    this.openingstockService
      .getDetails(EndpointConstant.FILLSTOCKRECEIPTBYID + this.selectedStockId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentStock = response?.data;
          console.log('data from the api is :'+JSON.stringify(this.currentStock,null,2));
          this.FillStockDetails();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  FillStockDetails() {
    let transactionDetails = this.currentStock?.transaction.fillTransactions;
    let transactionAddditional = this.currentStock?.transaction.fillAdditionals;
    this.invTransactions = this.currentStock?.transaction.fillInvTransItems;
    this.referenceData = this.currentStock?.transaction.fillVoucherAllocationUsingRef;
    this.formattedDate = transactionDetails.effectiveDate;
    this.formattedDate = this.formattedDate.toString().split('T')[0];

    this.stockForm.patchValue({
      vouchername: this.voucherName,
      voucherno: transactionDetails.transactionNo,
      date: transactionDetails.effectiveDate?this.formattedDate:null,
      reference: transactionDetails.referenceNo,
      warehouse: transactionAddditional.toLocationID,
      terms: transactionAddditional.terms
    });
    this.formVoucherNo = transactionDetails.transactionNo;
    this.isStockCancelled = transactionDetails.cancelled;
    this.currentcurrencyObj = {
      "id":transactionDetails.currencyID,
      "value":transactionDetails.currency
    };
    // if(transactionAddditional.accountName != null){
    //   this.onSalesmanSelected(transactionAddditional.accountName,false);
    // }
    if (this.fillStockItemsData.length > 0) {
      this.setGridDetailsFromFill(this.invTransactions);
    }
   this.checkItemCodeCanAdd();
   //this.calculateTaxValueGrid(rowIndex);
   this.calculateQantityTotal();
   this.calculateAmountTotal();
   this.calculateTaxTotal();
  }

  setGridDetailsFromFill(invTransactions: any) {
    if (invTransactions.length > 0) {
      this.itemDetails = [];
 
      invTransactions.forEach((trn: any) => {
        let unitInfoOptions: any[] = [];
 
        // Populate unit options based on matching itemCode
        this.fillStockItemsData.forEach((iteminfo: any) => {
          if (iteminfo.item.itemCode === trn.itemCode) {
            iteminfo.unitPopup.forEach((unitInfo: any) => {
              unitInfoOptions.push({
                "unit": unitInfo.unit,
                "basicUnit": unitInfo.basicUnit,
                "factor": unitInfo.factor
              });
            });
          }
        });
 
        // Find the matching unit object for the transaction unit
        const itemunitObj = unitInfoOptions.find((unit: any) => unit.unit === trn.unit);
 
        // Map properties to the grid item
        const gridItem = {
          ...this.itemDetailsObj,
          transactionId: trn.transactionId,
          itemId: trn.itemId,
          itemCode: trn.itemCode,
          itemName: trn.itemName,
          batchno: trn.batchNo,
          unit: {
            "unit": itemunitObj?.unit || '',
            "basicUnit": itemunitObj?.basicUnit || '',
            "factor": itemunitObj?.factor || 1
          },
          qty: Number(trn.qty),
          rate: this.baseService.formatInput(Number(trn.rate)),
          amount: this.baseService.formatInput(Number(trn.amount)),
          stockQty: trn.stockQty || 0,
          basicQty: trn.basicQty || 0,
          pcs: trn.pcs || 0,
          sizeMaster: { "id": null },
          taxTypeId: trn.taxTypeId || 0,
          taxPerc: trn.taxPerc || 0,
          taxValue: trn.taxValue || 0,
          expiryDate:trn.expiryDate,
          taxAccountId: trn.taxAccountId || 0,
          uniqueItems: trn.uniqueItems || [],
 
        };
 
        this.itemDetails.push(gridItem);
        console.log('this is grid data:'+JSON.stringify(this.itemDetails,null,2));
       
      });
 
      this.itemDetails.push({ ...this.itemDetailsObj });
      this.noGridItem = false;
      this.currentItemTableIndex = this.itemDetails.length - 1;
 
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
      this.originalItemList = [...this.tempItemFillDetails];

    }
    this.calculateQantityTotal();
    this.calculateAmountTotal();
    this.calculateTaxTotal();
  }

  
  FillReferenceData() {
    this.openingstockService
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

  onChangeWarehouse() {
    const warehouseId = this.stockForm.get('warehouse')?.value;
    const voucherDate = this.stockForm.get('date')?.value;
    if (warehouseId && voucherDate) {
      this.fetchItemFillData();
    }
  }

  loadDate() {
    this.openingstockService
      .getDetails(EndpointConstant.VOUCHERDATE)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // Get the voucherFillDate from the API response
          this.voucherFillDate = response?.data;
  
          // Convert the date to a Date object if it's not already
          const voucherDate = new Date(this.voucherFillDate);
  
          // Subtract one day
         // voucherDate.setDate(voucherDate.getDate() - 0);
  
          // Format the adjusted date to 'YYYY-MM-DD'
          this.formattedDate = voucherDate.toISOString().split('T')[0];
  
          // Patch the form with the adjusted date
          this.stockForm.patchValue({
            date: this.formattedDate,
          });
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  

  fetchCommonData() {
    console.log("fetch common data");
    this.openingstockService
      .getDetails(EndpointConstant.FILLCOMMONPURCHASEDATA + this.pageId + '&voucherId=' + this.voucherNo)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
           this.voucherFillData = response?.data;
          this.voucherName = this.voucherFillData.vNo?.code;
           this.warehouseData = this.voucherFillData?.wareHouse;
           this.stockForm.patchValue({
             vouchername: this.voucherName,
             voucherno: this.voucherFillData.vNo?.result,
          });
          this.formVoucherNo = this.voucherFillData.vNo?.result;
          if (this.warehouseData?.length > 0) {
            this.stockForm.patchValue({
              warehouse: this.warehouseData[0].id,
            });
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchStockMaster(): void {
    this.isLoading = true;
    this.openingstockService
      .getDetails(EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true')
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.stockMasterList = response?.data;
          this.tempStockList = [...this.stockMasterList];
          this.firstStock = this.stockMasterList[0].ID;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  onClickSaveStock() {
    const dateValue = this.stockForm.get('date')?.value;
    if (dateValue == null) {
      alert("Enter Voucher Date and Proceed");
      return;
    }
 
    const Wh = this.stockForm.get('warehouse')?.value;
    if (Wh == null) {
      alert("Select Warehouse and Proceed");
      return;
    }
 
    if (this.stockForm.get('warehouse')?.value) {
      this.warehouseData.forEach((element: any) => {
        if (element.id == this.stockForm.get('warehouse')?.value) {
          this.selectedWarehouseObj = {
            "id": element.id,
            "value": element.name
          };
        }
      });
    }
 
    const filteredItems = this.tempItemFillDetails.filter((item: any) => item.itemId && item.itemId !== 0);
    if (filteredItems.length < 1) {
      alert("Please enter items and Proceed");
      return;
    }
    const checkUnit = filteredItems.some((item: any) => !item.unit);
    if (checkUnit) {
      alert('Check whether the unit field is empty and Proceed');
      return;
    }
    const checkQty = filteredItems.some((item: any) => item.qty == null || item.qty < 1);
      if (checkQty) {
       alert('Check whether the Qty field is empty or zero and Proceed');
         return;
       }
        const checkRate = filteredItems.some((item:any) => item.rate == null || item.rate < 1);
        console.log("Rate:"+checkRate)
        if(checkRate){
        alert('Check whether the Rate field is empty or zero and Proceed');
         return;
        }
 
 
    const payload = {
      "id": this.selectedStockId ? this.selectedStockId : 0,
      "voucherNo":this.formVoucherNo,
      "date": this.formattedDate,
      "currency": this.currentcurrencyObj,
      "exchangeRate": 0,
       "items":filteredItems,
       "references": this.referenceListarray,
       "warehouse":this.selectedWarehouseObj,
      "description": "string",
      "terms": this.stockForm.value.terms
    };
 
    if (this.isUpdate) {
      this.updateCallback(payload);
    } else {
      this.createCallback(payload);
    }
    return true;
  }
 

  updateCallback(payload: any) {
    this.openingstockService.updateDetails(EndpointConstant.UPDATEOPENINGSTOCK + this.voucherNo + '&pageId=' + this.pageId, payload)
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
          console.error('Error Updating Opening Stock');
          alert('Failed to Update Opening Stock.');
        },
        complete: () => {
          this.fetchStockMaster();
          this.setInitialState();
          this.onClickNewStock();
        }

      });
  }

  createCallback(payload: any) {
    console.log("save url:"+EndpointConstant.SAVEOPENINGSTOCK + this.voucherNo + '&pageId=' + this.pageId);
    console.log("Payload:", JSON.stringify(payload, null, 2))
    this.openingstockService.saveDetails(EndpointConstant.SAVEOPENINGSTOCK + this.voucherNo + '&pageId=' + this.pageId, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status];
          alert(message);
        },
        error: () => {
          this.isLoading = false;        
          alert('Failed to save Opening Stock.');
        },
        complete: () => {
          this.fetchStockMaster();
          this.setInitialState();
          this.onClickNewStock();
        }
      });
  }

  onClickEditStock(){
    if (!this.isEdit) {
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
   // this.isUnitsOpen = false;
   // this.unitsInGrid = [];
    if (this.isInputDisabled == false) {
      this.enableFormControls();
    } else {
      this.disableFormControls();
    }
    this.fetchStockById();
    return true;

  }

  onClickDeleteStock(event: Event) {
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

  onClickCancelStock(event: Event) {
    event.preventDefault();
    if (!this.isCancel) {
      alert('Permission Denied!');
      return false;
    }
    this.showCancelPopup = true;
    this.toggleDeleteOptions();
    return true;
  }

  openImportReferencePopup() {
    this.importedReferenceList = [];
    this.isReferenceImported = false;
    this.currentStockInfo = [];
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showImportReferencePopup = true;
  }

  onSelectLeftTable(event: any) {
  }
 
  onScroll(event: any) {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    this.showTopBar = scrollTop > 50 ? true : false;  // Show the bar when scrolled more than 50px
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

  onItemUnitSelected(option: any, rowIndex: any) {
    let unitPopup = this.itemDetails[rowIndex]['unitsPopup'];
    let unitObj = unitPopup.find((unit: any) => unit.unit === option)
    this.itemDetails[rowIndex]['unit'] = unitObj;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    this.itemDetailsObj= this.tempItemFillDetails;
  }

  fetchItemTransactionData() {
    this.openingstockService
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


  onItemCodeSelected(option: any, rowIndex: number) {
    if (option != "") {
      let selectedItemObj: any = {};
      this.fillStockItemsData.forEach((itemInfo: any) => {
        if (itemInfo.item.itemCode === option) {
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
          // selectedItemObj = {  };
          selectedItemObj.transactionId = itemInfo.item.transactionId;
          selectedItemObj.itemId = itemInfo.item.id;
          selectedItemObj.itemCode = itemInfo.item.itemCode;
          selectedItemObj.itemName = itemInfo.item.itemName;
          selectedItemObj.qty = 0.0000;
          selectedItemObj.unit = firstUnit;
          selectedItemObj.unitsPopup = unitInfoOptions;
          selectedItemObj.rate = firstUnit.purchaseRate;
          selectedItemObj.amount = 0.0000;
          selectedItemObj.stockQty = 0;
          selectedItemObj.basicQty = 0;
          selectedItemObj.pcs = 0;
          selectedItemObj.sizeMaster = {};
          selectedItemObj.taxTypeId = 0;
          selectedItemObj.taxPerc = itemInfo.item.taxPerc ? itemInfo.item.taxPerc : 0.0000,
          selectedItemObj.taxValue = 0.0000;
          selectedItemObj.expiryDate = null;
          selectedItemObj.taxAccountId = 0;
          selectedItemObj.uniqueItems = [];


        }
      });
      this.itemDetails[rowIndex] = selectedItemObj;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
      this.addRow(true);

      if (selectedItemObj.rate == 0) {
        this.dialog.open(CustomDialogueComponent, {
          width: '300px',
          height: '200px',
          data: {
            message: "Rate is zero",
            key: "custom"
          }
        });
      }
      this.calculateTaxValueGrid(rowIndex);
      this.calculateQantityTotal();
      this.calculateAmountTotal();
      this.calculateTaxTotal();
    }
  }

calculateTaxValueGrid(index: number) {
  let taxValue = this.itemDetails[index]['amount'];
  let taxPerc = this.itemDetails[index]['taxPerc'];
  let taxAmount = (taxValue * taxPerc) / 100;
  this.itemDetails[index]['taxValue'] = taxAmount;
   this.itemDetails = [...this.itemDetails];
   this.tempItemFillDetails = [...this.itemDetails];
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

  onFormKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key == 'Enter' || event.key == 'Tab') {
      event.preventDefault();
    }
  }

  calculateItemAmount(rowIndex: number) {
    let qty = this.itemDetails[rowIndex]['qty'];
    let rate = this.itemDetails[rowIndex]['rate'];
    let amount = qty * rate;
    this.itemDetails[rowIndex]['amount'] = amount;
  }

  onChangeQuantity(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const rate = this.itemDetails[rowIndex]['rate'];
    let qty = event.target.value;
    this.itemDetails[rowIndex]['qty'] = qty;
    this.calculateItemAmount(rowIndex);
    this.calculateQantityTotal();
    this.calculateTaxValueGrid(rowIndex);
    this.calculateAmountTotal();
    this.calculateTaxTotal();
  }

  // onChangeBatchNo(rowIndex: any, event: any) {
  //   let batchno = event.target.value;
  //   this.itemDetails[rowIndex]['batchNo'] = batchno;
  // }

  onChangeRate(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const qty = this.itemDetails[rowIndex]['qty'];
    let rate = event.target.value;
    this.itemDetails[rowIndex]['rate'] = rate;
    this.calculateItemAmount(rowIndex);
    this.calculateAmountTotal();
    this.calculateTaxValueGrid(rowIndex);
    this.calculateTaxTotal();

  }

  // updateFilter(event: any) {
  //   const val = event.target.value.toLowerCase();

  //   // filter our data
  //   const temp = this.itemDetails.filter(function (d: any) {
  //     const itemCodeMatch = d.itemcode.toString().toLowerCase().includes(val.toLowerCase());
  //     const itemnameMatch = d.itemname.toLowerCase().includes(val.toLowerCase());
  //     return itemCodeMatch || itemnameMatch || !val;
  //   });


    // update the rows
   // this.tempItemFillDetails = temp;
    // Whenever the filter changes, always go back to the first page
    //this.table.offset = 0;
  //}

  updateFilter(event: any) {
    const val = event.target.value.toLowerCase().trim();
 
    // If search text is empty, restore original data
    if (!val) {
      this.itemDetails = [...this.originalItemList];
    } else {
      // Filter from original data when search text exists
      const temp = this.originalItemList.filter((item: any) => {
        // Check if itemCode exists and matches
        const itemCodeMatch = item.itemCode
          ? item.itemCode.toString().toLowerCase().includes(val)
          : false;
 
        // Check if itemName exists and matches
        const itemNameMatch = item.itemName
          ? item.itemName.toString().toLowerCase().includes(val)
          : false;
 
        return itemCodeMatch || itemNameMatch;
      });
 
      // Update itemDetails with filtered results
      this.itemDetails = [...temp];
    }
 
    // Reset table page to first page
    if (this.ngxTable) {
      this.ngxTable.offset = 0;
    }
    this.tempItemFillDetails = [...this.itemDetails];
    // Recalculate totals after filtering
    this.calculateQantityTotal();
    this.calculateAmountTotal();
    this.calculateTaxTotal();
  }

  // onRateBlur(rowIndex: any, event: any) { }
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
        if (this.currentColIndex < this.tablecolumns.length - 1) {
          this.currentColIndex++;
          this.scrollToCell(this.currentRowIndex, this.currentColIndex);
          this.enableInlineEditing = false;
          this.handleKeysForInlineEditing();
          this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          let currentCoulmn = this.tablecolumns[this.currentColIndex];
          //enter functionality if current column is qty...
          if (currentCoulmn.field == 'qty') {
            // check qty is Zero if yes move to those columns else move to next code ...
            if (this.tempItemFillDetails[this.currentRowIndex]['rate'] == 0) {
              //show rate alert...
              this.onMouseLeaveQty(this.currentRowIndex, Event);
            }
          }

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
          this.moveFocusToDropdown('supplier'); // Move focus to the supplier input or other logic
        } else {
          event.preventDefault();
          this.enableInlineEditing = false;

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
              //show rate alert...
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
            if (this.enableInlineEditing == false && (columnName != 'id' && columnName != 'itemname' && columnName != 'amount')) {
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
                    if (columnName == 'unit') {
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['unit'] = event.key;
                    } else if (columnName == 'pricecategory') {
                      this.tempItemFillDetails[this.currentRowIndex][columnKeyName]['name'] = event.key;
                    } else if (columnName == 'sizemasterid') {
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

  moveFocusToDropdown(fieldName: any): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.focusInput();
    }
  }


  focusOnTabIndex(tabIndex: number): void {
    const element = document.querySelector(`[tabindex="${tabIndex}"]`) as HTMLElement;
    if (element) {
      element.focus(); // Focus the element with the given tabindex
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
    this.itemDetailsObj = this.tempItemFillDetails;

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

  deleteItemGrid(index: any) {
    if (confirm("Are you sure you want to delete this details?")) {
      if (this.itemDetails.length == 1) {
        this.noGridItem = true;
        this.itemDetails = [];
        this.itemDetails.push(this.itemDetailsObj);
      } else if (index !== -1) {
        this.itemDetails.splice(index, 1);
        this.selected = [];
      }
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];

      this.selectedRowIndex = -1
    }
    return true;
  }

  scrollToCell(rowIndex: number, colIndex: number): void {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }
  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
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
  callKeydownEventToDropdown(fieldName: any, event: KeyboardEvent): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.onKeyDown(event);
    }
  }


  onPurchaseTabChange(event: MatTabChangeEvent){

  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
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

  onColumKeyDown(event: KeyboardEvent): void { }

  validateItemGridEntry() {
    const warehouseId = this.stockForm.get('warehouse')?.value;
    if (!warehouseId) {
      alert('Please select location');
      return false;
    }
    return true;
  }

  handleDoubleClick(event: any) {
    if (this.currentColumname != 'itemname' && this.currentColumname != 'amount' ) {
      this.enableInlineEditing = true;
    }
  }

  filterStock(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.tempStockList.filter(function (d: any) {
      const trNoMatch = d.TransactionNo.toString().toLowerCase().includes(val.toLowerCase());
      return trNoMatch || !val;
    });

    // update the rows
    this.stockMasterList = temp;
    // Whenever the filter changes, always go back to the first page
    //this.table.offset = 0;
  }
  saveReferenceData(response: any) {
    //push reference list array...
    this.referenceListarray = response?.referenceList;
    if (Object.keys(response).length > 0) {
      if (response?.referenceVNoList.length > 0) {
        let refText = response?.referenceVNoList.join(', ');
        this.stockForm.patchValue({
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
          this.currentStockInfo = this.importedReferenceList[this.importedReferenceList.length - 1];
          //   //setting form data is overwrite option is true..
          let transactionId = this.currentStockInfo.TransactionID;
          //   this.fetchTransactionDetailsById(transactionId);
          // } else{
          this.fetchTransactionDetailsById(transactionId);
          this.setItemDetailsFromImportReference();
          this.addRow();
        }
      }
    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showImportReferencePopup = false;
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
          // if(unitInfoOptions.length == 0){
          //   this.fetchItemUnits(element.ItemID,this.itemDetails.length-1,element.Unit);
          // }
          let rowIndex = this.itemDetails.length - 1;
          this.calculateItemAmount(rowIndex);
         // this.FillTaxAccount(this.itemDetails[rowIndex]['taxAccountId'], 0, rowIndex);
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
      this.calculateQantityTotal();
      this.calculateAmountTotal();
      this.calculateTaxTotal();
    } 
  }

  fetchItemUnits(itemId: any, rowIndex: any) {
    this.openingstockService
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
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchTransactionDetailsById(transactionId: number) {
    this.openingstockService
      .getDetails(EndpointConstant.FILLTRANSACTIONDETAILSBYID + transactionId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let result = response?.data;
          //set transaction details....
          let transactionDetails = result.transactionData[0];
          this.stockForm.patchValue({
            voucherdate: transactionDetails.Date
          });
          //set transaction additional details....
          let transactionAddditional = result.additionalData?.[0];
          this.stockForm.patchValue({
            warehouse: transactionAddditional.toLocationID,
            terms: transactionAddditional.terms,
          });

        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  confirmDelete() {
    this.openingstockService.deleteDetails(EndpointConstant.DELETEPURCHASE + this.selectedStockId + '&pageId=' + this.pageId)
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
          console.error('Error Deleting Stock Receipt');
          alert('Failed to Delete Stock Receipt.');
        },
        complete: () => {
          this.selectedStockId = 0;
          this.showDeletePopup = false;
         // this.fetchStockReceiptMaster();
          this.setInitialState();
          this.onClickNewStock();
        }
      });
  }

  confirmCancel() {
    this.openingstockService.updateDetails(EndpointConstant.CANCELPURCHASE + this.selectedStockId + '&pageId=' + this.pageId + '&reason=' + this.cancelReason, {})
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status];
          alert(message);
        },
        error: () => {
          this.isLoading = false;
          console.error('Error Cancelling Stock Receipt');
          alert('Failed to Cancel Stock Receipt.');
        },
        complete: () => {
          this.cancelReason = "";
          this.selectedStockId = 0;
          this.showCancelPopup = false;
          //this.fetchStockReceiptMaster();
          this.setInitialState();
          this.onClickNewStock();
        }
      });
  }
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

  calculateQantityTotal() {
    let total = 0;
    this.itemDetails.forEach((item) => {
      const qty = parseFloat(item.qty); // Safely parse as a floating-point number
      if (!isNaN(qty)) {
        total += qty; // Only add valid numbers
      }
       else {
        console.warn(`Invalid quantity found: ${item.qty}`); // Warn if qty is invalid
      }
    });
   
    // Format total and update qtyTotal
    this.qtyTotal = this.baseService.formatInput(total);
    console.log('Total:', total);
    console.log('Formatted QtyTotal:', this.qtyTotal);
  }
 
  calculateAmountTotal() {
    let totalamount = 0;
    this.itemDetails.forEach((item) => {
      const amount = parseFloat(item.amount); // Safely parse as a floating-point number
      console.log("amount:"+amount);
      if (!isNaN(amount)) {
        totalamount += amount; // Only add valid numbers
       }
        else {
        console.warn(`Invalid quantity found: ${item.amount}`); 
      }
    });
    this.amountTotal = this.baseService.formatInput(totalamount);
    console.log('Total:', totalamount);
    console.log('Formatted AmountTotal:', this.amountTotal);
  }

  calculateTaxTotal() {
    let taxtotal = 0;
    this.itemDetails.forEach((item) => {
      const taxValue = parseFloat(item.taxValue); // Safely parse as a floating-point number
      console.log("taxvalue:"+taxValue);
      if (!isNaN(taxValue)) {
        taxtotal += taxValue; // Only add valid numbers
      }
       else {
        console.warn(`Invalid quantity found: ${item.taxValue}`); 
      }
    });
    this.taxTotal = this.baseService.formatInput(taxtotal);
    console.log('Total:', taxtotal);
    console.log('Formatted TaxTotal:', this.taxTotal);
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
   
  onChangeDate(rowIndex: any, event: any) {
    let date = event.target.value;
    this.tempItemFillDetails[rowIndex]['ExpiryDate'] = date;
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


  closeImportReferencePopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showImportReferencePopup = false;
  }

  closeDeletePopup() {
    this.showDeletePopup = false;
  }

  closeCancelPopup() {
    this.showCancelPopup = false;
  }

  onClickPrint() {
    console.log('print');
  }
  onClickPreview() {
    console.log('preview');
  }

  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }


}
