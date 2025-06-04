/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @angular-eslint/use-lifecycle-interface */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { DatePipe, formatDate } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { DateAdapter, MAT_DATE_FORMATS, NativeDateAdapter } from '@angular/material/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Component, ElementRef, HostListener, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { BaseService, EndpointConstant, GridNavigationService, MainHeaderComponent, MenuDataService, SearchableDropdownComponent } from '@dfinance-frontend/shared';
import { StatementService } from '../../../services/statement.service';
import { ACCOUNTPOPUP } from '../../model/accountlist.interface';
import { USERSPOP, BRANCHES, AccountPopup, REPORTDATA, VOUCHERTYPE } from '../../model/accountStatement.interface';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
declare let $: any;
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
  selector: 'dfinance-frontend-day-book',
  templateUrl: './day-book.component.html',
  styleUrls: ['./day-book.component.css'],
})
export class DayBookComponent {
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;
  @ViewChild('ngxTable') ngxTable!: DatatableComponent;
  @ViewChild('btngroup') btngroup!: ElementRef;
  ColumnMode = ColumnMode;
  token$: any;
  users = [] as Array<USERSPOP>;
  branches = [] as Array<BRANCHES>;
  reportData = [] as Array<REPORTDATA>
  allAccounts = [] as Array<AccountPopup>;
  pageId: any;
  filterForm: any;
  destroySubscription: Subject<void> = new Subject<void>();

  isLoading = false;
  updatedUser: any;
  updatedaccount: any
  currentBranch = 0;
  currentUser = "";
  account: any;
  accountGroup: any;
  costCentre: any;
  isView: any;
  isCreate: any;
  isEdit: any;
  tableHeight = 200;
  isMaximized = false;
  selectedbutton: any = "";
  isDelete: any;
  isCancel: any;
  isEditApproved: any;
  isHigherApproved: any;
  istoggleActive = false;
  isInputDisabled = false;
  selectedAccountId = 0;
  selectedAccountName = "";
  userreturnField = 'username';
  accountreturnField = 'name';
  userKeys = ['ID', 'Username', 'First name', 'Last Name', 'EmailID', 'Mobile Number'];
  accountKeys = ['Account Code', 'Account Name', 'ID'];
  updatedbranch: any;
  accountListService: any;
  accountPopup = [] as Array<ACCOUNTPOPUP>;
  usersService: any;
  accountOptions: any = [];
  selectedUser: any = {};
  allBranches = [] as Array<BRANCHES>;
  selectedBranch: { id: number, company: string, nature: string }[] = [];
  selectedBranchId = 0;
  filledBranchId = 0;
  dateFrom: any;
  dateUpto: any;
  selectedBranchName!: string;
  selectedView = 'summary';
  leftGridDebitTotal = 0;
  leftGridCreditTotal = 0;
  columns = [
    { name: 'VDate', display: true },
    { name: 'VNo', display: true },
    { name: 'Particulars', display: true },
    { name: 'CommonNarration', display: false },
    { name: 'Debit', display: true },
    { name: 'Credit', display: true },
    { name: 'createdBy', display: false },
    { name: 'Posted', display: true },
    { name: 'BasicVType', display: true },
    { name: 'BasicVTypeID', display: true },
    { name: 'BillDetails', display: true },
    { name: 'ApprovalStatus', display: true },
    { name: 'isAutoEntry', display: false },
    { name: 'UserName', display: true },
    { name: 'TranType', display: false },
    { name: 'ID', display: false }
  ];

  summaryData: { vDate: string; total: number }[] = [];
  detailData: { vDate: string; debit: number; credit: number }[] = [];
  settingsOpen = false;
  selectedVoucher: { id: number, name: string }[] = [];
  voucherType = [] as Array<VOUCHERTYPE>;
  filledVoucherId = 0;
  selectedUserId = 0;
  selectedUserName = '';
  constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private router: Router,
    private renderer: Renderer2,
    private accountStatementService: StatementService,
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

  }
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  showTopBar = false;
  showBottomBar = false;
  showLeftSection = true;
  @ViewChildren(SearchableDropdownComponent) searchableDropdowns!: QueryList<SearchableDropdownComponent>;
  activePrintOption = false;

  ngOnInit(): void {
    this.setInitialState();
  }

  setInitialState() {
    this.createForm();
    this.setCurrentBranchAndUser();
    this.fetchAccountDropdown();
    this.fetchAllBranches();
    this.fetchAllVoucher();
    this.fetchUserPopup();
  }

  createForm(): void {
    const today = new Date();
    this.filterForm = this.formBuilder.group({
      dateFrom: [today],
      dateUpto: [today],
      account: [''],
      user: [''],
      branch: [''],
      voucherType: ['ALL'],
      detailed: [''],
      posted: [''],
    });
  }
  fetchUserPopup(): void {
    this.accountStatementService
      .getDetails(EndpointConstant.USERPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.users = response?.data;
          if (this.users.length > 0) {
            this.selectedUserId = this.users[0].id;
            this.selectedUserName = this.users[0].username;
            setTimeout(() => {
              this.updatedUser = this.users[0].username;
            });
          }
        },
        error: (error: any) => {
          console.error('An error occurred:', error);
        },
      });
  }
  onUserSelected(option: string): void {
    let selectedUserId = 0;
    this.users.forEach((item: USERSPOP) => {
      if (item.username === option) {
        selectedUserId = item.id;
      }
    });

    this.selectedUserId = selectedUserId;
    this.selectedUserName = option;
    setTimeout(() => {
      this.updatedUser = option;
    });
  }

  fetchAccountDropdown(): void {
    this.accountStatementService
      .getDetails(EndpointConstant.FILLACCOUNTPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response: { data: AccountPopup[] }) => {
          this.allAccounts = response?.data;
          if (this.allAccounts.length > 0) {
            this.selectedAccountId = this.allAccounts[0].id;
            this.selectedAccountName = this.allAccounts[0].name;
            setTimeout(() => {
              this.updatedaccount = this.allAccounts[0].name;
            });
          }
        },
        error: (error: any) => {
          console.error('An error occurred:', error);
        },
      });
  }

  onAccountSelected(option: string): void {
    let selectedAccountId = 0;
    this.allAccounts.forEach((item: AccountPopup) => {
      if (item.name === option) {
        selectedAccountId = item.id;
      }
    });

    this.selectedAccountId = selectedAccountId;
    this.selectedAccountName = option;
    setTimeout(() => {
      this.updatedaccount = option;
    });
  }

  fetchAllBranches(): void {
    this.accountStatementService
      .getDetails(EndpointConstant.FILLALLBRANCH)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.allBranches = response?.data;
        },
        error: (error) => {
          console.error('An Error Occured', error);
        },
      });
  }

  selectBranch(event: Event) {
    const selectedBranchId = (event.target as HTMLSelectElement).value;
    this.selectedBranch = [];
    this.filledBranchId = Number(selectedBranchId);

    this.allBranches.forEach((branch: any) => {
      if (branch.id == selectedBranchId) {
        this.selectedBranch.push(branch);
      }
    });
  }
  fetchAllVoucher(): void {
    this.accountStatementService
      .getDetails(EndpointConstant.VOUCHERDROPDOWN)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response: { data: any[] }) => {
          this.voucherType = response?.data || [];
        },
        error: (error) => {
          console.error('An Error Occurred while fetching vouchers:', error.message || error);
        },
      });
  }

  selectVoucher(event: Event): void {
    const selectedVoucherId = (event.target as HTMLSelectElement).value;

    if (selectedVoucherId === 'all') {
      this.selectedVoucher = [...this.voucherType];
      this.filledVoucherId = 0;
    } else {
      this.selectedVoucher = this.voucherType.filter(
        (voucher) => voucher.id === Number(selectedVoucherId)
      );
      this.filledVoucherId = Number(selectedVoucherId);
    }
  }

  onClickGo(): void {
    this.isLoading = true;

    // Retrieve form values
    const branchID = this.filterForm.value.branch || 0;
    const dateFrom = this.filterForm.value.dateFrom;
    const dateUpto = this.filterForm.value.dateUpto;

    // Validate the dates
    if (!dateFrom || !dateUpto) {
      console.error("Both dateFrom and dateUpto are required.");
      this.isLoading = false;
      return;
    }

    // Adjust for local timezone offsets and set end of day for 'dateUpto'
    const localFromDate = new Date(dateFrom.getTime() + Math.abs(dateFrom.getTimezoneOffset() * 60000));
    const localToDate = new Date(dateUpto.getTime() + Math.abs(dateUpto.getTimezoneOffset() * 60000));
    localToDate.setHours(23, 59, 59, 999);

    // Prepare the payload for the API call
    const payload = {
      dateFrom: dateFrom ? new Date(dateFrom).toISOString() : null,
      dateUpto: dateUpto ? new Date(localToDate).toISOString() : null,
      branch: this.filterForm.value.branch ? {
        id: this.filterForm.value.branch,
        value: this.filterForm.value.branchName || "string"
      } : null,
      voucherType: this.filterForm.value.voucherType ? {
        id: this.filledVoucherId // Make sure this is the correct value (should be the ID of the selected voucher type)
      } : null,
      user: this.selectedUser ? {
        id: this.selectedUserId, // Pass the selected user's ID
        name: "string", // Pass the selected user's name
        code: "string", // Use the correct code if available
        description: "string" // Use the correct description if available
      } : null,
      detailed: this.filterForm.value.detailed || false,
      posted: this.filterForm.value.posted || false
    };

    // Log the payload for debugging purposes
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const endpoint = `${EndpointConstant.FILLDAYBOOK}?pageId=${this.pageId}&jsonDto=${JSON.stringify(payload)}`;

    this.accountStatementService
      .saveDetails(endpoint, null)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response: { data: any[] }) => {
          console.log("Response:", response);
          this.isLoading = false;

          // Handle the response and set the data
          if (response?.data && response.data.length > 0) {
            this.reportData = response.data;
            this.setView(this.selectedView);
            // Uncomment the following if needed
            // this.addSummaryRow(this.reportData);
          } else {
            console.warn("No data received in the response.");
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error("Error occurred while fetching report data:", error);
          this.baseService.showCustomDialogue("An error occurred. Please try again.");
        }
      });
  }


  // onClickGo(): void {
  //   this.isLoading = true;
  //   const branchID = this.filterForm.value.branch || 0;
  //   const dateFrom = this.filterForm.value.dateFrom;
  //   const dateUpto = this.filterForm.value.dateUpto;
  //   if (!dateFrom || !dateUpto) {
  //     console.error("Both dateFrom and dateUpto are required.");
  //     this.isLoading = false;
  //     return;
  //   }
  //   const localFromDate = new Date(dateFrom.getTime() + Math.abs(dateFrom.getTimezoneOffset() * 60000));
  //   const localToDate = new Date(dateUpto.getTime() + Math.abs(dateUpto.getTimezoneOffset() * 60000));
  //   localToDate.setHours(23, 59, 59, 999);

  //   const payload = {
  //     dateFrom: this.filterForm.value.dateFrom
  //       ? new Date(this.filterForm.value.dateFrom).toISOString()
  //       : null,
  //     dateUpto: this.filterForm.value.dateUpto
  //       ? new Date(this.filterForm.value.dateUpto).toISOString()
  //       : null,
  //     branch: this.filterForm.value.branch
  //       ? {
  //           id: this.filterForm.value.branch,
  //           value: this.filterForm.value.branchName || "string",
  //         }
  //       : null,
  //     voucherType: this.filterForm.value.voucherType
  //       ? {
  //           id: this.filterForm.value.voucherType,
  //           name: this.voucherType.find(
  //             (v: any) => v.id === this.filterForm.value.voucherType
  //           )?.name || "string",
  //         }
  //       : null,
  //     user: this.selectedUser
  //       ? {
  //           id: this.selectedUser.id || null,
  //           name: this.selectedUser.name || "string",
  //           code: this.selectedUser.code || "string",
  //           description: this.selectedUser.description || "string",
  //         }
  //       : null,
  //     detailed: this.filterForm.value.detailed || false,
  //     posted: this.filterForm.value.posted || false,
  //   };
  //   console.log("Payload:", JSON.stringify(payload, null, 2));
  //   this.accountStatementService
  //     .saveDetails(`${EndpointConstant.FILLDAYBOOK}?pageId=${this.pageId}&jsonDto=${payload}`)
  //     .pipe(takeUntil(this.destroySubscription))
  //     .subscribe({
  //       next: (response: { data: any[] }) => {
  //         console.log("response",response)
  //         this.isLoading = false;
  //         if (response?.data) {
  //           this.reportData = response.data;
  //           this.setView(this.selectedView);
  //           // this.addSummaryRow(this.reportData);
  //         } else {
  //           console.warn("No data received in the response.");
  //         }
  //       },
  //       error: (error: any) => {
  //         this.isLoading = false;
  //         console.error("Error occurred while fetching report data:", error);
  //         this.baseService.showCustomDialogue("An error occurred. Please try again.");
  //       },
  //     });
  // }

  setView(view: string): void {
    this.selectedView = view;
    if (view === 'summary') {
      this.generateSummaryData();
    } else {
      this.generateDetailData();
    }
  }
  generateSummaryData(): void {
    const monthWiseSummary: { [key: string]: number } = {};

    this.reportData.forEach((row) => {
      if (row?.vDate) {
        const monthYear = new Date(row.vDate).toLocaleString('default', { month: 'long', year: 'numeric' });

        monthWiseSummary[monthYear] = (monthWiseSummary[monthYear] || 0) + (row.debit || 0) + (row.credit || 0);
      }
    });

    this.summaryData = Object.entries(monthWiseSummary).map(([key, value]) => ({
      vDate: key,
      total: value
    }));
    this.summaryData.sort((a, b) => new Date(a.vDate).getTime() - new Date(b.vDate).getTime());
  }

  generateDetailData(): void {
    const monthWiseDetails: { [key: string]: { debit: number; credit: number; vDate: string } } = {};

    this.reportData.forEach((row) => {
      if (row?.vDate) {
        const monthYear = new Date(row.vDate).toLocaleString('default', { month: 'long', year: 'numeric' });

        if (!monthWiseDetails[monthYear]) {
          monthWiseDetails[monthYear] = {
            vDate: monthYear,
            debit: 0,
            credit: 0,
          };
        }

        monthWiseDetails[monthYear].debit += row.debit || 0;
        monthWiseDetails[monthYear].credit += row.credit || 0;
      }
    });

    this.detailData = Object.keys(monthWiseDetails).map((month) => {
      const aggregatedData = monthWiseDetails[month];
      return {
        vDate: aggregatedData.vDate,
        debit: aggregatedData.debit,
        credit: aggregatedData.credit,
      };
    });
    this.detailData.sort((a, b) => new Date(a.vDate).getTime() - new Date(b.vDate).getTime());
  }




  parseDate(dateString: string): string {
    const options = { year: 'numeric', month: 'long' } as const;
    return new Date(dateString).toLocaleDateString('en-US', options);
  }


  setCurrentBranchAndUser() {
    this.currentBranch = this.baseService.getLocalStorgeItem('current_branch') ? Number(this.baseService.getLocalStorgeItem('current_branch')) : 0;
    if (this.currentBranch) {
      this.filterForm.patchValue({
        "branch": this.currentBranch
      });
    }
    this.currentUser = this.baseService.getLocalStorgeItem('username');
    if (this.currentUser) {
      this.filterForm.patchValue({
        "user": this.currentUser
      });
      this.onUserSelected(this.currentUser);
    }
  }

  onClickClear(): void {
    // Reset the filter form to its initial state
    const today = new Date();
    this.filterForm.reset({
      dateFrom: today,
      dateUpto: today,
      account: '',
      user: '',
      branch: '',
      accountGroup: '',
      costCentre: '',
    });
    this.selectedAccountId = 0;
    this.selectedAccountName = '';
    this.selectedUser = {};
    this.selectedBranch = [];
    this.selectedBranchId = 0;
    this.filledBranchId = 0;
    this.reportData = [];
    this.setInitialState();
  }

  onClickPrint() {

  }

  onClickPreview() {

  }
  // onClickExcel(): void {
  //   if (!this.reportData || this.reportData.length === 0) {
  //     console.warn("No data available to export.");
  //     return;
  //   }

  //   const selectedColumns = this.columns.filter(column => column.display);
  //   if (selectedColumns.length === 0) {
  //     console.warn("No columns selected for export.");
  //     return;
  //   }

  //   const exportData = this.reportData.map(row => {
  //     const filteredRow: any = {};
  //     selectedColumns.forEach(column => {
  //       filteredRow[column.name] = row[column.name];
  //     });
  //     return filteredRow;
  //   });

  //   const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
  //   const workbook: XLSX.WorkBook = {
  //     Sheets: { 'Day Book': worksheet },
  //     SheetNames: ['Account Statement'],
  //   };

  //   const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  //   const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

  //   saveAs(blob, `Account_Statement_${new Date().toISOString()}.xlsx`);
  // }
  onClickExcel(): void {
    if (!this.reportData || this.reportData.length === 0) {
      console.warn("No data available to export.");
      return;
    }

    const selectedColumns = this.columns.filter(column => column.display);
    if (selectedColumns.length === 0) {
      console.warn("No columns selected for export.");
      return;
    }
    const titleRow = ["", "Day Book", ""];
    const dateRow = [
      "",
      `Date From: ${this.filterForm.value.dateFrom.toLocaleDateString()} To: ${this.filterForm.value.dateUpto.toLocaleDateString()}`,
      ""
    ];
    const dataRows = this.reportData.map(row => {
      return selectedColumns.map(column => row[column.name]);
    });

    const worksheetData = [
      titleRow,
      dateRow,
      [],
      selectedColumns.map(column => column.name),
      ...dataRows
    ];

    const worksheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: selectedColumns.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: selectedColumns.length - 1 } }
    ];

    const titleStyle = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } };
    const dateStyle = { alignment: { horizontal: 'center' } };
    const headerStyle = { font: { bold: true }, alignment: { horizontal: 'center' }, fill: { fgColor: { rgb: "CCCCCC" } } };
    const cellStyle = { alignment: { horizontal: 'center', vertical: 'center' }, border: { top: { style: 'thin' }, right: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' } } };

    worksheet['A1'] = { v: 'Day Book', t: 's', s: titleStyle };
    worksheet['A2'] = { v: dateRow[1], t: 's', s: dateStyle };

    for (let R = 3; R < worksheetData.length; R++) {
      for (let C = 0; C < selectedColumns.length; C++) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        worksheet[cell].s = R === 3 ? headerStyle : cellStyle;
      }
    }

    const columnWidths = selectedColumns.map(() => ({ wch: 15 }));
    worksheet['!cols'] = columnWidths;

    const workbook: XLSX.WorkBook = {
      Sheets: { 'Day Book': worksheet },
      SheetNames: ['Day Book']
    };

    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });

    saveAs(blob, `Day_Book_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }




  onClickEmail() {

  }
  onClickSettings() {
    this.settingsOpen = !this.settingsOpen;
  }

  toggleColumn(columnName: string) {
    const column = this.columns.find(col => col.name === columnName);
    if (column) {
      column.display = !column.display;
    }
  }

  onClickHelp() {

  }

  formatNumber(inputNo: any) {
    return this.baseService.formatInput(inputNo);
  }



  fetchMenuDataPermissions() {
    const menuData = this.menudataService.getMenuDataFromStorage(Number(this.pageId));
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

    const leftsection = document.querySelectorAll('.left-wrapper');
    leftsection.forEach(section => {
      (section as HTMLElement).style.setProperty('height', `${leftContentHeight}px`, 'important');
    });

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