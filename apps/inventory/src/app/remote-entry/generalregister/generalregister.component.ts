import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ElementRef, HostListener, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { BaseService, EndpointConstant, GridNavigationService, MainHeaderComponent, MenuDataService, SearchableDropdownComponent } from '@dfinance-frontend/shared';
import { Subject, takeUntil } from 'rxjs';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { DatePipe, formatDate } from '@angular/common';
import {
  NativeDateAdapter, DateAdapter,
  MAT_DATE_FORMATS
} from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { AREA, BASICTYPE, BRANCHES, COUNTERS, CUSTOMERSUPPLIER, ITEMS, PAYMENTTYPE, REPORTDATA, STAFF, USERS, VOUCHERTYPE } from '../model/generalregister.interface';
import { GeneralRegisterService } from '../../services/generalregister.service';
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

// Define the type for your rows
interface DataRow {
  name: string;
  age: number;
  job: string;
}
@Component({
  selector: 'dfinance-frontend-generalregister',
  templateUrl: './generalregister.component.html',
  styleUrls: ['./generalregister.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: PickDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: PICK_FORMATS }
  ]
})
export class GeneralregisterComponent {
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  // @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;
  // @ViewChild('ngxTable', { read: ElementRef }) ngxTable!: ElementRef;
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  @ViewChild('btngroup') btngroup!: ElementRef;
  ColumnMode = ColumnMode;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  filterForm!: FormGroup;
  isLoading = false;

  isUpdate: boolean = false;
  pageId = 0;

  isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  tableHeight = 200;
  istoggleActive = false;

  isMaximized = false;
  defaultCustomer = 0;
  selectedView: string = 'inventory';
  currentBranch: number = 0;
  currentUser: string = "";
  selectedbutton: any = "";
  reportData = [] as Array<REPORTDATA>;

  leftGridDebitCash:number= 0;
  leftGridCreditCash:number= 0;
  leftGridDebitCredit:number= 0;
  leftGridCreditCredit:number= 0;
  leftGridDebitTotal:number= 0;
  leftGridCreditTotal:number= 0;

  cashId:any = 0;
  creditId:any = 0;


  basicTypesarr = [] as Array<BASICTYPE>;
  voucherTypesarr = [] as Array<VOUCHERTYPE>;
  itemsArr = [] as Array<ITEMS>;
  staffArr = [] as Array<STAFF>;
  customerSupplierArr = [] as Array<CUSTOMERSUPPLIER>;
  areaArr = [] as Array<AREA>;
  paymentTypes = [] as Array<PAYMENTTYPE>;
  counters = [] as Array<COUNTERS>;
  users = [] as Array<USERS>;
  branches = [] as Array<BRANCHES>;

  selectedBasicType: any = {};
  selectedVoucherType: any = {};
  selectedItem: any = {};
  selectedStaff: any = {};
  selectedCustomerSupplier: any = {};
  selectedArea: any = {};
  selectedPaymentType: any = {};
  selectedCounter: any = {};
  selectedUser: any = {};
  selectedBranch: any = {};


  updatedBasicType: any = "";
  basictypereturnField = 'name';
  basictypeKeys = ['ID', 'Name'];

  updatedVoucherType: any = "";
  vouchertypereturnField = 'name';
  vouchertypeKeys = ['Code', 'Name', 'ID'];
  vouchertypeexclude = ['primaryVoucherId'];

  updatedCussup: any = "";
  cussupreturnField = 'accountName';
  cussupKeys = ['AccountCode', 'Account Name', 'ID'];

  updatedItem: any = "";
  itemreturnField = 'itemName';
  itemKeys = ['Item Code', 'Item Name', 'Unit', 'ID'];

  updatedstaff: any = "";
  staffreturnField = 'name';
  staffKeys = ['Account Code', 'Account Name', 'ID'];

  updatedarea: any = "";
  areareturnField = 'name';
  areaKeys = ['Code', 'Name'];
  areaexclude = ['id'];

  updatedCounter: any = "";
  counterreturnField = 'counterName';
  counterKeys = ['Machine Name', 'Counter Code', 'Counter Name', 'Machine IP', 'ID'];

  updatedUser: any = "";
  userreturnField = 'username';
  userKeys = ['ID', 'Username', 'First name', 'Last Name', 'EmailID', 'Mobile Number'];

  isInputDisabled: any = false;
  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private renderer: Renderer2,
    private generalRegisterService: GeneralRegisterService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private baseService: BaseService,
    private gridnavigationService: GridNavigationService,
    private menudataService: MenuDataService,
    private dialog: MatDialog,
    private el: ElementRef
  ) {

    // Access query parameters
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
    // if (queryParams && queryParams['voucherNo']) {
    //   this.voucherNo = queryParams['voucherNo'];
    // }

  }

  userTyping: any = false;
  tipContent: any = "";

  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  showTopBar: boolean = false;
  showBottomBar: boolean = false;
  showLeftSection: boolean = true;
  // Get a list of all SearchableDropdownComponent instances
  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;
  activePrintOption = false;

  ngOnInit(): void {
    const today = new Date();
    this.filterForm = this.formBuilder.group({
      selectedview: ['inventory'],
      fromdate: [today],
      todate: [today],
      basictype: [''],
      vouchertype: [''],
      customersupplier: [''],
      item: [''],
      staff: [''],
      area: [''],
      paymenttype: [''],
      counter: [''],
      user: [''],
      invoiceno: [''],
      batchno: [''],
      branch: [''],
      columnar: [''],
      detailed: [''],
      inventory: [''],
      groupitem: ['']
    });
    this.fetchAllFilterMasterData();
    this.setInitialState();   

  }



  fetchAllFilterMasterData(): void {
    this.isLoading = true;
    this.generalRegisterService
      .getDetails(EndpointConstant.FILLGENERALREGISTERMASTERFILTER)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          let filterMasterData = response?.data;
          this.basicTypesarr = filterMasterData.basicTypes;
          this.voucherTypesarr = filterMasterData.voucherTypes;
          this.itemsArr = filterMasterData.items;
          this.staffArr = filterMasterData.staffs;
          this.customerSupplierArr = filterMasterData.customerSupplier;
          this.areaArr = filterMasterData.areas;
          this.paymentTypes = filterMasterData.paymentTypes;
          this.counters = filterMasterData.counters;
          this.users = filterMasterData.users;
          this.branches = filterMasterData.branches;
          this.setCashCreditID();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  setCashCreditID(){
    // Find IDs for "Cash" and "Credit" payment types
    this.cashId = this.paymentTypes.find(payment => payment.name === "Cash")?.id;
    this.creditId =  this.paymentTypes.find(payment => payment.name === "Credit")?.id;
  }

  setInitialState(){
    this.setCurrentBranchAndUser();
    this.onClickGo();
  }

  setCurrentBranchAndUser() {
    //setting current branch...
    this.currentBranch = this.baseService.getLocalStorgeItem('current_branch') ? Number(this.baseService.getLocalStorgeItem('current_branch')) : 0;
    if (this.currentBranch) {
      this.filterForm.patchValue({
        "branch": this.currentBranch
      });
    }

    //setting current user...
    this.currentUser = this.baseService.getLocalStorgeItem('username');
    if (this.currentUser) {
      this.filterForm.patchValue({
        "user": this.currentUser
      });
      this.onUserSelected(this.currentUser);
    }
  }

  onBasicTypeSelected(option: any) {
    this.updatedBasicType = option;
    let basicType = this.basicTypesarr.find((basictype: any) => basictype.name == option);
    if (basicType) {
      this.selectedBasicType = {
        "id": basicType?.id,
        "name": basicType?.name,
        "code": "string",
        "description": "string"
      };
    }
  }

  onVoucherTypeSelected(option: any) {
    this.updatedVoucherType = option;
    let voucherType = this.voucherTypesarr.find((voucher: any) => voucher.name == option);
    if (voucherType) {
      this.selectedVoucherType = {
        "id": voucherType?.id,
        "name": voucherType?.name,
        "code": voucherType?.code,
        "description": "string"
      };
    }
  }

  onCustomerSupplierSelected(option: any) {
    this.updatedCussup = option;
    let customersupplier = this.customerSupplierArr.find((cussup: any) => cussup.accountName == option);
    if (customersupplier) {
      this.selectedCustomerSupplier = {
        "id": customersupplier?.id,
        "name": customersupplier?.accountName,
        "code": customersupplier?.accountCode,
        "description": "string"
      };
    }
  }

  onItemSelected(option: any) {
    this.updatedItem = option;
    let item = this.itemsArr.find((item: any) => item.itemName == option);
    if (item) {
      this.selectedItem = {
        "id": item?.id,
        "name": item?.itemName,
        "code": item?.itemCode,
        "description": "string"
      };
    }
  }

  onStaffSelected(option: any) {
    this.updatedstaff = option;
    let staff = this.staffArr.find((staff: any) => staff.name == option);
    if (staff) {
      this.selectedStaff = {
        "id": staff?.id,
        "name": staff?.name,
        "code": staff?.code,
        "description": "string"
      };
    }
  }

  onAreaSelected(option: any) {
    this.updatedarea = option;
    let area = this.areaArr.find((area: any) => area.name == option);
    if (area) {
      this.selectedArea = {
        "id": area?.id,
        "name": area?.name,
        "code": area?.code,
        "description": "string"
      };
    }
  }

  onCounterSelected(option: any) {
    this.updatedCounter = option;
    let counter = this.counters.find((counter: any) => counter.counterName == option);
    if (counter) {
      this.selectedCounter = {
        "id": counter?.id,
        "name": counter?.counterName,
        "code": counter?.counterCode,
        "description": "string"
      };
    }

  }

  onUserSelected(option: any) {
    this.updatedUser = option;
    let user = this.users.find((user: any) => user.username == option);
    if (user) {
      this.selectedUser = {
        "id": user?.id,
        "name": user?.username,
        "code": "string",
        "description": "string"
      };
    }
  }

  onViewOptionChange(event: Event): void {
    this.selectedView = (event.target as HTMLInputElement).value;

    // You can add further logic here if needed
    if (this.selectedView == 'inventory') {
      this.isInputDisabled = false;
    } else if (this.selectedView == 'finance') {
      // Disable specific form fields
      this.isInputDisabled = true;
    }
    this.onClickGo();
  }

  onClickGo() {
    let paymentTypeID = 0;
    let branchID = 0;
    let viewBy = true;
    if (this.filterForm.value.paymenttype) {
      paymentTypeID = this.filterForm.value.paymenttype;
    }
    if (this.filterForm.value.branch) {
      branchID = this.filterForm.value.branch;
    }
    if (this.selectedView == 'finance') {
      viewBy = false;
    }
    let paymenttype = {
      "id": paymentTypeID,
      "name": "string",
      "code": "string",
      "description": "string"
    };


    const fromdate = this.filterForm.value.fromdate;
    const localFromDate = new Date(fromdate.getTime() + Math.abs(fromdate.getTimezoneOffset() * 60000));
    const todate = this.filterForm.value.todate;
    const localToDate = new Date(todate.getTime() + Math.abs(todate.getTimezoneOffset() * 60000));
    localToDate.setHours(23, 59, 59, 999);
    let payload = {
      "viewBy": viewBy,
      "from": localFromDate,
      "to": localToDate,
      "baseType": this.selectedBasicType,
      "voucherType": this.selectedVoucherType,
      "customerSupplier": this.selectedCustomerSupplier,
      "item": this.selectedItem,
      "staff": this.selectedStaff,
      "area": this.selectedArea,
      "paymentType": paymenttype,
      "counter": this.selectedCounter,
      "user": this.selectedUser,
      "invoiceNo": this.filterForm.value.invoiceno,
      "batchNo": this.filterForm.value.batchno,
      "branch": {
        "id": branchID,
        "value": "string"
      },
      "detailed": this.filterForm.value.detailed ? this.filterForm.value.detailed : false,
      "columnar": this.filterForm.value.columnar ? this.filterForm.value.columnar : false,
      "groupItem": this.filterForm.value.groupitem ? this.filterForm.value.groupitem : false,
      "inventory": this.filterForm.value.inventory ? this.filterForm.value.inventory : false
    };
    this.reportData = [];

    this.generalRegisterService.saveDetails(EndpointConstant.FETCHPUREPORT, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this.reportData = response?.data;
          this.setLeftSideData(this.reportData);
          this.addSummaryRow(this.reportData);
        },
        error: (error) => {
          this.isLoading = false;
          this.baseService.showCustomDialogue('Please try again');
        },
      });
  }

  onClickClear(){
    //clear form fields 
    this.filterForm.patchValue({
      basictype: '', // or null
      vouchertype: '', 
      customersupplier: '', 
      item: '', 
      staff: '', 
      area: '', 
      paymenttype: '', 
      counters: '', 
      invoiceno: '', 
      batchno: '', 
      columnar: '', 
      detailed: '', 
      inventory: '', 
      groupitem: '', 
    });
  
    this.selectedBasicType = {};
    this.selectedVoucherType = {};
    this.selectedItem = {};
    this.selectedStaff = {};
    this.selectedCustomerSupplier = {};
    this.selectedArea = {};
    this. selectedPaymentType = {};
    this.selectedCounter = {};

    this.updatedBasicType = "";
    this.updatedVoucherType = "";
    this.updatedItem = "";
    this.updatedstaff = "";
    this.updatedCussup = "";
    this.updatedarea = "";
    this.updatedCounter = "";
    this.setInitialState();
  }

  setLeftSideData(reportInfo:any){
    if (this.selectedView == 'inventory') {

      const totalDebit = reportInfo.reduce((acc:any, item:any) => acc + parseFloat(item.Debit || '0'), 0);
      const totalCredit = reportInfo.reduce((acc:any, item:any) => acc + parseFloat(item.Credit || '0'), 0);
      const totalCashDebit = reportInfo.reduce((acc: any, item: any) => {
        return item.ModeID == this.cashId ? acc + parseFloat(item.Debit || '0') : acc;
      }, 0);

      const totalCreditDebit = reportInfo.reduce((acc: any, item: any) => {
        return item.ModeID == this.creditId ? acc + parseFloat(item.Debit || '0') : acc;
      }, 0);
      const totalCashCredit = reportInfo.reduce((acc: any, item: any) => {
        return item.ModeID == this.cashId ? acc + parseFloat(item.Credit || '0') : acc;
      }, 0);

      const totalCreditCredit = reportInfo.reduce((acc: any, item: any) => {
        return item.ModeID == this.creditId ? acc + parseFloat(item.Credit || '0') : acc;
      }, 0);


      this.leftGridDebitTotal = totalDebit;
      this.leftGridCreditTotal = totalCredit;
      this.leftGridDebitCash = totalCashDebit;
      this.leftGridDebitCredit = totalCreditDebit;
      this.leftGridCreditCash = totalCashCredit;
      this.leftGridCreditCredit = totalCreditCredit;


    } else if(this.selectedView == 'finance'){
      const totalDebit = reportInfo.reduce((acc: any, item: any) => {
        return item.isGroup == false ? acc + parseFloat(item.debit || '0') : acc;
      }, 0);
      
      const totalCredit = reportInfo.reduce((acc: any, item: any) => {
        return item.isGroup == false ? acc + parseFloat(item.credit || '0') : acc;
      }, 0);
      
      this.leftGridDebitTotal = totalDebit;
      this.leftGridCreditTotal = totalCredit;
    }
  }

  // Function to add summary row
  addSummaryRow(data: REPORTDATA[]): REPORTDATA[] {
    let summaryRow: any = {};
    if (this.selectedView == 'inventory') {
      const totalDebit = data.reduce((acc, item) => acc + parseFloat(item.Debit || '0'), 0);
      const totalCredit = data.reduce((acc, item) => acc + parseFloat(item.Credit || '0'), 0);


      // Create summary row
      summaryRow = {
        SlNo: '',
        Type: '',
        VID: '',
        VType: '',
        VNo: '',
        VDate: '',
        AccountID: '',
        Particulars: '', // Label for the summary row
        Staff: '',
        AddedBy: '',
        VATNO: '',
        PartyInvNo: '',
        Debit: totalDebit, // total debit as string
        Credit: totalCredit, // total credit as string
        isSummaryRow: true, // use flag to identify as summary row
      };
    } else {
      const totalDebit = data.reduce((acc, item) => acc + parseFloat(item.debit || '0'), 0);
      const totalCredit = data.reduce((acc, item) => acc + parseFloat(item.credit || '0'), 0);


      // Create summary row
      summaryRow = {
        vid: '',
        isGroup: false,
        accountID: '',
        particulars: '',
        debit: totalDebit, // total debit as string
        credit: totalCredit, // total credit as string
        isSummaryRow: true, // use flag to identify as summary row
      };
    }

    // Add the summary row at the end
    this.reportData.push(summaryRow);
    return this.reportData;
  }

  onClickPrint() {

  }

  onClickPreview() {

  }
  onClickExcel() {

  }

  onClickEmail() {

  }
  onClickSettings() {

  }

  onClickHelp() {

  }

  formatNumber(inputNo: any) {
    return this.baseService.formatInput(inputNo);
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


  ngAfterViewInit(): void {
    this.setMaxHeight();


  }



  toggleLeftSection() {
    this.showLeftSection = !this.showLeftSection;
    // Trigger the recalculation on window resize
    setTimeout(() => this.ngxTable.recalculate(), 0);
  }

  toggleActive(): void {
    this.istoggleActive = !this.istoggleActive;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.setMaxHeight();
  }

  setMaxHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0;

    const btnGroupHeight = this.btngroup.nativeElement.offsetHeight;
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight;
    const availableHeight = window.innerHeight - headerHeight - footerHeight - btnGroupHeight - 25;

    //set left side height...
    const leftsection = document.querySelectorAll('.left-wrapper');
    leftsection.forEach(section => {
      (section as HTMLElement).style.setProperty('height', `${leftContentHeight}px`, 'important');
    });

    //set right side height....
    const sections = document.querySelectorAll('.right-section');
    sections.forEach(section => {
      (section as HTMLElement).style.height = `${availableHeight}px`;
    });
  }

  adjustOverlayHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0;
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight;
  }

  ngOnDestroy(): void {
    this.destroySubscription.next();
    this.destroySubscription.complete();
    // window.removeEventListener('storage', this.storageEventHandlerSales);
  }

}
