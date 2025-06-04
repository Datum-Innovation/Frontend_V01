import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { ItemMasterService } from '../../services/itemmaster.service';
import { BaseService, EndpointConstant, GridNavigationService, InputValidationService, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { Account, Branches, Category, CountryOfOrigin, ItemBrand, ItemColor, ItemHistory, ItemMaster, ItemMasters, ItemUnitDetails, Quality, TaxType, UnitData, parentItem } from '../model/itemmaster.interface';
import { Subject, takeUntil } from 'rxjs';
import { id } from '@swimlane/ngx-datatable';
declare var $: any;
interface SelectedCategory {
  category: string;
  id:number;
  code:string;
  categoryType:string;
}
@Component({
  selector: 'dfinance-frontend-itemmaster',
  templateUrl: './itemmaster.component.html',
  styleUrls: ['./itemmaster.component.css'],
})
export class ItemmasterComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  @ViewChild('stickybuttoncontainer') stickybuttoncontainer!: ElementRef;
  @ViewChild('btngroup') btngroup!: ElementRef;
  @ViewChild('leftsearch') leftsearch!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  isInputDisabled: boolean = true;
  ItemMasterForm!: FormGroup;
  filterForm!: FormGroup;
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
  allItemMasters = [] as Array<ItemMasters>;
  savedItemMasterList = [] as Array<ItemMasters>;
  selectedItemMasterId: number = 0;
  firstItemMaster!: number;
  expiryitem = true;
  rawmaterials = true;
  finishedgoods = true;
  currentItemMaster = {} as ItemMaster;
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

  selectedCategory = "";
  selectedCategoryObj: SelectedCategory | null = null;
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

  isStockItem = false;
  itemUnitDetails:any = [] as Array<ItemUnitDetails>;
  unitsInGrid: any = [];

  allBranches = [] as Array<Branches>;
  selectedBranches: { id: number, company: string, nature: string }[] = [];
  selectedBranchId: number = 0;
  filledBranchId: number = 0;
  stockToDisplay: number = 0;

  allItemHistoryDetails = [] as Array<ItemHistory>;

  imageData: string | ArrayBuffer | null = null;
  basicUnitreturnField: string = 'unit';
  basicUnitKeys = ['Unit', 'Basic Unit', 'Factor'];
  categoryreturnField: string = 'code';
  categoryKeys = ['Code', 'Description'];
  parentItemreturnField: string = 'itemName';
  ParentItemKeys = ['Item Code', 'item Name', 'ID'];
  colorreturnField: string = 'value';
  colorKeys = ['Code', 'Value', 'ID'];
  countryreturnField: string = 'value';
  countryKeys = ['Code', 'Value', 'ID'];
  brandreturnField: string = 'value';
  brandKeys = ['Code', 'Value', 'ID'];
  purchaseUnitreturnField: string = 'unit';
  purchaseUnitKeys = ['Unit', 'Basic Unit', 'Factor'];
  sellingUnitreturnField: string = 'unit';
  sellingUnitKeys = ['Unit', 'Basic Unit', 'Factor'];
  invAccountreturnField: string = 'name';
  invAccountKeys = ['ID', 'Name', ''];
  salesAccountreturnField: string = 'name';
  salesAccountKeys = ['ID', 'Name', ''];
  costAccountreturnField: string = 'name';
  costAccountKeys = ['ID', 'Name', ''];
  purchaseAccountreturnField: string = 'name';
  purchaseAccountKeys = ['ID', 'Name', ''];

  showItemDetails = true;
  showHistory = false;
  showOtherDetails = false;

  selectedTab = 1;
  selectedBrands: any = [];

  filteredCategories: any = [];
  selectedCategories: any = [];

  pageId = 0;
  currentBranch = 0;

  showCopyPopup = false;
  showRateGroup = false;
  copyFieldObj: string[] = [];
  copyBranchObj: string[] = [];

  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;
  isManualChange = false;

  
  tablecolumns = [
    { name: 'ID', field: 'id'},
    { name: 'Unit', field: 'unit'},
    { name: 'Factor', field: 'factor'},
    { name: 'Basic Unit', field: 'basicunit'},
    { name: 'Purchase Rate', field: 'purchaserate'},
    { name: 'Selling Price', field: 'sellingprice'},
    { name: 'MRP', field: 'mrp'},
    { name: 'Wholesale Price', field: 'wholesaleprice'},
    { name: 'Retail Price', field: 'retailprice'},
    { name: 'Wholesale Price2', field: 'wholesaleprice2'},
    { name: 'Retail Price2', field: 'retail price2'},
    { name: 'Lowest Rate', field: 'lowestrate'},
    { name: 'Barcode', field: 'barcode'},
    { name: 'Generate', field: 'generate'},
    { name: 'Print', field: 'print'},
    { name: 'Active', field: 'active'}
  ];

  @ViewChildren('gridCell') gridCells!: QueryList<ElementRef>;
  @ViewChild('gridInput', { static: false }) gridInput!: ElementRef;
  currentRowIndex: number = -1;  // Index of the currently focused row
  currentColIndex: number = 0;
  currentColumname:any = "";
    enableInlineEditing:boolean = false;
    selectedRowIndex:any = -1;

    deliveryDetailsObj:any = {
      "unit": {
        "unit":""
      },
      "basicUnit":"",
      "purchaseRate":"",
      "factor":"",
      "sellingPrice":"",
      "wholeSalePrice":"",
      "retailPrice":"",
      "wholeSalePrice2":"",
      "retailPrice2":"",
      "lowestRate":"",
      "barcode":"",

    };
    
  selected: any[] = [];
  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private renderer: Renderer2,
    private itemMasterService: ItemMasterService,
    private baseService: BaseService,
    private route: ActivatedRoute,
    private menudataService: MenuDataService,
    private inputValidationService: InputValidationService,    
    private gridnavigationService: GridNavigationService
  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['itemid']) {
      this.selectedItemMasterId = queryParams['itemid'];
    }
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
  }

  ngOnInit(): void {
    this.ItemMasterForm = this.formBuilder.group({
      itemcode: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      active: [{ value: '', disabled: this.isInputDisabled }],
      itemname: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      arabicname: [{ value: '', disabled: this.isInputDisabled }],
      basicunit: [{ value: '', disabled: this.isInputDisabled }, Validators.required],
      barcodeno: [{ value: '', disabled: this.isInputDisabled }],//, Validators.required
      category: [{ value: null, disabled: this.isInputDisabled }],//, Validators.required
      unique: [{ value: false, disabled: this.isInputDisabled }],
      stockitem: [{ value: '', disabled: this.isInputDisabled }],
      costprice: [{ value: '', disabled: this.isInputDisabled }],//, [Validators.required,Validators.pattern('[0-9]+(\.[0-9][0-9]?)?')]
      sellingprice: [{ value: '', disabled: this.isInputDisabled }],//, [Validators.required,Validators.pattern('[0-9]+(\.[0-9][0-9]?)?')]
      mrp: [{ value: '', disabled: this.isInputDisabled }],//, [Validators.required,Validators.pattern('[0-9]+(\.[0-9][0-9]?)?')]
      taxtype: [{ value: null, disabled: this.isInputDisabled }],
      margin: [{ value: '', disabled: this.isInputDisabled }],//, Validators.pattern('[0-9]+(\.[0-9][0-9]?)?')
      marginvalue: [{ value: '', disabled: this.isInputDisabled }],//, Validators.pattern('[0-9]+(\.[0-9][0-9]?)?')
      isdisabled: [{ value: false, disabled: this.isInputDisabled }],
      expiryitem: [{ value: false, disabled: this.isInputDisabled }],
      finishedgoods: [{ value: false, disabled: this.isInputDisabled }],
      rawmaterials: [{ value: false, disabled: this.isInputDisabled }],
      expirydays: [{ value: '', disabled: this.isInputDisabled }],
      racklocation: [{ value: '', disabled: this.isInputDisabled }],
      discount: [{ value: '', disabled: this.isInputDisabled }],
      hsncode: [{ value: '', disabled: this.isInputDisabled }],
      parentitem: [{ value: '', disabled: this.isInputDisabled }],//,Validators.required
      quality: [{ value: '', disabled: this.isInputDisabled }],
      modelno: [{ value: '', disabled: this.isInputDisabled }],
      color: [{ value: '', disabled: this.isInputDisabled }],
      brancdname: [{ value: '', disabled: this.isInputDisabled }],
      countryoforigin: [{ value: '', disabled: this.isInputDisabled }],
      manufacturer: [{ value: '', disabled: this.isInputDisabled }],
      rol: [{ value: '', disabled: this.isInputDisabled }],
      roq: [{ value: '', disabled: this.isInputDisabled }],
      shipmark: [{ value: '', disabled: this.isInputDisabled }],
      paintmark: [{ value: '', disabled: this.isInputDisabled }],
      stockcode: [{ value: '', disabled: this.isInputDisabled }],
      weight: [{ value: 0, disabled: this.isInputDisabled }],
      purchaseunit: [{ value: '', disabled: this.isInputDisabled }],//,Validators.required
      sellingunit: [{ value: '', disabled: this.isInputDisabled }],//,Validators.required
      oemno: [{ value: '', disabled: this.isInputDisabled }],
      groupitem: [{ value: '', disabled: this.isInputDisabled }],
      invaccount: [{ value: '', disabled: (this.isInputDisabled || this.stockitem) }],
      salesaccount: [{ value: '', disabled: (this.isInputDisabled || this.stockitem) }],
      costaccount: [{ value: '', disabled: (this.isInputDisabled || this.stockitem) }],
      purchaseaccount: [{ value: '', disabled: (this.isInputDisabled || this.stockitem) }],
      remarks: [{ value: '', disabled: this.isInputDisabled }]
    });

    this.filterForm = this.formBuilder.group({
      selectedBrands: new FormControl([]), // For multiple selection, initialize with an empty array
      selectedCategory: new FormControl('')
    });
     this.fetchAllItemMasters();
    if (this.selectedItemMasterId == 0) {
      this.onClickNewItemmaster();
    } else {
      this.onClickEditItemMaster();
    }
    this.fetchAllBranches();
    this.fetchAllTaxTypes();
    this.fetchUnitDropdown();
    this.fetchCategories();
    this.fetchParentItems();
    this.fetchItemQuality();
    this.fetchItemColors();
    this.fetchItemBrands();
    this.fetchCountryOfOrigin();
    this.fetchAccounts();
    this.currentBranch = this.baseService.getLocalStorgeItem('current_branch') ? Number(this.baseService.getLocalStorgeItem('current_branch')) : 0;
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

  fetchAllItemMasters(): void {
    //this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLALLITEMMASTER)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          //this.isLoading = false;
          this.allItemMasters = response?.data;
          this.savedItemMasterList = [...this.allItemMasters];
          //this.setBranches();
          //this.selectedItemMasterId = this.allItemMasters[0].id;
          if (this.selectedItemMasterId > 0) {
            this.onClickEditItemMaster();
          }
          this.firstItemMaster = this.allItemMasters[0].id;
          //this.fetchItemMasterById();
        },
        error: (error) => {
          //this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }
  onClickNewItemmaster() {
    if(!this.isCreate){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isEditBtnDisabled = !this.isInputDisabled;
    this.isDeleteBtnDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    this.isUnitsOpen = false;
    this.isOtherDetailsOpen = false;
    this.ItemMasterForm.reset();
    this.selectedItemMasterId = 0;
    this.selectedBasicUnitObj = {} as UnitData;
    this.updatedBasicUnit = "";
    this.selectedPurchaseUnitObj = {};
    this.updatedPurchaseUnit = "";
    this.selectedSellingUnitObj = {};
    this.updatedSellingUnit = "";
    this.unitsInGrid = [];
    this.itemUnitDetails = [];
    this.selectedBranchId = 0;
    this.filledBranchId = 0;
    this.selectedBranches = [];
    this.selectedCategoryObj = null;
    this.selectedCategory = "";

    this.selectedParentItemObj = {};
    this.selectedParentItemName = "";
    this.imageData = "";
    this.resetAccountData();
    if (this.isInputDisabled == true) {
      this.disbaleFormControls();
      this.selectedItemMasterId = this.firstItemMaster;
      this.fetchItemMasterById();
    } else {
      this.selectedItemMasterId = 0;
      this.generateItemCode();
      this.enableFormControls();
      this.ItemMasterForm.patchValue({
        active: true
      });
      this.addUnit();

    }
    return true;
  }

  resetAccountData(){
    this.selectedInvAccountName = "";
    this.selectedInvAccountId = 0
    this.selectedSalesAccountName = "";
    this.selectedSalesAccountId = 0
    this.selectedCostAccountName = "";
    this.selectedCostAccountId = 0
    this.selectedPurchaseAccountName = "";
    this.selectedPurchaseAccountId = 0
  }

  generateItemCode() {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FETCHNEWITEMCODE)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.ItemMasterForm.patchValue({
            itemcode: response.data
          });
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  enableFormControls() {
    this.ItemMasterForm.get('itemcode')?.enable();
    this.ItemMasterForm.get('active')?.enable();
    this.ItemMasterForm.get('itemname')?.enable();
    this.ItemMasterForm.get('arabicname')?.enable();
    this.ItemMasterForm.get('basicunit')?.enable();
    this.ItemMasterForm.get('barcodeno')?.enable();
    this.ItemMasterForm.get('category')?.enable();
    this.ItemMasterForm.get('unique')?.enable();
    this.ItemMasterForm.get('stockitem')?.enable();
    this.ItemMasterForm.get('costprice')?.enable();
    this.ItemMasterForm.get('sellingprice')?.enable();
    this.ItemMasterForm.get('mrp')?.enable();
    this.ItemMasterForm.get('taxtype')?.enable();
    this.ItemMasterForm.get('margin')?.enable();
    this.ItemMasterForm.get('marginvalue')?.enable();
    this.ItemMasterForm.get('isdisabled')?.enable();
    this.ItemMasterForm.get('expiryitem')?.enable();
    this.ItemMasterForm.get('finishedgoods')?.enable();
    this.ItemMasterForm.get('rawmaterials')?.enable();
    this.ItemMasterForm.get('expirydays')?.enable();
    this.ItemMasterForm.get('racklocation')?.enable();
    this.ItemMasterForm.get('discount')?.enable();
    this.ItemMasterForm.get('hsncode')?.enable();
    this.ItemMasterForm.get('parentitem')?.enable();
    this.ItemMasterForm.get('quality')?.enable();
    this.ItemMasterForm.get('modelno')?.enable();
    this.ItemMasterForm.get('color')?.enable();
    this.ItemMasterForm.get('brancdname')?.enable();
    this.ItemMasterForm.get('countryoforigin')?.enable();
    this.ItemMasterForm.get('manufacturer')?.enable();
    this.ItemMasterForm.get('rol')?.enable();
    this.ItemMasterForm.get('roq')?.enable();
    this.ItemMasterForm.get('shipmark')?.enable();
    this.ItemMasterForm.get('paintmark')?.enable();
    this.ItemMasterForm.get('stockcode')?.enable();
    this.ItemMasterForm.get('weight')?.enable();
    this.ItemMasterForm.get('purchaseunit')?.enable();
    this.ItemMasterForm.get('sellingunit')?.enable();
    this.ItemMasterForm.get('oemno')?.enable();
    this.ItemMasterForm.get('groupitem')?.enable();
    this.ItemMasterForm.get('remarks')?.enable();
  }

  disbaleFormControls() {
    this.ItemMasterForm.get('itemcode')?.disable();
    this.ItemMasterForm.get('active')?.disable();
    this.ItemMasterForm.get('itemname')?.disable();
    this.ItemMasterForm.get('arabicname')?.disable();
    this.ItemMasterForm.get('basicunit')?.disable();
    this.ItemMasterForm.get('barcodeno')?.disable();
    this.ItemMasterForm.get('category')?.disable();
    this.ItemMasterForm.get('unique')?.disable();
    this.ItemMasterForm.get('stockitem')?.disable();
    this.ItemMasterForm.get('costprice')?.disable();
    this.ItemMasterForm.get('sellingprice')?.disable();
    this.ItemMasterForm.get('mrp')?.disable();
    this.ItemMasterForm.get('taxtype')?.disable();
    this.ItemMasterForm.get('margin')?.disable();
    this.ItemMasterForm.get('marginvalue')?.disable();
    this.ItemMasterForm.get('isdisabled')?.disable();
    this.ItemMasterForm.get('expiryitem')?.disable();
    this.ItemMasterForm.get('finishedgoods')?.disable();
    this.ItemMasterForm.get('rawmaterials')?.disable();
    this.ItemMasterForm.get('expirydays')?.disable();
    this.ItemMasterForm.get('racklocation')?.disable();
    this.ItemMasterForm.get('discount')?.disable();
    this.ItemMasterForm.get('hsncode')?.disable();
    this.ItemMasterForm.get('parentitem')?.disable();
    this.ItemMasterForm.get('quality')?.disable();
    this.ItemMasterForm.get('modelno')?.disable();
    this.ItemMasterForm.get('color')?.disable();
    this.ItemMasterForm.get('brancdname')?.disable();
    this.ItemMasterForm.get('countryoforigin')?.disable();
    this.ItemMasterForm.get('manufacturer')?.disable();
    this.ItemMasterForm.get('rol')?.disable();
    this.ItemMasterForm.get('roq')?.disable();
    this.ItemMasterForm.get('shipmark')?.disable();
    this.ItemMasterForm.get('paintmark')?.disable();
    this.ItemMasterForm.get('stockcode')?.disable();
    this.ItemMasterForm.get('weight')?.disable();
    this.ItemMasterForm.get('purchaseunit')?.disable();
    this.ItemMasterForm.get('sellingunit')?.disable();
    this.ItemMasterForm.get('oemno')?.disable();
    this.ItemMasterForm.get('groupitem')?.disable();
    this.ItemMasterForm.get('remarks')?.disable();
  }


  onClickSaveItemMaster() {
    if (this.ItemMasterForm.invalid) {
      for (const field of Object.keys(this.ItemMasterForm.controls)) {
        const control: any = this.ItemMasterForm.get(field);
        if (control.invalid) {
          this.baseService.showCustomDialogue('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }
    //this.isLoading = true;
    if (Object.keys(this.selectedParentItemObj).length === 0) {
      this.selectedParentItemObj = {
        id: 0,
        itemCode: "",
        itemName: ""
      };
    }

    if (Object.keys(this.selectedSellingUnitObj).length === 0) {
      this.selectedSellingUnitObj = {
        id: 0,
        unit: "",
        basicUnit: ""
      };
    }

    if (Object.keys(this.selectedPurchaseUnitObj).length === 0) {
      this.selectedPurchaseUnitObj = {
        id: 0,
        unit: "",
        basicUnit: ""
      };
    }

    // set branches...
    if(this.selectedBranches.length == 0){
      this.allBranches.forEach((branch: any) => {
        if (branch.id == this.currentBranch) {
          this.selectedBranches.push(branch);
        }
      });
    }
    this.itemUnitDetails.pop();
    
    const payload = {
      itemCode: this.ItemMasterForm.value.itemcode,
      itemName: this.ItemMasterForm.value.itemname,
      arabicName: this.ItemMasterForm.value.arabicname,
      unit: this.selectedBasicUnitObj,
      barCode: this.ItemMasterForm.get('barcodeno')?.value != null ? this.ItemMasterForm.get('barcodeno')?.value.toString() : '',
      category: this.selectedCategoryObj ? this.selectedCategoryObj : {},
      isUniqueItem: this.ItemMasterForm.value.unique ?? false,
      stockItem: this.ItemMasterForm.value.stockitem ?? false,
      costPrice: this.ItemMasterForm.value.costprice,
      sellingPrice: this.ItemMasterForm.value.sellingprice,
      mrp: this.ItemMasterForm.value.mrp,
      margin: this.ItemMasterForm.value.margin,
      marginValue: this.ItemMasterForm.value.marginvalue,
      taxType: this.selectedTaxTypeObj,
      isExpiry: this.ItemMasterForm.value.expiryitem ?? false,
      expiryPeriod: this.ItemMasterForm.value.expirydays ?? 0,
      isFinishedGood: this.ItemMasterForm.value.finishedgoods ?? false,
      isRawMaterial: this.ItemMasterForm.value.rawmaterials ?? false,
      location: this.ItemMasterForm.value.racklocation,
      itemDisc: this.ItemMasterForm.value.discount ?? 0,
      hsn: this.ItemMasterForm.value.hsncode,
      parent: this.selectedParentItemObj,
      quality: this.selectedItemQualityObj,
      modelNo: this.ItemMasterForm.value.modelno,
      color: this.selectedItemColorObj,
      brand: this.selectedItemBrandObj,
      countryOfOrigin: this.selectedCountryOfOriginObj,
      rol: this.ItemMasterForm.value.rol ?? 0,
      partNo: this.ItemMasterForm.value.stockcode,
      roq: this.ItemMasterForm.value.roq ?? 0,
      manufacturer: this.ItemMasterForm.value.manufacturer,
      weight: this.ItemMasterForm.value.weight ?? 0,
      shipMark: this.ItemMasterForm.value.shipmark,
      paintMark: this.ItemMasterForm.value.paintmark,
      sellingUnit: this.selectedSellingUnitObj,
      oemNo: this.ItemMasterForm.value.oemno,
      purchaseUnit: this.selectedPurchaseUnitObj,
      isGroup: this.ItemMasterForm.value.groupitem ?? false,
      active: this.ItemMasterForm.value.active,
      invAccount: {
        id: this.selectedInvAccountId,
        name: this.selectedInvAccountName
      },
      salesAccount: {
        id: this.selectedSalesAccountId,
        name: this.selectedSalesAccountName
      },
      costAccount: {
        id: this.selectedCostAccountId,
        name: this.selectedCostAccountName
      },
      purchaseAccount: {
        id: this.selectedPurchaseAccountId,
        name: this.selectedPurchaseAccountName
      },
      remarks: this.ItemMasterForm.value.remarks,
      itemUnit: this.itemUnitDetails,
      branch: this.selectedBranches,
      imageFile: this.imageData
    };
    if (this.isUpdate) {
      this.updateCallback(payload, this.selectedItemMasterId);
    } else {
      this.createCallback(payload);
    }
  }

  updateCallback(payload: any, itemMasterId: any) {
    this.itemMasterService.updateDetails(EndpointConstant.UPDATEITEMMASTER + itemMasterId+'&pageId='+this.pageId, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          //this.isLoading = false;
          this.baseService.showCustomDialogue(response.data.msg);
          this.selectedItemMasterId = 0;
          this.selectedItemMasterId = this.firstItemMaster;
          this.fetchItemMasterById();
          this.setInitialState();
        },
        error: (error) => {
         // this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  createCallback(payload: any) {
    this.itemMasterService.saveDetails(EndpointConstant.SAVEITEMMASTER + '?pageId=' + this.pageId, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          //this.isLoading = false;
          if (response.httpCode == 201) {
            this.baseService.showCustomDialogue(response.data.msg);
          } else {
            this.baseService.showCustomDialogue(response.data.msg);
          }
          this.selectedItemMasterId = this.firstItemMaster;
          // this.fetchItemMasterById();
          this.fetchAllItemMasters();
          this.setInitialState();
        },
        error: (error) => {
          //this.isLoading = false;
          console.error('Error saving branch', error);
        },
      });
  }


  onClickEditItemMaster() {
    if(!this.isEdit){
      this.baseService.showCustomDialogue('Permission Denied!');
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
    this.ItemMasterForm.reset();
    if (this.isInputDisabled == false) {
      this.enableFormControls();
    } else {
      this.disbaleFormControls();
    }
    this.fetchItemMasterById();
    return true;
  }
  onClickDeleteItemMaster() {
    if(!this.isDelete){
      this.baseService.showCustomDialogue('Permission Denied!');
      return false;
    }
    if (confirm("Are you sure you want to delete this details?")) {
      //this.isLoading = true;
      this.itemMasterService.deleteDetails(EndpointConstant.DELETEITEMMASTER + this.selectedItemMasterId+'&pageId='+this.pageId)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            if (response.httpCode == 200) {
              this.baseService.showCustomDialogue(response.data.msg);
            } else {
              this.baseService.showCustomDialogue(response.data);
            }
            this.selectedItemMasterId = 0;//this.firstItemMaster;
            //this.fetchAllItemMasters();
            this.setInitialState();
            //this.isLoading = false;
          },
          error: (error) => {
            //this.isLoading = false;
            this.baseService.showCustomDialogue('Please try again');
          },
        });
    }
    return true;
  }
  onClickItemMaster(event: any): void {
    if (event.type === 'click') {
      this.selectedItemMasterId = event.row.id;
      this.fetchItemMasterById();
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

  fetchItemMasterById(): void {
    this.selectedBranches = [];
    this.selectedBranchId = 0;
    this.itemUnitDetails = [];
    if(this.filledBranchId == 0){
      this.filledBranchId = this.currentBranch;
    }
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLITEMMASTERSBYID + 'pageId='+this.pageId+'&Id='+this.selectedItemMasterId+'&BranchId='+this.filledBranchId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.currentItemMaster = response?.data;
          let itemDetails = this.currentItemMaster.item;
          if (Array.isArray(this.currentItemMaster.unit.data)) {
            this.currentItemMaster.unit.data.forEach((itemunit: any) => {
              let itemUnitObj: any = {
                "unitID": itemunit.id,
                "unit": {
                  unit: itemunit.unit,
                  basicUnit: itemunit.basicUnit,
                  factor: itemunit.factor,
                },
                "basicUnit": itemunit.basicUnit,
                "factor": itemunit.factor,
                "sellingPrice": this.baseService.formatInput(itemunit.sellingPrice),
                "purchaseRate": itemunit.purchaseRate,
                "mrp": itemunit.mrp,
                "wholeSalePrice": itemunit.wholeSalePrice,
                "retailPrice": itemunit.retailPrice,
                "wholeSalePrice2": itemunit.discountPrice,
                "retailPrice2": itemunit.otherPrice,
                "lowestRate": itemunit.lowestRate,
                "barcode": itemunit.barcode,
                "active": itemunit.active,
                "branchID": itemunit.branchID,
              };
              this.itemUnitDetails.push(itemUnitObj);
              //push branch ids..
              // this.allBranches.forEach((branch: any) => {
              //   if (branch.id == itemunit.branchID) {
              //     this.selectedBranches.push(branch);
              //   }
              // });
            });
          }
          //set selected branch id as first item ..
          // if (this.selectedBranches.length > 0) {
          //   this.selectedBranchId = this.selectedBranches[0].id;
          //   this.filledBranchId = this.selectedBranches[0].id;
          // }
          //Assign history details of an item ....
          this.allItemHistoryDetails = this.currentItemMaster.history.data;
          //set stock value...
          this.stockToDisplay = this.currentItemMaster.stock.data[0].stock;
          //set form values...
          this.ItemMasterForm.patchValue({
            itemcode: itemDetails.itemCode,
            active: itemDetails.active,
            itemname: itemDetails.itemName,
            arabicname: itemDetails.arabicName,
            basicunit: itemDetails.unit,
            category: itemDetails.categoryID,
            barcodeno: itemDetails.barCode,
            unique: itemDetails.isUniqueItem,
            stockitem: itemDetails.stockItem,
            costprice: itemDetails.purchaseRate,
            margin: itemDetails.margin,
            marginvalue: itemDetails.marginValue,
            sellingprice: this.baseService.formatInput(itemDetails.sellingPrice),
            mrp: itemDetails.mrp,
            taxtype: itemDetails.taxTypeID,
            expiryitem: itemDetails.isExpiry,
            finishedgoods: itemDetails.isFinishedGood,
            rawmaterials: itemDetails.isRawMaterial,
            expirydays: itemDetails.expiryPeriod,
            racklocation: itemDetails.location,
            discount: itemDetails.itemDisc,
            hsncode: itemDetails.hsn,
            quality: itemDetails.qualityID,
            modelno: itemDetails.modelNo,
            manufacturer: itemDetails.manufacturer,
            rol: itemDetails.rol,
            roq: itemDetails.roq,
            shipmark: itemDetails.shipMark,
            paintmark: itemDetails.paintMark,
            stockcode: itemDetails.stock,
            weight: itemDetails.weight,
            oemno: itemDetails.oemNo,
            groupitem: itemDetails.isGroup,
            remarks: itemDetails.remarks
          });
          //set stock item field as true 
          if(itemDetails.stockItem){
            this.isStockItem = true;
          }
          //set image data...
          this.imageData = this.currentItemMaster.img;//itemDetails.imagepath;
          //set basic unit...
          this.allBasicUnits.forEach(item => {
            if (item.unit == itemDetails.unit) {
              this.selectedBasicUnitObj = item;
              this.updatedBasicUnit = item.unit;
            }
          });

          this.onBasicUnitSelected(itemDetails.unit, null);
          this.updatedSellingUnit = itemDetails.sellingUnit;
          this.onSellingUnitSelected(itemDetails.sellingUnit);
          this.updatedPurchaseUnit = itemDetails.purchaseUnit;
          this.onPurchaseUnitSelected(itemDetails.purchaseUnit);

          if (itemDetails.commodityCode != null) {
            this.onCategorySelected(itemDetails.commodityCode);
          }

          //set parent item...
          this.allParentItems.forEach(item => {
            if (item.id === itemDetails.parentID) {
              this.onParentItemSelected(item.itemName);
            }
          });

          //set inv account...
          this.allInvAccounts.forEach(item => {
            if (item.id === itemDetails.invAccountID) {
              this.selectedInvAccountId = item.id;
              this.selectedInvAccountName = item.name;
            }
          });

          //set sales account...
          this.allSalesAccounts.forEach(item => {
            if (item.id == itemDetails.salesAccountID) {
              this.selectedSalesAccountId = item.id;
              this.selectedSalesAccountName = item.name;
            }
          });
          //set cost account...
          this.allCostAccounts.forEach(item => {
            if (item.id === itemDetails.costAccountID) {
              this.selectedCostAccountId = item.id;
              this.selectedCostAccountName = item.name;
            }
          });

          //set purchase account...
          this.allPurchaseAccounts.forEach(item => {
            if (item.id === itemDetails.purchaseAccountID) {
              this.selectedPurchaseAccountId = item.id;
              this.selectedPurchaseAccountName = item.name;
            }
          });


          // this.selectedItemColorName = itemDetails.colorName;
          // this.selectedItemBrandName = itemDetails.brandName;
          // this.selectedCountryOfOriginName = itemDetails.originName;

          //set color...
          this.onItemColorSelected(itemDetails.colorName);

          //set brand...
          this.onItemBrandSelected(itemDetails.brandName);

          //set country of origin..
          this.onItemOriginSelected(itemDetails.originName);


          // this.isLoading = false;
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchUnitDropdown(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLUNITSPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allBasicUnits = response?.data;
          this.basicUnitOptions = this.allBasicUnits.map((item: any) => item.unit);
          // this.allSellingUnits = response?.data;
          // this.sellingUnitOptions = this.allSellingUnits.map((item:any) => item.unit);
          // this.allPurchaseUnits = response?.data;
          // this.purchaseUnitOptions = this.allPurchaseUnits.map((item:any) => item.unit);
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchCategories(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLALLITEMMASTERCATEGORIES)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allCategories = response?.data;
          this.categoryOptions = this.allCategories.map((item: any) => ({
            code: item.code,
            description: item.description
          }));

          this.filteredCategories = this.allCategories.map((item: any) => ({
            id: item.id,
            value: item.description
          }));
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchAllTaxTypes(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLTAXDROPDOWN)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          //this.isLoading = false;
          this.allTaxTypes = response?.data;
          this.ItemMasterForm.patchValue({
            "taxtype": this.allTaxTypes ? this.allTaxTypes[0].id : null
          });
        },
        error: (error) => {
         // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchParentItems(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLPARENTITEMS)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allParentItems = response?.data;
          this.parentItemOptions = this.allParentItems.map((item: any) => ({
            itemCode: item.itemCode,
            itemName: item.itemName,
            id: item.id
          }));
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchItemQuality(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLQUALITY)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allQualities = response?.data[0];
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchItemColors(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLITEMCOLOR)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allItemColors = response?.data[0];
          this.itemColorOptions = this.allItemColors.map((item: any) => ({
            code: item.code,
            value: item.value,
            id: item.id
          }));
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchItemBrands(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLITEMBRAND)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allItemBrands = response?.data[0];
          this.itemBrandOptions = this.allItemBrands.map((item: any) => ({
            value: item.value,
            id: item.id
          }));
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchCountryOfOrigin(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLITEMORIGIN)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allCountryOfOrigin = response?.data[0];
          this.countryOfOriginOptions = this.allCountryOfOrigin.map((item: any) => ({
            code: item.code,
            value: item.value,
            id: item.id
          }));
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchAccounts(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLITEMACCOUNT)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          // this.isLoading = false;
          this.allInvAccounts = response?.data;
          this.invAccountOptions = this.allInvAccounts.map((item: any) => item.name);
          this.allSalesAccounts = response?.data;
          this.salesAccountOptions = this.allSalesAccounts.map((item: any) => item.name);
          this.allPurchaseAccounts = response?.data;
          this.purchaseAccountOptions = this.allPurchaseAccounts.map((item: any) => item.name);
          this.allCostAccounts = response?.data;
          this.costAccountOptions = this.allCostAccounts.map((item: any) => item.name);
        },
        error: (error) => {
          // this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchAllBranches(): void {
    // this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLALLBRANCH)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.allBranches = response?.data;
          // this.isLoading = false;
        },
        error: (error) => {
          console.error('An Error Occured', error);
          // this.isLoading = false;
        },
      });
  }

  generateBarCode(rowIndex: any) {
    let barCodeValue = this.ItemMasterForm.get('barcodeno')?.value;
    if ((barCodeValue != "" && confirm("Are you sure you want to update the barcode?")) || barCodeValue == "") {
      // this.isLoading = true;
      this.itemMasterService
        .getDetails(EndpointConstant.GENERATEBARCODE)
        .pipe(takeUntil(this.destroySubscription))
        .subscribe({
          next: (response) => {
            // this.isLoading = false;
            if (rowIndex == 0) {
              this.ItemMasterForm.patchValue({
                barcodeno: response?.data[0].barcode
              });
            }
            if (this.itemUnitDetails.length > 0) {
              this.itemUnitDetails[rowIndex]['barcode'] = response?.data[0].barcode.toString();
            }

          },
          error: (error) => {
            // this.isLoading = false;
            console.error('An Error Occured', error);
          },
        });
    }
  }

  onBasicUnitSelected(option: string, rowIndex: any): any {
    let selectedBasicUnit: any = {};
    if (rowIndex == 0) {
      this.ItemMasterForm.patchValue({
        basicunit: option,
      });
      this.updatedBasicUnit = option;
    }
    this.allBasicUnits.forEach(function (item) {
      if (item.unit === option) {
        selectedBasicUnit = item;
      }
    });
    this.selectedBasicUnitObj = selectedBasicUnit;
    if (option != "" && rowIndex != null) {
      if (this.itemUnitDetails.length > 0) {
        let preUnit = this.itemUnitDetails[rowIndex]['unit'];

        const index = Object.keys(this.unitsInGrid).findIndex(key => this.unitsInGrid['unit'] === preUnit.unit);

        // If the unit is found, remove it
        if (index !== -1) {
          const unitIdToRemove = Object.keys(this.unitsInGrid)[index];
          delete this.unitsInGrid[unitIdToRemove];
        }
      }
      if (this.itemUnitDetails.length == 0) {
        let newUnitItem = {
          unitID: 0,
          unit: this.selectedBasicUnitObj,
          basicUnit: option,
          factor: 1,
          sellingPrice: this.ItemMasterForm.get('costprice')?.value != null ? parseFloat(this.ItemMasterForm.get('costprice')?.value) : 0.0000,
          purchaseRate: this.ItemMasterForm.get('sellingprice')?.value != null ? parseFloat(this.ItemMasterForm.get('sellingprice')?.value) : 0.0000,
          mrp: this.ItemMasterForm.get('mrp')?.value != null ? parseFloat(this.ItemMasterForm.get('mrp')?.value) : 0.0000,
          wholeSalePrice: 0.0000,
          retailPrice: 0,
          wholeSalePrice2: 0,
          retailPrice2: 0,
          lowestRate: 0,
          barcode: this.ItemMasterForm.get('barcodeno')?.value != null ? this.ItemMasterForm.get('barcodeno')?.value.toString() : '',
          active: true,
          status: 0
        };
        this.itemUnitDetails.push(newUnitItem);
      } else {
        this.itemUnitDetails[rowIndex]['unit'] = this.selectedBasicUnitObj;
        //this.itemUnitDetails[rowIndex]['basicUnit'] = this.itemUnitDetails[0]['basicUnit'];
      }
    }

    if (rowIndex == 0) {
      // setting all basic unit in grid to item basic unit 
      this.itemUnitDetails.forEach((item: any) => {
        item.basicUnit = option;
      });
    }

    if (this.selectedBasicUnitObj && !this.unitsInGrid.some((unit: any) => unit.unit === this.selectedBasicUnitObj.unit)) {
      this.unitsInGrid.push(this.selectedBasicUnitObj);
      this.purchaseUnitOptions = this.unitsInGrid;
      this.sellingUnitOptions = this.unitsInGrid;
    }

    this.itemUnitDetails = [...this.itemUnitDetails];
    //call addunit function..
    this.addUnit();
  }

  onBrandDropdownSelected(option:any){
    this.selectedBrands = option;
  }

  onCategoryDropdownSelected(option:any){
    this.selectedCategories = option;
  }

  onSellingUnitSelected(option: string): any {
    this.ItemMasterForm.patchValue({
      sellingunit: option,
    });

    let selectedSellingUnit = {};
    this.allBasicUnits.forEach(function (item) {
      if (item.unit === option) {
        selectedSellingUnit = item;
      }
    });
    this.selectedSellingUnitObj = selectedSellingUnit;
    this.updatedSellingUnit = option;
  }

  onPurchaseUnitSelected(option: string): any {
    this.ItemMasterForm.patchValue({
      purchaseunit: option,
    });
    let selectedPurchaseUnit = {};
    this.allBasicUnits.forEach(function (item) {
      if (item.unit === option) {
        selectedPurchaseUnit = item;
      }
    });
    this.selectedPurchaseUnitObj = selectedPurchaseUnit;
    this.updatedPurchaseUnit = option;
  }

  onCategorySelected(option: string): any {
    this.ItemMasterForm.patchValue({
      category: option,
    });
    let selectedCategory: any = {};
    this.allCategories.forEach(function (item) {
      if ((item.code) === option) {
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
    const selectedTaxTypeId = this.ItemMasterForm.get('taxtype')?.value;
    const selectedTaxTypeName = this.allTaxTypes.find(taxtype => taxtype.id === selectedTaxTypeId)?.name;
    this.selectedTaxTypeObj = { id: selectedTaxTypeId, name: selectedTaxTypeName || '' };
  }

  onParentItemSelected(option: string): any {
    let selectedParentItem: any = {};
    this.ItemMasterForm.patchValue({
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
    const selectedQualityId = this.ItemMasterForm.get('quality')?.value;
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
    if(rowIndex == 0){
      this.ItemMasterForm.patchValue({
        "sellingprice":option.target.value
      });
    }
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
      this.ItemMasterForm.get('invaccount')?.enable();
      this.ItemMasterForm.get('salesaccount')?.enable();
      this.ItemMasterForm.get('costaccount')?.enable();
      this.ItemMasterForm.get('purchaseaccount')?.enable();
    } else {
      this.ItemMasterForm.get('invaccount')?.disable();
      this.ItemMasterForm.get('salesaccount')?.disable();
      this.ItemMasterForm.get('costaccount')?.disable();
      this.ItemMasterForm.get('purchaseaccount')?.disable();
    }
  }

  changeRatesInGrid(factor: any, rowIndex: any) {
    this.itemUnitDetails[rowIndex]['purchaseRate'] = (this.itemUnitDetails[0]['purchaseRate']) * factor;
    this.itemUnitDetails[rowIndex]['sellingPrice'] = (this.itemUnitDetails[0]['sellingPrice']) * factor;
    this.itemUnitDetails[rowIndex]['mrp'] = (this.itemUnitDetails[0]['mrp']) * factor;
  }

  addUnit() {
    const allItemCodesFilled = this.itemUnitDetails.every((unititem:any) => unititem.unit.unit && unititem.unit.unit.trim() !== '');

    if (!allItemCodesFilled) { 
      return false;
    }
    let basicUnit = null;
    if (this.itemUnitDetails.length > 0) {
      basicUnit = this.itemUnitDetails[0].basicUnit;
    }
    let newUnitItem = {
      unitID: 0,
      unit: { unit: '', basicUnit: '', factor: 0 },
      basicUnit: basicUnit,
      factor: 0,
      sellingPrice: 0,
      purchaseRate: 0,
      mrp: 0,
      wholeSalePrice: 0,
      retailPrice: 0,
      wholeSalePrice2: 0,
      retailPrice2: 0,
      lowestRate: 0,
      barcode: null,
      active: true,
      status: 0
    };
    if (this.itemUnitDetails.length == 0) {
      newUnitItem.barcode = this.ItemMasterForm.get('barcodeno')?.value != null ? this.ItemMasterForm.get('barcodeno')?.value.toString() : '';
    }
    this.itemUnitDetails.push(newUnitItem);
    this.itemUnitDetails = [...this.itemUnitDetails];
    return true;
  }

  // Declare flag to control manual changes and avoid maximum call stack errors


onCostPriceChange() {
  if (!this.isManualChange) {
    this.isManualChange = true;

    let costPrice = this.ItemMasterForm.get('costprice')?.value;
    let marginPercent = this.ItemMasterForm.get('margin')?.value ?? 0;
    let marginvalue = this.baseService.formatInput(Number(costPrice) * (Number(marginPercent) / 100));
    let sellingPrice = this.baseService.formatInput(Number(costPrice) + Number(marginvalue));

    this.ItemMasterForm.patchValue({
      sellingprice: sellingPrice,
      marginvalue: marginvalue
    });

    if (this.itemUnitDetails.length > 0) {
      this.itemUnitDetails[0]['purchaseRate'] = costPrice;
      this.itemUnitDetails[0]['sellingPrice'] = sellingPrice;
      this.itemUnitDetails[0]['mrp'] = this.ItemMasterForm.get('mrp')?.value ?? 0;
    }

    this.onFormSellingPriceChange();

    this.isManualChange = false;
  }
}

onMarginPercentageChange() {
  if (!this.isManualChange) {
    this.isManualChange = true;

    let costPrice = this.ItemMasterForm.get('costprice')?.value;
    if (costPrice != null) {
      let marginPercent = this.ItemMasterForm.get('margin')?.value ?? 0;
      let marginvalue = this.baseService.formatInput(costPrice * (marginPercent / 100));
      let sellingPrice = this.baseService.formatInput(Number(costPrice) + Number(marginvalue));

      this.ItemMasterForm.patchValue({
        sellingprice: sellingPrice,
        marginvalue: marginvalue
      });
    }

    this.isManualChange = false;
  }
}

onMarginValueChange() {
  if (!this.isManualChange) {
    this.isManualChange = true;

    let costPrice = this.ItemMasterForm.get('costprice')?.value;
    if (costPrice != null) {
      let marginvalue = this.ItemMasterForm.get('marginvalue')?.value ?? 0;
      let sellingPrice = this.baseService.formatInput(costPrice + marginvalue);

      this.ItemMasterForm.patchValue({
        sellingprice: sellingPrice
      });
    }

    this.isManualChange = false;
  }
}

onFormSellingPriceChange() {
  if (!this.isManualChange) {
    this.isManualChange = true;

    let sellingPrice = this.ItemMasterForm.get('sellingprice')?.value;
    if (sellingPrice != null) {
      let taxType = this.ItemMasterForm.get('taxtype')?.value;
      let taxPercentage = 0;
      this.allTaxTypes.forEach(function (item) {
        if (item.id == taxType) {
          taxPercentage = item.salesPerc;
        }
      });

      let taxValue = (sellingPrice * (taxPercentage / 100));
      let mrpPrice = this.baseService.formatInput(parseFloat(sellingPrice) + taxValue);

      this.ItemMasterForm.patchValue({
        mrp: mrpPrice
      });

      if (this.itemUnitDetails.length > 0) {
        this.itemUnitDetails[0]['purchaseRate'] = this.ItemMasterForm.get('costprice')?.value ?? 0;
        this.itemUnitDetails[0]['sellingPrice'] = sellingPrice;
        this.itemUnitDetails[0]['mrp'] = mrpPrice;
      }
    }

    this.isManualChange = false;
  }
}

onItemMrpChange() {
  if (!this.isManualChange) {
    this.isManualChange = true;

    let mrpPrice = this.ItemMasterForm.get('mrp')?.value;
    let taxType = this.ItemMasterForm.get('taxtype')?.value;
    let taxPercentage = 0;
    this.allTaxTypes.forEach(function (item) {
      if (item.id == taxType) {
        taxPercentage = item.salesPerc;
      }
    });

    let sellingPrice = this.baseService.formatInput(mrpPrice * (100 / (100 + taxPercentage)));
    this.ItemMasterForm.patchValue({
      sellingprice: sellingPrice
    });

    if (this.itemUnitDetails.length > 0) {
      this.itemUnitDetails[0]['sellingPrice'] = sellingPrice;
      this.itemUnitDetails[0]['mrp'] = mrpPrice;
    }

    this.isManualChange = false;
  }
}


  selectBranch(event: Event) {
    const selectedBranchId = (event.target as HTMLSelectElement).value;
    this.selectedBranches = [];
    this.filledBranchId  = Number(selectedBranchId);
    if(this.selectedItemMasterId != 0 ){
      this.fetchItemMasterById();
    }
    this.allBranches.forEach((branch: any) => {
      if (branch.id == selectedBranchId) {
        this.selectedBranches.push(branch);
      }
    });

    
   
  }

  onClickBranchFill(branchId: number) {
    this.filledBranchId = branchId;
    this.fetchItemMasterById();
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

  translateItemName() {
    let itemName = this.ItemMasterForm.get('itemname')?.value;


    // this.itemMasterService
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
  searchItems() {
    let currentBranchId = this.baseService.getLocalStorgeItem('current_branch');
    let urlString = '?';
    if (currentBranchId != "") {
      urlString = urlString + 'branch=' + currentBranchId + '&'
    }
    if (this.selectedBrands.length > 0) {
      this.selectedBrands.forEach(function (brand: any) {
        urlString = urlString + 'brandId=' + brand.id + '&';
      });
    }
    if (this.selectedCategories.length > 0) {
      this.selectedCategories.forEach(function (category: any) {
        urlString = urlString + 'catId=' + category.id + '&';
      });
    }
      
    //this.isLoading = true;
    this.itemMasterService
      .getDetails(EndpointConstant.FILLALLITEMMASTER + urlString)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          if (this.selectedBrands.length > 0 || this.selectedCategories.length > 0) {
            this.allItemMasters = response?.data;
          } else {
            this.allItemMasters = this.savedItemMasterList;
          }
          //this.isLoading = false;
        },
        error: (error) => {
          console.error('An Error Occured', error);
          //this.isLoading = false;
        },
      });
  }

  onClickCopyItemmaster(){
    this.showCopyPopup = true;
  }

  copyItemDetailsToBranch(){
    this.showCopyPopup = false;

    let itemDetails = this.currentItemMaster.item;
    //get category of itemmaster..
    let categoryObj = { 
      "id": itemDetails.commodityID,   
      "code": itemDetails.commodityCode,  
      "category": itemDetails.commodity 
    }; 
    //set basic unit...
    let selectedBasicUnitObj = {};
    this.allBasicUnits.forEach(item => {
      if (item.unit == itemDetails.unit) {
        selectedBasicUnitObj = item;
      }
    });
    //set cost price....
    let costPrice:any = 0;
    if (this.copyFieldObj.includes('costprice')) {
      costPrice = this.ItemMasterForm.value.costprice;
    } else{
      costPrice = itemDetails.purchaseRate;
    }

    //set selling price....
    let sellingPrice:any = 0;
    if (this.copyFieldObj.includes('sellingPrice')) {
      sellingPrice = this.ItemMasterForm.value.sellingprice;
    } else{
      sellingPrice = itemDetails.sellingPrice;
    }

     //set mrp....
     let mrp:any = 0;
     if (this.copyFieldObj.includes('mrp')) {
      mrp = this.ItemMasterForm.value.mrp;
     } else{
      mrp = itemDetails.mrp;
     }

     //setting tax type 
     let taxType = { 
      id: itemDetails.taxTypeID,
      name: itemDetails.taxType || '' 
     };

     //setting parent...
    let parent = {};
    this.allParentItems.forEach(item => {
      if (item.id === itemDetails.parentID) {
        parent = item;
      }
    });

     //setting item quality
     let itemQuality = { 
      id: itemDetails.qualityID,
      value: itemDetails.quality || '' 
     };

    //setting color...
    let color:any = {};
    this.allItemColors.forEach(item => {
      if (item.id === itemDetails.colorID) {
        color.id = item.id;
        color.code = item.code;
        color.name = item.value;
        color.description = "";
      }
    });

    //setting item brand..
    let itemBrand: any = {};
    this.allItemBrands.forEach(function (item) {
      if (item.id === itemDetails.brandID) {
        itemBrand.id = item.id;
        itemBrand.code = item.code;
        itemBrand.name = item.value;
        itemBrand.description = "";
      }
    });

    //setting country of origin...
    let countryOfOrigin: any = {};
    this.allCountryOfOrigin.forEach(function (item) {
      if (item.value === itemDetails.originName) {
        countryOfOrigin.id = item.id;
        countryOfOrigin.code = item.code;
        countryOfOrigin.name = item.value;
        countryOfOrigin.description = "";
      }
    });

    //set rol....
    let rol:any = 0;
    if (this.copyFieldObj.includes('rol')) {
      rol = this.ItemMasterForm.value.rol;
    } else{
      rol = itemDetails.rol;
    }

    //setting seloling unit
    let sellingUnit = {
      unit: "",
      basicUnit: "",
      factor: 0
    };
    
    this.allBasicUnits.forEach(function (item) {
      if (item.unit === itemDetails.sellingUnit) {
        sellingUnit = item;
      }
    });

    //setting purchase unit ...
    let purchaseUnit = {
      unit: "",
      basicUnit: "",
      factor: 0
    };
    this.allBasicUnits.forEach(function (item) {
      if (item.unit === itemDetails.purchaseUnit) {
        purchaseUnit = item;
      }
    });

     //set inv account...
     let invAccount = {};
     this.allInvAccounts.forEach(item => {
      if (item.id === itemDetails.invAccountID) {
        invAccount = {
          "id":item.id,
          "name":item.name
        }
      }
    });

    //set sales account...
    let salesAccount = {};
    this.allSalesAccounts.forEach(item => {
      if (item.id == itemDetails.salesAccountID) {
        salesAccount = {
          "id":item.id,
          "name":item.name
        }
      }
    });
    //set cost account...
    let costAccount = {};
    this.allCostAccounts.forEach(item => {
      if (item.id === itemDetails.costAccountID) {
        costAccount = {
          "id":item.id,
          "name":item.name
        }
      }
    });

    //set purchase account...
    let purchaseAccount = {};
    this.allPurchaseAccounts.forEach(item => {
      if (item.id === itemDetails.purchaseAccountID) {
        purchaseAccount = {
          "id":item.id,
          "name":item.name
        }
      }
    });

    //set unit details ...


    let itemUnitDetailsArr = [] as Array<ItemUnitDetails>;
    this.currentItemMaster.unit.data.forEach((itemunit: any, index: number) => {
      let itemUnitObj: any = {
        "unitID": itemunit.id,
        "unit": {
          unit: itemunit.unit,
          basicUnit: itemunit.basicUnit,
          factor: itemunit.factor,
        },
        "basicUnit": itemunit.basicUnit,
        "factor": itemunit.factor,
        "sellingPrice": this.copyFieldObj.includes('sellingPrice') ? this.itemUnitDetails[index].sellingPrice : itemunit.sellingPrice,
        "purchaseRate": this.copyFieldObj.includes('purchaseRate') ? this.itemUnitDetails[index].purchaseRate : itemunit.purchaseRate,
        "mrp": this.copyFieldObj.includes('mrp') ? this.itemUnitDetails[index].mrp : itemunit.mrp,
        "wholeSalePrice": this.copyFieldObj.includes('wholeSalePrice') ? this.itemUnitDetails[index].wholeSalePrice : itemunit.wholeSalePrice,
        "retailPrice": this.copyFieldObj.includes('retailPrice') ? this.itemUnitDetails[index].retailPrice : itemunit.retailPrice,
        "wholeSalePrice2": this.copyFieldObj.includes('wholeSalePrice2') ? this.itemUnitDetails[index].wholeSalePrice2 : itemunit.discountPrice,
        "retailPrice2": this.copyFieldObj.includes('retailPrice2') ? this.itemUnitDetails[index].retailPrice2 : itemunit.otherPrice,
        "lowestRate": this.copyFieldObj.includes('lowestRate') ? this.itemUnitDetails[index].lowestRate : itemunit.lowestRate,
        "barcode": itemunit.barcode,
        "active": itemunit.active,
        "branchID": itemunit.branchID,
      };
      itemUnitDetailsArr.push(itemUnitObj);
    });

    const payload = {
      itemCode: itemDetails.itemCode,
      itemName: itemDetails.itemName,
      arabicName: itemDetails.arabicName,
      unit: selectedBasicUnitObj,
      barCode: itemDetails.barCode,
      category: categoryObj,
      isUniqueItem: itemDetails.isUniqueItem,
      stockItem: itemDetails.stockItem,
      costPrice: costPrice,
      sellingPrice: sellingPrice,
      mrp: mrp,
      margin: itemDetails.margin,
      marginValue: itemDetails.margin,
      taxType: taxType,
      isExpiry: itemDetails.isExpiry,
      expiryPeriod: itemDetails.expiryPeriod,
      isFinishedGood: itemDetails.isFinishedGood,
      isRawMaterial: itemDetails.isRawMaterial,
      location: itemDetails.location,
      itemDisc: itemDetails.itemDisc,
      hsn: itemDetails.hsn,
      parent: parent,
      quality: itemQuality,
      modelNo: itemDetails.modelNo,
      color: color,
      brand: itemBrand,
      countryOfOrigin: countryOfOrigin,
      rol: rol,
      partNo: itemDetails.stock,
      roq: itemDetails.roq,
      manufacturer: itemDetails.manufacturer,
      weight:itemDetails.weight,
      shipMark: itemDetails.shipMark,
      paintMark: itemDetails.paintMark,
      sellingUnit: sellingUnit,
      oemNo: itemDetails.oemNo,
      purchaseUnit: purchaseUnit,
      isGroup: itemDetails.isGroup,
      active: itemDetails.active,
      invAccount: invAccount,
      salesAccount:salesAccount,
      costAccount: costAccount,
      purchaseAccount: purchaseAccount,
      remarks: itemDetails.remarks,
      itemUnit: itemUnitDetailsArr,
      branch: this.copyBranchObj,
      imageFile: itemDetails.imagepath
    };
    this.updateCallback(payload, this.selectedItemMasterId);    
  }

  onClickBranch(event: Event, branchId: any) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      if (!this.copyBranchObj.includes(branchId)) {
        this.allBranches.forEach((branch: any) => {
          if (branch.id == branchId) {
            this.copyBranchObj.push(branch);
          }
        });
      }
    } else{
      const index = this.copyBranchObj.findIndex((branch: any) => branch.id === branchId);
      if (index !== -1) {
        this.copyBranchObj.splice(index, 1);
      }
    }
  }


  onClickField(event: Event, fieldName: string) {
    const checkbox = event.target as HTMLInputElement;
    const predefinedFields = [ 'rate', 'costprice', 'purchaseRate', 'sellingPrice', 'mrp', 'wholeSalePrice', 'retailPrice', 'wholeSalePrice2', 'retailPrice2', 'lowestRate'];
    if (checkbox.checked) {
      if(fieldName == 'rate'){
        for (const field of predefinedFields) {
          if (!this.copyFieldObj.includes(field)) {
            this.copyFieldObj.push(field);
          }
        }
      } else{
        //if selling price or mrp checked. ensure both are checked...
        if(fieldName == 'sellingPrice' || fieldName == 'mrp'){
          if (!this.copyFieldObj.includes('sellingPrice')) {
            this.copyFieldObj.push('sellingPrice');
          }
          if (!this.copyFieldObj.includes('mrp')) {
            this.copyFieldObj.push('mrp');
          }
        } else{
          if (!this.copyFieldObj.includes(fieldName)) {
            this.copyFieldObj.push(fieldName);
          }
        }
       
      }
    } else {
      if(fieldName == 'rate'){
        this.copyFieldObj = this.copyFieldObj.filter(field => !predefinedFields.includes(field));
      } else{
        if (predefinedFields.includes(fieldName)) {
          this.copyFieldObj = this.copyFieldObj.filter(field => field !== 'rate');
        }
        if(fieldName == 'sellingPrice' || fieldName == 'mrp'){
          this.copyFieldObj = this.copyFieldObj.filter(field => field !== 'sellingPrice');
          this.copyFieldObj = this.copyFieldObj.filter(field => field !== 'mrp');
        } else{
          const index = this.copyFieldObj.indexOf(fieldName);
          if (index !== -1) {
            this.copyFieldObj.splice(index, 1);
          }
        }
        
      }      
    }
  }

  isChecked(fieldName: string): boolean {
    return this.copyFieldObj.includes(fieldName);
  }

  toggleRateGroup(){
    this.showRateGroup = !this.showRateGroup;
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



  onKeyDown(event: KeyboardEvent) {
    
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
          if (this.currentRowIndex < this.itemUnitDetails.length - 1) {
            this.currentRowIndex++;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          }          
          // this.gridnavigationService.moveToNextRow(this.itemUnitDetails, this.focusGridCell.bind(this));
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
        if(cursorPosition == 0 && this.currentColumname != 'unit'){
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
          if(this.itemUnitDetails.length > 1){
            let index = this.itemUnitDetails.length - 2;
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
          

        } else {
          if (this.currentRowIndex < this.itemUnitDetails.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            // focusCell(this.currentRowIndex, this.currentColIndex);
          } else {
            this.addUnit();
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
          // this.moveFocusToDropdown('supplier'); // Move focus to the supplier input or other logic
        } else {
          event.preventDefault();         
          this.enableInlineEditing = false; 
          
          let currentCoulmn = this.tablecolumns[this.currentColIndex];
          
         
          if (this.currentRowIndex < this.itemUnitDetails.length - 1) {
            this.currentRowIndex++;
            this.currentColIndex = 0;
            this.scrollToCell(this.currentRowIndex,this.currentColIndex);
            this.enableInlineEditing = false;
            this.focusGridCell(this.currentRowIndex, this.currentColIndex);
          } else{
            this.addUnit();
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

      

      

      default:
        if(!this.isInputDisabled){
        
                    
          // Handle other keys for inline editing
          const cellId = (event.target as HTMLElement).id;
          const cellElement = document.getElementById(cellId);
          if (cellElement) {
            const columnName = cellElement.getAttribute('data-column-name');
            const columnKeyName = cellElement.getAttribute('data-column-key-name');
            if(columnName != null){
              this.currentColumname = columnName;
            }
            if(this.enableInlineEditing == false && (columnName != 'id' && columnName != 'basicunit' && columnName != 'generate' && columnName != 'print' && columnName != 'active' )){
              this.enableInlineEditing = true;
              setTimeout(() => {
                const cellElement = document.getElementById(cellId);
                let newValue = event.key;
                // Check if the key is a character key
                const isCharacterKey = event.key.length === 1;
                if ((cellElement instanceof HTMLInputElement || cellElement instanceof HTMLTextAreaElement) && isCharacterKey) {
                  // If it's an input or textarea, set the value
                  cellElement.value = newValue;
                  if (columnKeyName !== null && columnKeyName !== undefined) {console.log(columnName);
                    console.log(this.currentColIndex);
                    console.log(this.currentRowIndex);
                    if(columnName == 'unit'){
                      this.itemUnitDetails[this.currentRowIndex][columnKeyName]['unit'] = event.key;
                    } else{
                      let tempRow:any = { ...this.itemUnitDetails[this.currentRowIndex] };
                      tempRow[columnKeyName] = event.key;
                      this.itemUnitDetails[this.currentRowIndex] = tempRow;
                    }                   
                    
                  }
                  this.itemUnitDetails = [...this.itemUnitDetails];
                  this.focusGridCell(this.currentRowIndex, this.currentColIndex);
                } 
              }, 0);
              
            }  
          }  
        }
        break;
    }
    return true;
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
    if(this.currentColumname != 'id'  && this.currentColumname != 'basicunit' && this.currentColumname != 'generate' && this.currentColumname != 'print' && this.currentColumname != 'active'){
      this.enableInlineEditing  = true;
    }    
  }

  isSelectedCell(rowIndex: number, colIndex: number): boolean {
    return this.currentRowIndex == rowIndex && this.currentColIndex == colIndex;
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

  focusGridCell(rowIndex: number, colIndex: number): void {
    this.gridnavigationService.focusCell(this.gridCells.toArray(), rowIndex, colIndex);
  }

  deleteItemGrid(index: any) {
    if (confirm("Are you sure you want to delete this details?")) {
      if ( this.itemUnitDetails.length == 1) {
        // this.noGridItem = true;
        this.itemUnitDetails = [];
        this.itemUnitDetails.push(this.deliveryDetailsObj);
      } else if (index !== -1) {
        this.itemUnitDetails.splice(index, 1);
        this.selected = [];
      }
      this.itemUnitDetails = [...this.itemUnitDetails];
      this.selectedRowIndex = -1
    }
    return true;
  }

  onColumKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.gridnavigationService.moveToNextRow(this.itemUnitDetails, this.focusGridCell.bind(this));
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
        this.gridnavigationService.handleNavigationKey(this.tablecolumns, this.itemUnitDetails, this.focusGridCell.bind(this), this.addUnit.bind(this));
        break;
    }
  }
  

  ngAfterViewInit(): void {
    this.setMaxHeight();
    this.isOverlayVisible = !!this.overlayElement.nativeElement;
    if (this.isOverlayVisible) {
      this.adjustOverlayHeight();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.setMaxHeight();
  }

  setMaxHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0; // Adjust if you have a footer

    const stickybuttonHeight = this.stickybuttoncontainer.nativeElement.offsetHeight;
    const btnGroupHeight = this.btngroup.nativeElement.offsetHeight;
    const leftsearchHeight = this.leftsearch.nativeElement.offsetHeight;
   const availableHeight = window.innerHeight - headerHeight - footerHeight - stickybuttonHeight -btnGroupHeight - 30;
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight - leftsearchHeight-30;
    const sections = document.querySelectorAll('.right-section');
    sections.forEach(section => {
      (section as HTMLElement).style.height = `${availableHeight}px`;
    });

    const leftsection = document.querySelectorAll('.ngx-datatable.scroll-vertical');
    leftsection.forEach(section => {
      (section as HTMLElement).style.setProperty('height', `${leftContentHeight}px`, 'important');
    });
  }

  adjustOverlayHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0; // Adjust if you have a footer
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight;
    //this.overlayElement.nativeElement.style.height = `${leftContentHeight}px`;
  }
  onClickTab(tabId: any): void {
    this.selectedTab = tabId;
    this.showItemDetails = false;
    this.showHistory = false;
    this.showOtherDetails = false;
    this.setMaxHeight();
    if (tabId == 1) {
      this.showItemDetails = true;
    } else if (tabId == 2) {
      this.showHistory = true;
      this.allItemHistoryDetails = [...this.allItemHistoryDetails];
    } else if (tabId == 3) {
      this.showOtherDetails = true;
    } else {

    }
  }
  cancelCopy(){
    this.showCopyPopup = false;
    this.showRateGroup = false;
    this.copyFieldObj = [];
    this.copyBranchObj = [];
  }

  triggerFileInput() {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click(); // Programmatically trigger the click event
  }

  validateInputNumber(event: Event) {
    this.inputValidationService.validateDecimalInput(event);
  }
  

  ngOnDestroy(): void {
    this.destroySubscription.next();
    this.destroySubscription.complete();
    // Destroy DataTables when the component is destroyed
    // if ($.fn.DataTable.isDataTable(this.table.nativeElement)) {
    //   $(this.table.nativeElement).DataTable().destroy();
    // }
  }

}
