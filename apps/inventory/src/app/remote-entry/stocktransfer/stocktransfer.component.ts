import { Component, ElementRef, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ItemOptions, Items, Purchase, Purchases, Reference, VoucherType, Warehouse } from '../model/purchase.interface';
import { DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { StockTransferService } from '../../services/stocktransfer.service';
import { BaseService, CustomDialogueComponent, EndpointConstant, GridNavigationService, MenuDataService, SearchableDropdownComponent, STATUS_MESSAGES, } from '@dfinance-frontend/shared';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { StockItemDto } from '../model/stocktransfer.interface';
import { MatDialog } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'dfinance-frontend-stocktransfer',
  templateUrl: './stocktransfer.component.html',
  styleUrls: ['./stocktransfer.component.css'],
})
export class StocktransferComponent {

  stockTransferForm!: FormGroup

  //new save edit delete buttons
  isNewBtnDisabled: boolean = false;
  isEditBtnDisabled: boolean = false;
  isDeleteBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  enableInlineEditing: boolean = false;

  //------------
  isInputDisabled: boolean = true;
  isUpdate: boolean = false;

  warehouseData = [] as Array<Warehouse>;
  stockMasterList = [] as Array<Purchases>;
  fillStockItemsData = [] as Array<Items>;
  fillItemDataOptions = [] as Array<ItemOptions>;
  currentStock = {} as Purchase;
  referenceFillData = [] as Array<Reference>;

  selectedFromWarehouseObj: any = {}
  selectedToWarehouseObj: any = {}
  invTransactions: any = [];

  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  @ViewChild('tableWrapper', { static: true }) tableWrapper!: ElementRef;

  tablecolumns = [
    { name: 'SlNo', field: 'id' },
    { name: 'Item Code', field: 'itemcode' },
    { name: 'Item Name', field: 'itemname' },
    { name: 'Unit', field: 'unit' },
    { name: 'Qty', field: 'qty' },
    // { name: 'Rate', field: 'rate' },
    // { name: 'Amount', field: 'amount' }
  ];



  stockItemDto: StockItemDto = {
    "itemId": 0,
    "transactionId": 0,
    "itemCode": "",
    "itemName": "",
    "unit": {
      "unit": "",
      "basicUnit": "",
      "factor": 1
    },
    "qty": 0,
    "rate": 0,
    "stockQty": 0,
    "basicQty": 0,
    "amount": 0,
    "pcs": 0,
    "sizeMaster": {
      "id": 1,
      "name": "",
      "code": "",
      "description": ""
    },
    "taxTypeId": 0,
    "taxPerc": 0,
    "taxValue": 0,
    "taxAccountId": 0,
    "uniqueItems": [{
      "uniqueNumber": ""
    }]
  };

  itemCodereturnField = 'itemCode';
  itemUnitreturnField = 'unit';
  itemCodeKeys = ['Item Code', 'Item Name', 'Bar Code', 'ID', 'Unit', 'Stock', 'Rate', 'Purchase Rate'];
  itemCodeExcludekeys = ['unit'];
  itemUnitKeys = ['Unit', 'Basic Unit', 'Factor'];
  voucherTypeData = [] as Array<VoucherType>;

  currentRowIndex: number = -1;
  currentColIndex: number = 0;
  currentColumname: any = "";
  formVoucherNo: any = 0;
  currentBranch = 0;

  voucherFillData: any = [];
  tempStockList: any = [];
  selectedleftrow: any = [];
  tempItemFillDetails: any = [];
  selected: any[] = [];
  itemDetails: any[] = [];
  importedReferenceList: any = [];
  currentItemTableIndex: number | null = null;
  currentStockInfo: any = [];


  destroySubscription: Subject<void> = new Subject<void>();
  isLoading = false;
  isMaximized = false;
  today = new Date();
  isReferenceImported = false;

  istoggleActive = false;
  SelectionType = SelectionType;
  pageId = 0;
  voucherNo = 0;
  vocherName = "";
  firstStockTransfer!: number;
  selectedStockId!: number;
  isStockTransferCancelled = false;
  showDeleteOptions: boolean = false;
  tableHeight = 200;
  voucherDate: string | null = null;
  // voucherDate: Date | null = null;
  locId = 0;

  //for checking permissions
  isView = true;
  isCreate = true;
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


  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('reasonInput', { static: false }) reasonInput!: ElementRef;
  @ViewChildren('summaryCell') summaryCells!: QueryList<ElementRef>;

  showTopBar: boolean = false;
  showBottomBar: boolean = false;
  showLeftSection: boolean = true;

  constructor(
    private StockTransferService: StockTransferService,
    private formBuilder: FormBuilder,
    private gridnavigationService: GridNavigationService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private renderer: Renderer2,
    private baseService: BaseService,
    private datePipe: DatePipe,
    private menudataService: MenuDataService,
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

  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;
  ngOnInit(): void {
    this.stockTransferForm = this.formBuilder.group({
      vouchername: [{ value: '', disabled: true }],
      voucherno: [{ value: '', disabled: true }],
      voucherdate: [{ value: this.today, disabled: this.isInputDisabled }, Validators.required],
      reference: [{ value: '', disabled: this.isInputDisabled }],
      towarehouse: [{ value: '', disabled: this.isInputDisabled }],
      fromwarehouse: [{ value: '', disabled: this.isInputDisabled }],
      tobranch: [{ value: '', disabled: this.isInputDisabled }],
      frombranch: [{ value: '', disabled: this.isInputDisabled }],
      description: [{ value: '', disabled: this.isInputDisabled }],
      terms: [{ value: '', disabled: this.isInputDisabled }],
    });
    this.currentBranch = this.baseService.getLocalStorgeItem('current_branch') ? Number(this.baseService.getLocalStorgeItem('current_branch')) : 0;

    this.fetchStockTransferMaster();
    this.onClickNewStockTransfer();
    this.fetchCommonData()
    this.FillReferenceData();
    this.fetchVoucherType();
    this.fetchItemFillData();


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


  fetchCommonData() {
    this.StockTransferService
      .getDetails(EndpointConstant.FILLCOMMONPURCHASEDATA + this.pageId + '&voucherId=' + this.voucherNo)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.voucherFillData = response?.data;

          //setting voucher data..
          this.vocherName = this.voucherFillData.vNo?.code;
          this.warehouseData = this.voucherFillData?.wareHouse;
          this.stockTransferForm.patchValue({
            vouchername: this.vocherName,
            voucherno: this.voucherFillData.vNo?.result,
          });
          this.formVoucherNo = this.voucherFillData.vNo?.result;
          //warehouse data...

          if (this.warehouseData?.length > 0) {
            this.stockTransferForm.patchValue({
              towarehouse: this.warehouseData[0].id,
              fromwarehouse: this.warehouseData[0].id
            });
          }
          //   this.stockTransferForm.patchValue({
          //     fromWarehouse: this.warehouseData[0].id
          // });

        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }


  filterStockTransfer(event: any) {
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

  onClickStock(event: any): void {
    if (event.type === 'click') {
      this.selectedStockId = event.row.ID;
      this.fetchStockById();
    }
  }




  onSelectLeftTable(event: any) {
  }

  fetchStockTransferMaster(): void {
    this.isLoading = true;
    this.StockTransferService
      .getDetails(EndpointConstant.FILLALLPURCHASE + 'pageid=' + this.pageId + '&post=true')
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

  onClickNewStockTransfer() {
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
    this.stockTransferForm.reset();
    this.selectedStockId = 0;
    this.itemDetails = [];
    this.isStockTransferCancelled = false;

    if (this.isInputDisabled == true) {
      this.disbaleFormControls();
      this.selectedStockId = this.firstStockTransfer;
      this.fetchStockById();
    }
    else {
      this.itemDetails = [];
      this.stockTransferForm.patchValue({
        voucherdate: this.today
      })
      this.addRow();
      this.enableFormControls();
      this.fetchCommonData();
    }
    return true;
  }

  enableFormControls() {
    this.stockTransferForm.get('voucherdate')?.enable();
    this.stockTransferForm.get('reference')?.enable();
    // this.stockTransferForm.get('tobranch')?.enable();
    // this.stockTransferForm.get('frombranch')?.enable();
    this.stockTransferForm.get('towarehouse')?.enable();
    this.stockTransferForm.get('fromwarehouse')?.enable();
    this.stockTransferForm.get('description')?.enable();
    this.stockTransferForm.get('terms')?.enable();
  }

  disbaleFormControls() {
    this.stockTransferForm.get('voucherdate')?.disable();
    this.stockTransferForm.get('reference')?.disable();
    this.stockTransferForm.get('tobranch')?.disable();
    this.stockTransferForm.get('frombranch')?.disable();
    this.stockTransferForm.get('towarehouse')?.disable();
    this.stockTransferForm.get('fromwarehouse')?.disable();
    this.stockTransferForm.get('description')?.disable();
    this.stockTransferForm.get('terms')?.disable();

  }


  fetchItemFillData() {

    const warehouseId = this.stockTransferForm.get('fromwarehouse')?.value;
    const dateValue = this.stockTransferForm.get('voucherdate')?.value;
    if (dateValue == null) {
      alert("Enter Voucher Date and Proceed");
    }
    this.voucherDate = this.datePipe.transform(dateValue, 'dd-MM-yyyy');
    console.log("FillItems:" + EndpointConstant.FILLSTOCKITEMS + this.voucherNo + '&VoucherDate=' + this.voucherDate + '&LocationID=' + warehouseId)
    this.StockTransferService
      //.getDetails(EndpointConstant.FILLSTOCKITEMS + this.voucherNo + '&VoucherDate=01-11-2024&LocationID=61')
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
          this.fillStockItemsData = responseData;
          this.fillItemDataOptions = itemData;

          this.setItemDetailsFromImportReference();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
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
    this.itemDetails.push(this.stockItemDto);
    this.currentItemTableIndex = this.itemDetails.length - 1;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    this.stockItemDto = this.tempItemFillDetails;

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

  onClickSaveStockTransfer() {
    const dateValue = this.stockTransferForm.get('voucherdate')?.value;
    if (dateValue == null) {
      alert("Enter Voucher Date and Proceed");
      return;
    }

    const fromWh = this.stockTransferForm.get('fromwarehouse')?.value;
    if (fromWh == null) {
      alert("Select From Warehouse and Proceed");
      return;
    }

    const toWh = this.stockTransferForm.get('towarehouse')?.value;
    if (toWh == null) {
      alert("Select To Warehouse and Proceed");
      return;
    }

    if (this.stockTransferForm.get('fromwarehouse')?.value) {
      this.warehouseData.forEach((element: any) => {
        if (element.id == this.stockTransferForm.get('fromwarehouse')?.value) {
          this.selectedFromWarehouseObj = {
            "id": element.id,
            "value": element.name
          };
        }
      });
    }

    if (this.stockTransferForm.get('towarehouse')?.value) {
      this.warehouseData.forEach((element: any) => {
        if (element.id == this.stockTransferForm.get('towarehouse')?.value) {
          this.selectedToWarehouseObj = {
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
    console.log("Qty:" + checkQty)
    if (checkQty) {
      alert('Check whether the Qty field is empty or zero and Proceed');
      return;
    }


    const payload = {
      "id": this.selectedStockId ? this.selectedStockId : 0,
      "voucherNo": this.formVoucherNo,
      "fromBranch": {
        "id": this.currentBranch,
        "value": "string"
      },
      "toBranch": {
        "id": this.currentBranch,
        "value": "string"
      },
      "fromWarehouse": this.selectedFromWarehouseObj,
      "toWarehouse": this.selectedToWarehouseObj,
      "voucherDate": this.today,
      "description": this.stockTransferForm.value.description,
      "terms": this.stockTransferForm.value.terms,
      "reference": this.stockTransferForm.value.reference,
      "stockItems": filteredItems,
      "references": this.referenceListarray

    };

    if (this.isUpdate) {
      this.updateCallback(payload);
    } else {
      this.createCallback(payload);
    }
    return true;
  }

  updateCallback(payload: any) {
    this.StockTransferService.updateDetails(EndpointConstant.UPDATESTOKTRANSFER + this.voucherNo + '&pageId=' + this.pageId, payload)
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
        }

      });
  }


  createCallback(payload: any) {
    //console.log("Payload:", JSON.stringify(payload, null, 2))
    this.StockTransferService.saveDetails(EndpointConstant.SAVESTOCKTRANSFER + this.voucherNo + '&pageId=' + this.pageId, payload)
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
        }
      });
  }



  isUnitsOpen = false;
  unitsInGrid: any = [];
  selectedBranchId: number = 0;
  filledBranchId: number = 0;
  selectedBranches: { id: number, company: string, nature: string }[] = [];

  onClickEditStockTransfer() {
    if (!this.isEdit) {
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isNewBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUpdate = !this.isInputDisabled;
    this.isUnitsOpen = false;

    this.unitsInGrid = [];

    this.selectedBranchId = 0;
    this.filledBranchId = 0;
    this.selectedBranches = [];
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

  setInitialState() {
    this.isNewBtnDisabled = false;
    this.isEditBtnDisabled = false;
    this.isDeleteBtnDisabled = false;
    this.isSaveBtnDisabled = true;
    this.isInputDisabled = true;
    this.isUpdate = false;
    this.disbaleFormControls();
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

  confirmDelete() {
    this.StockTransferService.deleteDetails(EndpointConstant.DELETEPURCHASE + this.selectedStockId + '&pageId=' + this.pageId)
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
          console.error('Error Deleting Stock Transfer');
          alert('Failed to Delete Stock Transfer.');
        },
        complete: () => {
          this.selectedStockId = 0;
          this.showDeletePopup = false;
          this.fetchStockTransferMaster();
          this.setInitialState();
          this.onClickNewStockTransfer();
        }
      });
  }

  closeDeletePopup() {
    this.showDeletePopup = false;
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

  confirmCancel() {
    this.StockTransferService.updateDetails(EndpointConstant.CANCELPURCHASE + this.selectedStockId + '&pageId=' + this.pageId + '&reason=' + this.cancelReason, {})
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          const status = response.httpCode as keyof typeof STATUS_MESSAGES;
          const message = STATUS_MESSAGES[status];
          alert(message);
        },
        error: () => {
          this.isLoading = false;
          console.error('Error Cancelling Stock Transfer');
          alert('Failed to Cancel Stock Transfer.');
        },
        complete: () => {
          this.cancelReason = "";
          this.selectedStockId = 0;
          this.showCancelPopup = false;
          this.fetchStockTransferMaster();
          this.setInitialState();
          this.onClickNewStockTransfer();
        }
      });
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

  onScroll(event: any) {
    const scrollTop = this.scrollContainer.nativeElement.scrollTop;
    this.showTopBar = scrollTop > 50 ? true : false;  // Show the bar when scrolled more than 50px
  }
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

  openImportReferencePopup() {
    this.importedReferenceList = [];
    this.isReferenceImported = false;
    this.currentStockInfo = [];
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
    this.showImportReferencePopup = true;
  }

  onChangeWarehouse() {
    const warehouseId = this.stockTransferForm.get('fromwarehouse')?.value;
    const voucherDate = this.stockTransferForm.get('voucherdate')?.value;
    if (warehouseId && voucherDate) {
      this.fetchItemFillData();
    }
  }

  onPurchaseTabChange(event: MatTabChangeEvent) {

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



  validateItemGridEntry() {
    const warehouseId = this.stockTransferForm.get('fromwarehouse')?.value;
    if (!warehouseId) {
      alert('Please select location');
      return false;
    }
    return true;
  }

  handleDoubleClick(event: any) {
    if (this.currentColumname != 'itemname' && this.currentColumname != 'amount') {
      this.enableInlineEditing = true;
    }
  }

  onItemUnitSelected(option: any, rowIndex: any) {
    let unitPopup = this.itemDetails[rowIndex]['unitsPopup'];
    let unitObj = unitPopup.find((unit: any) => unit.unit === option)
    this.itemDetails[rowIndex]['unit'] = unitObj;
    this.itemDetails = [...this.itemDetails];
    this.tempItemFillDetails = [...this.itemDetails];
    //this.stockItemDto= this.tempItemFillDetails;
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
          selectedItemObj.qty = 1.0000;
          selectedItemObj.unit = firstUnit;
          selectedItemObj.unitsPopup = unitInfoOptions;
          selectedItemObj.rate = firstUnit.purchaseRate;
          selectedItemObj.amount = 0.0000;
          selectedItemObj.stockQty = 0;
          selectedItemObj.basicQty = 0;
          selectedItemObj.pcs = 0;
          selectedItemObj.sizeMaster = {};
          selectedItemObj.taxTypeId = 0;
          selectedItemObj.taxPerc = 0;
          selectedItemObj.taxValue = 0;
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
    }
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

  onChangeQuantity(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const rate = this.itemDetails[rowIndex]['rate'];
    let qty = event.target.value;
    this.itemDetails[rowIndex]['qty'] = qty;
    this.calculateItemAmount(rowIndex);
  }

  onChangeRate(rowIndex: any, event: any) {
    // Assuming row contains the rate value
    const qty = this.itemDetails[rowIndex]['qty'];
    let rate = event.target.value;
    this.itemDetails[rowIndex]['rate'] = rate;
    this.calculateItemAmount(rowIndex);

  }
  calculateItemAmount(rowIndex: number) {
    let qty = this.itemDetails[rowIndex]['qty'];
    let rate = this.itemDetails[rowIndex]['rate'];
    let amount = qty * rate;
    this.itemDetails[rowIndex]['amount'] = amount;
  }

  onRateBlur(rowIndex: any, event: any) { }

  closeImportReferencePopup() {
    this.renderer.removeStyle(document.body, 'overflow');
    this.showImportReferencePopup = false;
  }

  fetchItemUnits(itemId: any, rowIndex: any) {
    this.StockTransferService
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

  fetchStockById(): void {
    //this.isLoading = true;
    this.StockTransferService
      .getDetails(EndpointConstant.FILLPURCHASEBYID + this.selectedStockId + '&pageId=' + this.pageId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentStock = response?.data;
          this.FillStockDetails();
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }
  referenceData: any = {};
  FillStockDetails() {
    let transactionDetails = this.currentStock?.transaction.fillTransactions;
    let transactionAddditional = this.currentStock?.transaction.fillAdditionals;
    this.invTransactions = this.currentStock?.transaction.fillInvTransItems;
    this.referenceData = this.currentStock?.transaction.fillVoucherAllocationUsingRef;
    this.stockTransferForm.patchValue({
      vouchername: this.vocherName,
      voucherno: transactionDetails.transactionNo,
      voucherdate: transactionDetails.date ? new Date(transactionDetails.date) : null,
      reference: transactionDetails.referenceNo,
      fromwarehouse: transactionAddditional.fromLocationID,
      towarehouse: transactionAddditional.toLocationID,
      description: transactionDetails.description,
      terms: transactionAddditional.terms,
    });
    this.formVoucherNo = transactionDetails.transactionNo;
    this.isStockTransferCancelled = transactionDetails.cancelled;
    if (this.fillStockItemsData.length > 0) {
      this.setGridDetailsFromFill(this.invTransactions);
    }

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
          ...this.stockItemDto,
          transactionId: trn.transactionId,
          itemId: trn.itemId,
          itemCode: trn.itemCode,
          itemName: trn.itemName,
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
          taxAccountId: trn.taxAccountId || 0,
          uniqueItems: trn.uniqueItems || [],

        };

        this.itemDetails.push(gridItem);
      });

      this.itemDetails.push({ ...this.stockItemDto });
      this.noGridItem = false;
      this.currentItemTableIndex = this.itemDetails.length - 1;

      this.itemDetails = [...this.itemDetails];
      this.tempItemFillDetails = [...this.itemDetails];
    }
  }



  FillReferenceData() {
    this.StockTransferService
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

  referenceListarray: any = [];

  updatedSupplier = '';
  selectedPartyId = 0;
  updatedProject = '';

  saveReferenceData(response: any) {
    //push reference list array...
    this.referenceListarray = response?.referenceList;
    if (Object.keys(response).length > 0) {
      if (response?.referenceVNoList.length > 0) {
        let refText = response?.referenceVNoList.join(', ');
        this.stockTransferForm.patchValue({
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


  setItemDetailsFromImportReference() {
    // Set item details if import reference details are there
    if (this.importedReferenceList.length > 0 && !this.isReferenceImported) {
      this.importedReferenceList.forEach((element: any) => {
        const itemExists = this.itemDetails.some((existingItem: any) =>
          existingItem.transactionId === element.TransactionID && existingItem.itemId === element.ItemID
        );

        if (!itemExists) {
          let unitInfoOptions: any[] = [];

          // Populate unit options based on the matching itemCode
          this.fillStockItemsData.forEach((itemInfo: any) => {
            if (itemInfo.item.itemCode === element.ItemCode) {
              itemInfo.unitPopup.forEach((unitInfo: any) => {
                unitInfoOptions.push({
                  "unit": unitInfo.unit,
                  "basicUnit": unitInfo.basicUnit,
                  "factor": unitInfo.factor
                });
              });
            }
          });

          const unitObj = unitInfoOptions.find((unit: any) => unit.unit === element.Unit);

          let insertItem: any = {};
          insertItem.itemId = element.ItemID;
          insertItem.itemCode = element.ItemCode;
          insertItem.itemName = element.ItemName;
          insertItem.unit = {
            "unit": unitObj?.unit || element.Unit || '',
            "basicUnit": unitObj?.basicUnit || '',
            "factor": unitObj?.factor || 1
          };
          insertItem.qty = Number(element.Qty);
          insertItem.rate = this.baseService.formatInput(Number(element.Rate));
          insertItem.amount = this.baseService.formatInput(Number(element.Amount));
          insertItem.taxPerc = null;
          insertItem.taxValue = this.baseService.formatInput(Number(element.TaxValue));
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

      });

      // Remove any empty item with default values from itemDetails
      this.itemDetails = this.itemDetails.filter(item => item.itemId !== 0 || item.itemCode !== '');

      // Update tempItemFillDetails with filtered itemDetails
      this.tempItemFillDetails = [...this.itemDetails];
      // After processing and adding all items
      // Filter out placeholder entries from itemDetails
      this.tempItemFillDetails = this.itemDetails.filter((item: any) => {
        return !(
          item.itemId === 0 &&
          item.transactionId === 0 &&
          item.itemCode === "" &&
          item.itemName === "" &&
          item.unit.unit === "" &&
          item.unit.basicUnit === "" &&
          item.unit.factor === 1 &&
          item.qty === 0 &&
          item.rate === 0 &&
          item.amount === 0 &&
          item.taxPerc === 0 &&
          item.taxValue === 0 &&
          item.taxAccountId === 0 &&
          item.uniqueItems.length === 1 &&
          item.uniqueItems[0].uniqueNumber === ""
        );
      });



      this.noGridItem = false;
      this.currentItemTableIndex = this.itemDetails.length - 1;
      this.isReferenceImported = true;
    }
    //this.addRow();
  }


  fetchTransactionDetailsById(transactionId: number) {
    this.StockTransferService
      .getDetails(EndpointConstant.FILLTRANSACTIONDETAILSBYID + transactionId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let result = response?.data;
          //set transaction details....
          let transactionDetails = result.transactionData[0];
          this.stockTransferForm.patchValue({
            description: transactionDetails.description,
            voucherdate: transactionDetails.Date
          });
          //set transaction additional details....
          let transactionAddditional = result.additionalData?.[0];
          this.stockTransferForm.patchValue({
            fromwarehouse: transactionAddditional.fromLocationID,
            towarehouse: transactionAddditional.toLocationID,
            terms: transactionAddditional.terms,
          });

        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  fetchVoucherType() {
    // this.partyId = this.selectedPartyId;
    this.StockTransferService
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


  /*-----------------------------------------------------------------------------*/
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

  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
  }
  getGridCellElement(rowIndex: number, colIndex: number): HTMLElement | null {
    // Assuming each grid cell has a unique id like `cell-row-col`
    const cellId = `cell-${rowIndex}-${colIndex}`;
    return document.getElementById(cellId);
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
  selectedRowIndex: any = -1;

  deleteItemGrid(index: any) {
    if (confirm("Are you sure you want to delete this details?")) {
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

      this.selectedRowIndex = -1
    }
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

  callKeydownEventToDropdown(fieldName: any, event: KeyboardEvent): void {
    // Find the dropdown with fieldName and focus it
    const fieldDropdown = this.searchableDropdowns.find(dropdown => dropdown.fieldName === fieldName);
    if (fieldDropdown) {
      fieldDropdown.onKeyDown(event);
    }
  }


}
