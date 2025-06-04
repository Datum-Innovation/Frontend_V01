import {
  Component,
  ElementRef,
  QueryList,
  Renderer2,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { StockTransferService } from '../../services/stocktransfer.service';
import {
  Currency,
  ItemOptions,
  Items,
  Purchase,
  Purchases,
  Reference,
  Supplier,
  VoucherType,
  Warehouse,
} from '../model/purchase.interface';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe, formatDate } from '@angular/common';
import { MatTabChangeEvent } from '@angular/material/tabs';
import {
  BaseService,
  CustomDialogueComponent,
  EndpointConstant,
  GridNavigationService,
  MenuDataService,
  SearchableDropdownComponent,
  STATUS_MESSAGES,
} from '@dfinance-frontend/shared';
import { StockItemDto } from '../model/stocktransfer.interface';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { json } from 'stream/consumers';
import { NativeDateAdapter } from '@angular/material/core';

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
  selector: 'dfinance-frontend-stockadjustment',
  templateUrl: './stockadjustment.component.html',
  styleUrls: ['./stockadjustment.component.scss'],
})
export class StockadjustmentComponent {
  vno: any;

  constructor(
    private StockTransferService: StockTransferService,
    private formBuilder: FormBuilder,
    private gridnavigationService: GridNavigationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private baseService: BaseService,
    private datePipe: DatePipe,
    private menudataService: MenuDataService
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      console.log('our page id is ' + this.pageId);
      this.fetchMenuDataPermissions();
    }
    if (queryParams && queryParams['voucherNo']) {
      this.voucherNo = queryParams['voucherNo'];
      console.log('voucher no is ' + this.voucherNo);
    }
  }
  @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;
  @ViewChild('tableWrapper', { static: true }) tableWrapper!: ElementRef;
  @ViewChildren('summaryCell') summaryCells!: QueryList<ElementRef>;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChildren(SearchableDropdownComponent)
  searchableDropdowns!: QueryList<SearchableDropdownComponent>;
  destroySubscription: Subject<void> = new Subject<void>();
  referenceData: any = {};
  formVoucherNo: any = 0;
  isUpdate = false;
  formatteddate2: string | null = null;
  totalQuantity = 0;
  totalAmount = 0;
  totalTaxValue = 0;
  qtyTotal = 0.0;
  Amttotal = 0.0;
  TAXTOTAL = 0.0;

  warehouseData = [] as Array<Warehouse>;
  fillItemDataOptions = [] as Array<ItemOptions>;
  invTransactions: any = [];
  itemDetails: any[] = [];
  referenceListarray: any = [];
  isReferenceImported = false;
  currentColIndex = 0;
  currentStockInfo: any = [];
  selectedPurchaseId!: number;
  selected: any[] = [];
  tableHeight = 200;
  currentColumname: any = '';
  tempItemFillDetails: any = [];
  currentRowIndex = -1;
  selectedFromWarehouseObj: any = {};
  stockTransferForm!: FormGroup;
  voucherFillData: any = [];
  vocherName = '';
  istoggleActive = false;
  isInputDisabled = true;
  selectedStockId!: number;
  isLoading = false;
  voucherDate: string | null = null;
  isMaximized = false;
  SelectionType = SelectionType;
  selectedleftrow: any = [];
  today = new Date();
  currentStock = {} as Purchase;
  locId = 0;
  importedReferenceList: any = [];
  currentBranch = 0;
  currencyDropdown: any = [] as Array<Currency>;
  currentCurrencyRate = 0;
  currentcurrencyObj = {};
  selectedCurrencyId = 0;

  showLeftSection = true;
  tempStockList: any = [];
  itemCodeExcludekeys = ['unit'];
  stockMasterList = [] as Array<Purchases>;
  //new save edit delete buttons
  isNewBtnDisabled = false;
  isEditBtnDisabled = false;
  isDeleteBtnDisabled = false;
  isSaveBtnDisabled = true;
  enableInlineEditing = false;
  isStockTransferCancelled = false;
  showDeleteOptions = false;
  itemCodereturnField = 'itemCode';
  selectedRowIndex: any = -1;
  currentItemTableIndex: number | null = null;
  fillStockItemsData = [] as Array<Items>;
  itemUnitreturnField = 'unit';
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  pageId = 0;
  voucherNo = 0;
  referenceFillData = [] as Array<Reference>;

  voucherTypeData = [] as Array<VoucherType>;
  partyData = [] as Array<Supplier>;

  //for checking permissions
  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;
  tipContent: any = '';
  showImportReferencePopup = false;
  noGridItem = true;
  showCancelPopup = false;
  showDeletePopup = false;
  cancelReason: string = '';
  multiCurrencySupport = 1;
  itemUnitKeys = ['Unit', 'Basic Unit', 'Factor'];
  firstStockTransfer!: number;
  formattedDate = this.today.toISOString().split('T')[0];

  // Add this property to store original data
  originalItemList: any[] = [];

  openImportReferencePopup() {
    console.log('we have entered into openImportReferencePopup()');
    this.importedReferenceList = [];
    this.isReferenceImported = false;
    this.currentStockInfo = [];
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showImportReferencePopup = true;
  }

  closeImportReferencePopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showImportReferencePopup = false;
  }

  onSelectLeftTable(event: any) {}
  onClickStock(event: any): void {
    if (event.type === 'click') {
      this.selectedStockId = event.row.ID;
      console.log('our selected id is ' + this.selectedStockId);
      this.fetchStockById();
    }
  }
  //data from the left side click
  fetchStockById(): void {
    //this.isLoading = true;
    this.StockTransferService.getDetails(
      EndpointConstant.FILLPURCHASEBYID +
        this.selectedStockId +
        '&pageId=' +
        this.pageId
    )
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentStock = response?.data;
          console.log(
            'this is data from the api on left side quick' +
              JSON.stringify(this.currentStock, null, 2)
          );
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
    this.referenceData =
      this.currentStock?.transaction.fillVoucherAllocationUsingRef;
    this.formatteddate2 = transactionDetails.date.toString().split('T')[0];
    this.stockTransferForm.patchValue({
      vouchername: this.vocherName,
      voucherno: transactionDetails.transactionNo,
      voucherdate: this.formatteddate2 ? this.formatteddate2 : null,
      reference: transactionDetails.referenceNo,
      fromwarehouse: transactionAddditional.inLocID,

      description: transactionDetails.description,
      terms: transactionAddditional.terms,
    });
    this.formVoucherNo = transactionDetails.transactionNo;
    this.isStockTransferCancelled = transactionDetails.cancelled;
    if (this.fillStockItemsData.length > 0) {
      this.setGridDetailsFromFill(this.invTransactions);
    }
    this.calculateQantityTotal();
    this.calculateAmountTotal();
    this.calculateTaxValue();
  }
  onChangeCurrency(event: any) {
    let currencyId = event.target.value;
    let currencyObj = this.currencyDropdown.find(
      (currency: any) => currency.currencyID == currencyId
    );
    this.currentCurrencyRate = currencyObj.currencyRate;
    this.currentcurrencyObj = {
      id: currencyObj.currencyID,
      value: currencyObj.abbreviation,
    };
    this.selectedCurrencyId = currencyObj.currencyID;
  }
  fetchCurrencyDropdown() {
    if (this.multiCurrencySupport) {
      this.StockTransferService.getDetails(
        EndpointConstant.FILLMULTICURRENCYDROPDOWN
      )
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            this.currencyDropdown = response?.data;
            this.currentCurrencyRate = this.currencyDropdown?.[0].currencyRate;
            this.currentcurrencyObj = {
              id: this.currencyDropdown?.[0].currencyID,
              value: this.currencyDropdown?.[0].abbreviation,
            };
            this.selectedCurrencyId = this.currencyDropdown?.[0].currencyID;
          },
          error: (error) => {
            console.error('An Error Occured', error);
          },
        });
    }
  }

  saveCurrencyRate() {
    //currency id and currency rate
    if (
      confirm(
        'Are you sure you want to update exchange rate for this currency?'
      )
    ) {
      this.StockTransferService.updateDetails(
        EndpointConstant.UPDATEEXCHANGERATE +
          this.selectedCurrencyId +
          '&exchRate=' +
          this.currentCurrencyRate,
        {}
      )
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
  saveReferenceData(response: any) {
    //push reference list array...
    this.referenceListarray = response?.referenceList;
    if (Object.keys(response).length > 0) {
      if (response?.referenceVNoList.length > 0) {
        let refText = response?.referenceVNoList.join(', ');
        this.stockTransferForm.patchValue({
          reference: refText,
        });
      }

      //set item details to grid..
      //check item already exists..
      if (response?.itemListArray.length > 0) {
        if (
          this.itemDetails.length == 1 &&
          this.itemDetails[0].itemCode == ''
        ) {
          this.itemDetails = [];
        }
        this.importedReferenceList = response?.itemListArray;
        // overwrite form details only if overwritevoucher info is true..
        if (response?.isOverwriteVoucher) {
          this.currentStockInfo =
            this.importedReferenceList[this.importedReferenceList.length - 1];
          //   //setting form data is overwrite option is true..
          let transactionId = this.currentStockInfo.TransactionID;
          //   this.fetchTransactionDetailsById(transactionId);
          // } else{
          //this.fetchTransactionDetailsById(transactionId);
          this.setItemDetailsFromImportReference();
          this.addRow();
        }
      }
    }

    this.renderer.removeStyle(document.body, 'overflow');
    this.showImportReferencePopup = false;
  }

  setGridDetailsFromFill(invTransactions: any) {
    console.log(
      'we have entered in to set grid details from the fill lenght of invtransitems is ' +
        invTransactions.lenght
    );
    if (invTransactions.length > 0) {
      this.itemDetails = [];

      invTransactions.forEach((trn: any) => {
        let unitInfoOptions: any[] = [];
        console.log(
          'this is my fillstockItmesdata',
          JSON.stringify(this.fillStockItemsData, null, 2)
        );

        // Populate unit options based on matching itemCode
        this.fillStockItemsData.forEach((iteminfo: any) => {
          console.log('this is iteminfo', JSON.stringify(iteminfo, null, 2));
          if (iteminfo.item.itemCode === trn.itemCode) {
            iteminfo.unitPopup.forEach((unitInfo: any) => {
              unitInfoOptions.push({
                unit: unitInfo.unit,
                basicUnit: unitInfo.basicUnit,
                factor: unitInfo.factor,
              });
            });
          }
        });

        // Find the matching unit object for the transaction unit
        const itemunitObj = unitInfoOptions.find(
          (unit: any) => unit.unit === trn.unit
        );
        console.log(JSON.stringify(invTransactions, null, 2));
        // Map properties to the grid item
        const gridItem = {
          ...this.stockItemDto,
          transactionId: trn.transactionId,
          itemId: trn.itemId,
          itemCode: trn.itemCode,
          itemName: trn.itemName,
          unit: {
            unit: itemunitObj?.unit || '',
            basicUnit: itemunitObj?.basicUnit || '',
            factor: itemunitObj?.factor || 1,
          },
          qty: Number(trn.qty),
          rate: this.baseService.formatInput(Number(trn.rate)),
          amount: this.baseService.formatInput(Number(trn.amount)),

          stockQty: trn.stockQty || 0,
          basicQty: trn.basicQty || 0,
          pcs: trn.pcs || 0,
          sizeMaster: { id: null },
          taxTypeId: trn.taxTypeId || 0,
          taxPerc: trn.taxPerc || 0,
          taxValue: trn.taxValue || 0,
          expiryDate: trn.expiryDate,
          taxAccountId: trn.taxAccountId || 0,

          uniqueItems: trn.uniqueItems || [],
        };
        console.log('our date is ' + trn.expiryDate);

        this.itemDetails.push(gridItem);
      });

      this.itemDetails.push({ ...this.stockItemDto });
      console.log(
        'item details is ' + JSON.stringify(this.itemDetails, null, 2)
      );
      this.noGridItem = false;
      this.currentItemTableIndex = this.itemDetails.length - 1;

      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
      this.originalItemList = [...this.tempItemFillDetails];
    }
    this.calculateQantityTotal();
    this.calculateAmountTotal();
    this.calculateTaxValue();
  }
  onPurchaseTabChange(event: MatTabChangeEvent) {}

  filterStockTransfer(event: any) {
    const val = event.target.value.toLowerCase();

    // filter our data
    const temp = this.tempStockList.filter(function (d: any) {
      const trNoMatch = d.TransactionNo.toString()
        .toLowerCase()
        .includes(val.toLowerCase());
      return trNoMatch || !val;
    });

    // update the rows
    this.stockMasterList = temp;
    // Whenever the filter changes, always go back to the first page
    //this.table.offset = 0;
  }
  itemCodeKeys = [
    'Item Code',
    'Item Name',
    'Bar Code',
    'ID',
    'Unit',
    'Stock',
    'Rate',
    'Purchase Rate',
  ];
  tablecolumns = [
    { name: 'SlNo', field: 'id' },
    { name: 'Item Code', field: 'itemcode' },
    { name: 'Item Name', field: 'itemname' },
    { name: 'Unit', field: 'unit' },
    { name: 'Qty', field: 'qty' },
    { name: 'Rate', field: 'rate' },
    { name: 'Amount', field: 'amount' },
    { name: 'Tax%', field: 'Tax%' },
    { name: 'TaxValue', field: 'TaxValue' },
    { name: 'ExpiryDate', field: 'ExpiryDate' },
  ];
  onFormKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key == 'Enter') {
      event.preventDefault();
      // if(index == -1){
      //   this.moveFocusToItemGrid();
      // } else{
      //   this.focusOnTabIndex(index);
      // }
    }
  }

  onClickNewStockTransfer() {
    if (!this.isCreate) {
      alert('Permission Denied!');
      return false;
    }
    if (this.isInputDisabled == false) {
      if (!confirm('Are you sure you want to cancel the New mode?')) {
        return false;
      }
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.stockTransferForm.reset();
    this.selectedStockId = 0;
    this.itemDetails = [];
    this.isStockTransferCancelled = false;

    if (this.isInputDisabled == true) {
      this.disbaleFormControls();
      this.selectedStockId = this.firstStockTransfer;
      this.fetchStockById();
    } else {
      this.itemDetails = [];
      this.stockTransferForm.patchValue({
        voucherdate: this.today,
      });
      this.addRow();
      this.enableFormControls();
      this.fetchCommonData();
    }
    return true;
  }

  handleDoubleClick(event: any) {
    if (
      this.currentColumname != 'itemname' &&
      this.currentColumname != 'amount'
    ) {
      this.enableInlineEditing = true;
    }
  }
  // openImportReferencePopup(){
  //   console.log('we have entered into openImportReferencePopup()');

  //   this.importedReferenceList = [];
  //   this.isReferenceImported = false;
  //   this.currentStockInfo = [];
  //   this.renderer.setStyle(document.body, 'overflow', 'hidden');
  //   this.showImportReferencePopup = true;
  // }
  FillReferenceData() {
    console.log('we have entered into fillreferenceDate');
    console.log('my voucher no is ' + this.voucherNo);
    this.StockTransferService.getDetails(
      EndpointConstant.FILLREFERENCEDATA + this.voucherNo
    )
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.referenceFillData = response?.data;
          console.log(JSON.stringify(response.data, null, 2));
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  onClickEditStockTransfer() {
    if (!this.isEdit) {
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    //need to edit
    // this.isUpdate = !this.isInputDisabled;
    // this.isUnitsOpen = false;

    // this.unitsInGrid = [];

    // this.selectedBranchId = 0;
    // this.filledBranchId = 0;
    // this.selectedBranches = [];
    if (this.isInputDisabled == false) {
      this.enableFormControls();
    } else {
      this.disbaleFormControls();
    }
    this.fetchStockById();
    return true;
  }
  toggleDeleteOptions() {
    this.showDeleteOptions = !this.showDeleteOptions;
  }
  onClickDeleteStockTransfer(event: Event) {
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
  onClickCancelStockTransfer(event: Event) {
    event.preventDefault();
    if (!this.isCancel) {
      alert('Permission Denied!');
      return false;
    }
    this.showCancelPopup = true;
    this.toggleDeleteOptions();
    return true;
  }

  onClickPrint() {
    console.log('print');
  }
  onClickPreview() {
    console.log('preview');
  }
  enableFormControls() {
    this.stockTransferForm.get('voucherdate')?.enable();
    // this.stockTransferForm.get('reference')?.enable();
    // // this.stockTransferForm.get('tobranch')?.enable();
    // // this.stockTransferForm.get('frombranch')?.enable();
    // this.stockTransferForm.get('towarehouse')?.enable();
    this.stockTransferForm.get('fromwarehouse')?.enable();
    // this.stockTransferForm.get('description')?.enable();
    this.stockTransferForm.get('terms')?.enable();
    this.stockTransferForm.get('reference')?.enable();
  }

  disbaleFormControls() {
    this.stockTransferForm.get('voucherdate')?.disable();
    // this.stockTransferForm.get('reference')?.disable();
    // this.stockTransferForm.get('tobranch')?.disable();
    // this.stockTransferForm.get('frombranch')?.disable();
    // this.stockTransferForm.get('towarehouse')?.disable();
    this.stockTransferForm.get('fromwarehouse')?.disable();
    // this.stockTransferForm.get('description')?.disable();
    this.stockTransferForm.get('terms')?.disable();
    this.stockTransferForm.get('reference')?.disable();
  }

  updateCallback(payload: any) {
    this.StockTransferService.updateDetails(
      EndpointConstant.UPDATESTOCKADJUSTMENT +
        this.voucherNo +
        '&pageId=' +
        this.pageId,
      payload
    )
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
          console.error('Error Updating Stock Transfer');
          alert('Failed to Update Stock Transfer.');
        },
        complete: () => {
          this.fetchStockTransferMaster();
          this.setInitialState();
          this.onClickNewStockTransfer();
        },
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
  createCallback(payload: any) {
    console.log('Payload:', JSON.stringify(payload, null, 2));
    this.StockTransferService.saveDetails(
      EndpointConstant.SAVESTOCKADJUSTMENT +
        this.voucherNo +
        '&pageId=' +
        this.pageId,
      payload
    )
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status];
          alert(message);
        },
        error: () => {
          this.isLoading = false;
          console.error('Error saving Stock Transfer');
          alert('Failed to save Stock Transfer.');
        },
        complete: () => {
          this.fetchStockTransferMaster();
          this.setInitialState();
          this.onClickNewStockTransfer();
        },
      });
  }
  onClickSaveStockTransfer() {
    const dateValue = this.stockTransferForm.get('voucherdate')?.value;
    if (dateValue == null) {
      alert('Enter Voucher Date and Proceed');
      return;
    }

    const fromWh = this.stockTransferForm.get('fromwarehouse')?.value;
    if (fromWh == null) {
      alert('Select From Warehouse and Proceed');
      return;
    }

    // const toWh = this.stockTransferForm.get('towarehouse')?.value;
    // if (toWh == null) {
    //   alert("Select To Warehouse and Proceed");
    //   return;
    // }

    if (this.stockTransferForm.get('fromwarehouse')?.value) {
      this.warehouseData.forEach((element: any) => {
        if (element.id == this.stockTransferForm.get('fromwarehouse')?.value) {
          this.selectedFromWarehouseObj = {
            id: element.id,
            value: element.name,
          };
        }
      });
    }

    const filteredItems = this.tempItemFillDetails.filter(
      (item: any) => item.itemId && item.itemId !== 0
    );
    if (filteredItems.length < 1) {
      alert('Please enter items and Proceed');
      return;
    }
    const checkUnit = filteredItems.some((item: any) => !item.unit);
    if (checkUnit) {
      alert('Check whether the unit field is empty and Proceed');
      return;
    }
    const checkQty = filteredItems.some(
      (item: any) => item.qty == null || item.qty < 1
    );
    console.log('Qty:' + checkQty);
    if (checkQty) {
      alert('Check whether the Qty field is empty or zero and Proceed');
      return;
    }

    const payload = {
      id: 0,
      voucherNo: this.vno,
      date: this.today,
      currency: {
        id: null,
        value: 'string',
      },
      exchangeRate: 0,
      items: filteredItems,

      references: this.referenceListarray,

      warehouse: this.selectedFromWarehouseObj,
      // {
      //   "id": this.selectedFromWarehouseObj,
      //   "value": "Warehouse-1(WH-1)"
      // },
      description: 'string',
      terms: this.stockTransferForm.value.terms,
    };

    if (this.isUpdate) {
      this.updateCallback(payload);
    } else {
      this.createCallback(payload);
    }
    return true;
  }
  fetchItemUnits(itemId: any, rowIndex: any) {
    this.StockTransferService.getDetails(
      EndpointConstant.FETCHPURCHASEITEMUNITDETAILS +
        itemId +
        '&BranchId=' +
        this.currentBranch
    )
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let unitsArr = response?.data;
          let unitOptions: any = [];
          unitsArr.forEach((unitInfo: any) => {
            unitOptions.push({
              unit: unitInfo.unit,
              basicunit: unitInfo.basicUnit,
              factor: unitInfo.factor,
            });
          });
          this.itemDetails[rowIndex]['unitsPopup'] = unitOptions;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchStockTransferMaster(): void {
    this.isLoading = true;
    this.StockTransferService.getDetails(
      EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true'
    )
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.stockMasterList = response?.data;
          this.tempStockList = [...this.stockMasterList];
          this.firstStockTransfer = this.stockMasterList[0].ID;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }
  fetchMenuDataPermissions() {
    let menuData = this.menudataService.getMenuDataFromStorage(
      Number(this.pageId)
    );
    this.isView = menuData.isView;
    this.isCreate = menuData.isCreate;
    this.isEdit = menuData.isEdit;
    this.isDelete = menuData.isDelete;
    this.isCancel = menuData.isCancel;
    this.isEditApproved = menuData.isEditApproved;
    this.isHigherApproved = menuData.isHigherApproved;
  }

  onItemUnitSelected(option: any, rowIndex: any) {
    let unitPopup = this.itemDetails[rowIndex]['unitsPopup'];
    let unitObj = unitPopup.find((unit: any) => unit.unit === option);
    this.itemDetails[rowIndex]['unit'] = unitObj;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    //this.stockItemDto= this.tempItemFillDetails;
  }
  onColumKeyDown(event: KeyboardEvent): void {}

  onChangeQuantity(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const rate = this.itemDetails[rowIndex]['rate'];
    let qty = event.target.value;
    this.itemDetails[rowIndex]['qty'] = qty;
    this.calculateItemAmount(rowIndex);
    this.calculateQantityTotal();
    this.calculateAmountTotal();
    this.calculateTaxValueGrid(rowIndex);
    this.calculateTaxValue();
  }
  onItemCodeSelected(option: any, rowIndex: number) {
    if (option != '') {
      let selectedItemObj: any = {};
      console.log();
      console.log(
        'this is our fillstockItems Data',
        JSON.stringify(this.fillStockItemsData, null, 2)
      );
      this.fillStockItemsData.forEach((itemInfo: any) => {
        if (itemInfo.item.itemCode === option) {
          let unitInfoOptions: any = [];
          itemInfo.unitPopup.forEach((unitInfo: any) => {
            let unitObj = {
              unit: unitInfo.unit,
              basicunit: unitInfo.basicUnit,
              factor: unitInfo.factor,
            };
            unitInfoOptions.push(unitObj);
          });
          let firstUnit = itemInfo.unitPopup[0];
          // selectedItemObj = {  };
          selectedItemObj.transactionId = itemInfo.item.transactionId;
          selectedItemObj.itemId = itemInfo.item.id;
          selectedItemObj.itemCode = itemInfo.item.itemCode;
          selectedItemObj.itemName = itemInfo.item.itemName;
          selectedItemObj.qty = itemInfo.item.qty;
          selectedItemObj.unit = firstUnit;
          selectedItemObj.unitsPopup = unitInfoOptions;
          selectedItemObj.rate = itemInfo.item.purchaseRate;
          selectedItemObj.amount = 0.0;
          selectedItemObj.stockQty = 0;
          selectedItemObj.basicQty = 0;
          selectedItemObj.pcs = 0;
          selectedItemObj.sizeMaster = {};
          selectedItemObj.taxTypeId = 0;
          selectedItemObj.expiryDate = itemInfo.item.expiryDate;
          selectedItemObj.taxPerc = itemInfo.item.taxPerc;
          selectedItemObj.taxValue = itemInfo.item.taxValue;
          selectedItemObj.taxAccountId = 0;
          selectedItemObj.uniqueItems = [];
        }
      });
      this.itemDetails[rowIndex] = selectedItemObj;
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
      this.calculateItemAmount(rowIndex);
      this.calculateTaxValueGrid(rowIndex);

      this.addRow(true);

      if (selectedItemObj.rate == 0) {
        this.dialog.open(CustomDialogueComponent, {
          width: '300px',
          height: '200px',
          data: {
            message: 'Rate is zero',
            key: 'custom',
          },
        });
      }
      this.calculateQantityTotal();
      this.calculateAmountTotal();
      this.calculateTaxValue();
    }
  }

  validateItemGridEntry() {
    const warehouseId = this.stockTransferForm.get('fromwarehouse')?.value;
    if (!warehouseId) {
      alert('Please select location');
      return false;
    }
    return true;
  }
  calculateItemAmount(rowIndex: number) {
    let qty = this.itemDetails[rowIndex]['qty'];
    let rate = this.itemDetails[rowIndex]['rate'];
    let amount = qty * rate;

    this.itemDetails[rowIndex]['amount'] = amount;
  }
  onChangeRate(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const qty = this.itemDetails[rowIndex]['qty'];
    let rate = event.target.value;
    this.itemDetails[rowIndex]['rate'] = rate;
    this.calculateItemAmount(rowIndex);
    this.calculateAmountTotal();
    this.calculateTaxValueGrid(rowIndex);
    this.calculateTaxValue();
  }

  onRateBlur(rowIndex: any, event: any) {}
  onClickSpan(event: any, rowIndex: number, colIndex: number): void {
    this.enableInlineEditing = false;
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditing();

    setTimeout(() => {
      this.gridnavigationService.focusCell(
        this.gridCells.toArray(),
        this.currentRowIndex,
        this.currentColIndex
      );
    });
  }
  onClickInput(event: any, rowIndex: number, colIndex: number): void {
    this.currentRowIndex = rowIndex;
    this.currentColIndex = colIndex;
    // Ensure the focus logic is executed after the DOM updates

    //set crrent column nmae ..
    this.handleKeysForInlineEditing();

    setTimeout(() => {
      this.gridnavigationService.focusCell(
        this.gridCells.toArray(),
        this.currentRowIndex,
        this.currentColIndex
      );
    });
  }

  callKeydownEventToDropdown(fieldName: any, event: KeyboardEvent): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(
      (dropdown) => dropdown.fieldName === fieldName
    );
    if (fieldDropdown) {
      fieldDropdown.onKeyDown(event);
    }
  }
  moveFocusToDropdown(fieldName: any): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(
      (dropdown) => dropdown.fieldName === fieldName
    );
    if (fieldDropdown) {
      fieldDropdown.focusInput();
    }
  }
  focusOnTabIndex(tabIndex: number): void {
    const element = document.querySelector(
      `[tabindex="${tabIndex}"]`
    ) as HTMLElement;
    if (element) {
      element.focus(); // Focus the element with the given tabindex
    }
  }
  addRow(itemcodesel = false, event?: KeyboardEvent) {
    const allItemCodesFilled = this.itemDetails.every(
      (item) => item.itemCode && item.itemCode.trim() !== ''
    );

    if (!allItemCodesFilled) {
      if (event && event.key === 'Enter') {
        this.currentColIndex = -1;
        this.currentRowIndex = -1;
        this.focusOnTabIndex(13);
      }
      return false; // Exit the function if any itemCode is empty
    }
    this.itemDetails.push(this.stockItemDto);
    this.currentItemTableIndex = this.itemDetails.length - 1;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    this.stockItemDto = this.tempItemFillDetails;

    if (!itemcodesel) {
      //set row and column index....
      this.currentRowIndex++;
      this.currentColIndex = 0;
      this.scrollToCell(this.currentRowIndex, this.currentColIndex); // Reset column index to 0 for the new row
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
          message: 'Rate is zero',
          key: 'custom',
        },
      });
    }
  }
  stockItemDto: StockItemDto = {
    itemId: 0,
    transactionId: 0,
    itemCode: '',
    itemName: '',
    unit: {
      unit: '',
      basicUnit: '',
      factor: 1,
    },
    qty: 0,
    rate: 0,
    stockQty: 0,
    basicQty: 0,
    amount: 0,
    pcs: 0,
    sizeMaster: {
      id: 1,
      name: '',
      code: '',
      description: '',
    },
    taxTypeId: 0,
    taxPerc: 0,
    taxValue: 0,

    taxAccountId: 0,
    uniqueItems: [
      {
        uniqueNumber: '',
      },
    ],
  };
  deleteItemGrid(index: any) {
    if (confirm('Are you sure you want to delete this details?')) {
      if (this.itemDetails.length == 1) {
        this.noGridItem = true;
        this.itemDetails = [];
        this.itemDetails.push(this.stockItemDto);
      } else if (index !== -1) {
        this.itemDetails.splice(index, 1);
        this.selected = [];
      }
      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];

      this.selectedRowIndex = -1;
    }
    return true;
  }
  scrollToCell(rowIndex: number, colIndex: number): void {
    const cellId = `cell-${rowIndex}-${colIndex}`;
    const cellElement = document.getElementById(cellId);
    if (cellElement) {
      cellElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }
  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(
      this.gridCells.toArray(),
      rowIndex,
      colIndex
    );
  }
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
  toggleLeftSection() {
    this.showLeftSection = !this.showLeftSection;
    // Trigger the recalculation on window resize
    setTimeout(() => this.ngxTable.recalculate(), 0);
    setTimeout(() => this.setSummaryCellWidths(), 0);
  }
  calculateTaxValueGrid(index: number) {
    let taxValue = this.itemDetails[index]['amount'];
    let taxPerc = this.itemDetails[index]['taxPerc'];
    let taxAmount = (taxValue * taxPerc) / 100;
    this.itemDetails[index]['taxValue'] = taxAmount;

    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    // this.stockItemDto = this.tempItemFillDetails;
  }
  setSummaryCellWidths() {
    setTimeout(() => {
      if (this.tableWrapper && this.summaryCells) {
        const tableWrapperElement = this.tableWrapper.nativeElement;
        const totalWidth = tableWrapperElement.offsetWidth;
        const totalColumns = this.summaryCells.length;
        const tableHeaderCells =
          this.tableWrapper.nativeElement.querySelectorAll(
            'datatable-body-cell'
          );

        this.summaryCells.forEach((cell, index) => {
          const columnWidth = totalWidth / totalColumns + 10;
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
    if (
      targetElement instanceof HTMLInputElement ||
      targetElement instanceof HTMLTextAreaElement
    ) {
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
              this.currentColIndex = this.tablecolumns.findIndex(
                (col) => col.field === 'qty'
              );
              this.scrollToCell(this.currentRowIndex, this.currentColIndex);
              this.enableInlineEditing = false;
              this.focusGridCell(this.currentRowIndex, this.currentColIndex);
              break;
            } else if (
              this.tempItemFillDetails[this.currentRowIndex]['rate'] == 0
            ) {
              this.currentColIndex = this.tablecolumns.findIndex(
                (col) => col.field === 'rate'
              );
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
              this.currentColIndex = this.tablecolumns.findIndex(
                (col) => col.field === 'rate'
              );
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
          if (
            columnName == 'itemcode' ||
            columnName == 'stockitem' ||
            columnName == 'unit' ||
            columnName == 'pricecategory' ||
            columnName == 'sizemasterid'
          ) {
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
            const columnKeyName = cellElement.getAttribute(
              'data-column-key-name'
            );
            if (columnName != null) {
              this.currentColumname = columnName;
            }
            if (
              this.enableInlineEditing == false &&
              columnName != 'id' &&
              columnName != 'itemname' &&
              columnName != 'amount'
            ) {
              this.enableInlineEditing = true;
              setTimeout(() => {
                const cellElement = document.getElementById(cellId);
                let newValue = event.key;
                // Check if the key is a character key
                const isCharacterKey = event.key.length === 1;
                if (
                  (cellElement instanceof HTMLInputElement ||
                    cellElement instanceof HTMLTextAreaElement) &&
                  isCharacterKey
                ) {
                  // If it's an input or textarea, set the value
                  cellElement.value = newValue;
                  if (columnKeyName !== null && columnKeyName !== undefined) {
                    if (columnName == 'unit') {
                      this.tempItemFillDetails[this.currentRowIndex][
                        columnKeyName
                      ]['unit'] = event.key;
                    } else if (columnName == 'pricecategory') {
                      this.tempItemFillDetails[this.currentRowIndex][
                        columnKeyName
                      ]['name'] = event.key;
                    } else if (columnName == 'sizemasterid') {
                      this.tempItemFillDetails[this.currentRowIndex][
                        columnKeyName
                      ]['name'] = event.key;
                    } else {
                      let tempRow = {
                        ...this.tempItemFillDetails[this.currentRowIndex],
                      };
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
  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
  }
  ngOnInit(): void {
    this.stockTransferForm = this.formBuilder.group({
      vouchername: [{ value: '', disabled: true }],
      voucherno: [{ value: '', disabled: true }],
      voucherdate: [
        { value: this.formattedDate, disabled: this.isInputDisabled },
        Validators.required,
      ],
      reference: [{ value: '', disabled: this.isInputDisabled }],
      salesman: [{ value: '', disabled: this.isInputDisabled }],
      fromwarehouse: [{ value: '', disabled: this.isInputDisabled }],
      // tobranch: [{ value: '', disabled: this.isInputDisabled }],
      // frombranch: [{ value: '', disabled: this.isInputDisabled }],
      // description: [{ value: '', disabled: this.isInputDisabled }],
      terms: [{ value: '', disabled: this.isInputDisabled }],
    });
    //1.this newdata and loading warehouses
    this.fetchCommonData();
    //2.this is leftside fill
    this.fetchStockTransferMaster();
    //3.fetchitem filldata
    this.fetchItemFillData();
    this.onClickNewStockTransfer();
    this.fetchCurrencyDropdown();
    //for calculating total
  }

  calculateQantityTotal() {
    console.log('we have entered in to calculateQantityTotal');
    let total = 0;
    this.itemDetails.forEach((item) => {
      const qty = parseFloat(item.qty); // Safely parse as a floating-point number
      if (!isNaN(qty)) {
        total += qty; // Only add valid numbers
      } else {
        console.warn(`Invalid quantity found: ${item.qty}`); // Warn if qty is invalid
      }
    });

    // Format total and update qtyTotal
    this.qtyTotal = this.baseService.formatInput(total);
    console.log('Total:', total);
    console.log('Formatted QtyTotal:', this.qtyTotal);
  }
  calculateAmountTotal() {
    let Amounttotal = 0;
    this.itemDetails.forEach((item) => {
      const amount = parseFloat(item.amount); // Safely parse as a floating-point number
      if (!isNaN(amount)) {
        Amounttotal += amount; // Only add valid numbers
      } else {
        console.warn(`Invalid quantity found: ${item.amount}`); // Warn if qty is invalid
      }
    });

    // Format total and update qtyTotal
    this.Amttotal = this.baseService.formatInput(Amounttotal);
    console.log('Total:', Amounttotal);
    console.log('Formatted QtyTotal:', this.Amttotal);
  }
  calculateTaxValue() {
    let Taxtotal = 0;
    this.itemDetails.forEach((item) => {
      const taxValue = parseFloat(item.taxValue); // Safely parse as a floating-point number
      if (!isNaN(taxValue)) {
        Taxtotal += taxValue; // Only add valid numbers
      } else {
        console.warn(`Invalid quantity found: ${item.taxValue}`); // Warn if qty is invalid
      }
    });

    // Format total and update qtyTotal
    this.TAXTOTAL = this.baseService.formatInput(Taxtotal);
    console.log('Total:', Taxtotal);
    console.log('Formatted QtyTotal:', this.TAXTOTAL);
  }

  //date
  convertToDateInputFormat(dateString: string): string {
    if (!dateString) return ''; // Return empty if no date exists

    const parts = dateString.split('/');
    if (parts.length === 3) {
      // Assuming the date is in 'DD/MM/YYYY' format, convert it to 'YYYY-MM-DD'
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    // If it's already in 'YYYY-MM-DD', just return it
    return dateString;
  }
  // updateDueDate(newDate: string, row: any) {
  //   if (newDate) {
  //     // Assuming you want to store the date in 'DD/MM/YYYY' format
  //     const parts = newDate.split('-');
  //     row.dueDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

  //   } else {
  //     row.dueDate = '';  // Handle empty date
  //   }
  // }
  updateDueDate(newDate: string, row: any) {
    if (newDate) {
      // Convert the date to a proper format and update both expiryDate and ExpiryDate
      row.expiryDate = new Date(newDate);
      row.ExpiryDate = new Date(newDate);

      // Refresh the grid data if needed
      this.tempItemFillDetails = [...this.tempItemFillDetails];
    } else {
      row.expiryDate = null;
      row.ExpiryDate = null;
    }
  }

  // onChangeDate(rowIndex: any, event: any) {
  //   let date = event.target.value;
  //   this.tempItemFillDetails[rowIndex]['ExpiryDate'] = date;
  // }
  onChangeDate(rowIndex: number, event: any) {
    const date = event.target.value;
    if (date) {
      // Update both expiryDate and ExpiryDate in the grid data
      // this.tempItemFillDetails[rowIndex].expiryDate = new Date(date);
      this.tempItemFillDetails[rowIndex].ExpiryDate = new Date(date);

      // Refresh the grid data
      this.tempItemFillDetails = [...this.tempItemFillDetails];
    }
  }

  fetchItemFillData() {
    console.log('we have entered in to fetchItemFillData');

    const warehouseId = this.stockTransferForm.get('fromwarehouse')?.value;
    const dateValue = this.stockTransferForm.get('voucherdate')?.value;
    if (dateValue == null) {
      alert('Enter Voucher Date and Proceed');
    }
    this.voucherDate = this.datePipe.transform(dateValue, 'dd-MM-yyyy');
    console.log(
      'FillItems:' +
        EndpointConstant.FILLSTOCKITEMS +
        this.voucherNo +
        '&VoucherDate=' +
        this.voucherDate +
        '&LocationID=' +
        warehouseId
    );
    this.StockTransferService
      //.getDetails(EndpointConstant.FILLSTOCKITEMS + this.voucherNo + '&VoucherDate=01-11-2024&LocationID=61')
      .getDetails(
        EndpointConstant.FILLSTOCKITEMS +
          this.voucherNo +
          '&VoucherDate=05-11-2024&LocationID=' +
          this.locId
      )
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response: any) => {
          let responseData = response?.data.items;

          let itemData = responseData.map((item: any) => {
            let unitObj = item.unitPopup.find(
              (unit: any) => unit.unit === item.item.unit
            );

            return {
              itemCode: item.item.itemCode,
              itemName: item.item.itemName,
              barCode: item.item.barCode,
              id: item.item.id,
              unitname: unitObj?.unit,
              stock: item.item.stock,
              rate: item.item.rate,
              purchaseRate: item.item.purchaseRate,
              unit: unitObj
                ? {
                    unit: unitObj.unit,
                    basicUnit: unitObj.basicUnit,
                    factor: unitObj.factor,
                  }
                : {},
            };
          });

          // push our inital complete list
          this.fillStockItemsData = responseData;
          this.fillItemDataOptions = itemData;

          this.setItemDetailsFromImportReference();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  setItemDetailsFromImportReference() {
    // Set item details if import reference details are there
    if (this.importedReferenceList.length > 0 && !this.isReferenceImported) {
      this.importedReferenceList.forEach((element: any) => {
        const itemExists = this.itemDetails.some(
          (existingItem: any) =>
            existingItem.transactionId === element.TransactionID &&
            existingItem.itemId === element.ItemID
        );

        if (!itemExists) {
          let unitInfoOptions: any[] = [];

          // Populate unit options based on the matching itemCode
          this.fillStockItemsData.forEach((itemInfo: any) => {
            if (itemInfo.item.itemCode === element.ItemCode) {
              itemInfo.unitPopup.forEach((unitInfo: any) => {
                unitInfoOptions.push({
                  unit: unitInfo.unit,
                  basicUnit: unitInfo.basicUnit,
                  factor: unitInfo.factor,
                });
              });
            }
          });

          const unitObj = unitInfoOptions.find(
            (unit: any) => unit.unit === element.Unit
          );

          let insertItem: any = {};
          insertItem.itemId = element.ItemID;
          insertItem.itemCode = element.ItemCode;
          insertItem.itemName = element.ItemName;
          insertItem.unit = {
            unit: unitObj?.unit || element.Unit || '',
            basicUnit: unitObj?.basicUnit || '',
            factor: unitObj?.factor || 1,
          };
          insertItem.qty = Number(element.Qty);
          insertItem.rate = this.baseService.formatInput(Number(element.Rate));
          insertItem.amount = this.baseService.formatInput(
            Number(element.Amount)
          );
          insertItem.taxPerc = null;
          insertItem.taxValue = this.baseService.formatInput(
            Number(element.TaxValue)
          );
          insertItem.transactionId = element.TransactionID;
          insertItem.taxAccountId = null;
          insertItem.uniqueItems = [];
          insertItem.sizeMaster = {};

          this.itemDetails.push(insertItem);

          if (unitInfoOptions.length === 0) {
            this.fetchItemUnits(element.ItemID, this.itemDetails.length - 1);
          }

          const rowIndex = this.itemDetails.length - 1;
          this.calculateItemAmount(rowIndex);
        }
        this.calculateQantityTotal();
        this.calculateAmountTotal();
        this.calculateTaxValue();
      });

      // Remove any empty item with default values from itemDetails
      this.itemDetails = this.itemDetails.filter(
        (item) => item.itemId !== 0 || item.itemCode !== ''
      );

      // Update tempItemFillDetails with filtered itemDetails
      this.tempItemFillDetails = [...this.itemDetails];
      // Store original data
      this.originalItemList = [...this.tempItemFillDetails];

      this.noGridItem = false;
      this.currentItemTableIndex = this.itemDetails.length - 1;
      this.isReferenceImported = true;
    }
    //this.addRow();
  }
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
    this.calculateTaxValue();
  }
  fetchCommonData() {
    this.enableFormControls();
    this.StockTransferService.getDetails(
      EndpointConstant.FILLCOMMONPURCHASEDATA +
        this.pageId +
        '&voucherId=' +
        this.voucherNo
    )
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.voucherFillData = response?.data;
          //console.log('this is data from the  api'+JSON.stringify(this.voucherFillData,null,2));

          //setting voucher data..
          this.vocherName = this.voucherFillData.vNo?.code;
          this.warehouseData = this.voucherFillData?.wareHouse;
          this.stockTransferForm.patchValue({
            vouchername: this.vocherName,
            voucherno: this.voucherFillData.vNo?.result,
            voucherdate: this.formattedDate,
          });
          this.vno = this.voucherFillData.vNo?.result;
          console.log('my vno is ' + this.vno);

          if (this.warehouseData?.length > 0) {
            console.log(
              'this is my warehouses' + JSON.stringify(this.warehouseData)
            );
            this.stockTransferForm.patchValue({
              fromwarehouse: this.warehouseData[0].id,
            });
          }
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
    this.FillReferenceData();
  }

  onChangeWarehouse() {
    const warehouseId = this.stockTransferForm.get('fromwarehouse')?.value;
  }
  handleKeysForInlineEditing() {
    // Handle other keys for inline editing
    const cellid = 'cell-' + this.currentRowIndex + '-' + this.currentColIndex;
    const cellelement = document.getElementById(cellid);
    if (cellelement) {
      const columnName = cellelement.getAttribute('data-column-name');
      if (columnName != null) {
        this.currentColumname = columnName;
      }
    }
  }
}
