import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { AccountListService } from '../../services/accountlist.service';
import { ACCOUNTBYLIST, ACCOUNTLIST, ACCOUNTPOPUP } from '../model/accountlist.interface';
import { SelectionType } from '@swimlane/ngx-datatable';
declare var $: any;

@Component({
  selector: 'dfinance-frontend-accountlist',
  templateUrl: './accountlist.component.html',
  styleUrls: ['./accountlist.component.css'],
})
export class AccountlistComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isOverlayVisible: boolean = false;
  token$: any;
  destroySubscription: Subject<void> = new Subject<void>();
  accountListForm!: FormGroup;
  isInputDisabled: boolean = true;
  isEditBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  isUpdate: boolean = false;
  isLoading = false;

  listDropdown = [] as Array<ACCOUNTLIST>;
  accountPopup = [] as Array<ACCOUNTPOPUP>;
  accountListData = [] as Array<ACCOUNTBYLIST>;
  accountPopupField = "alias";
  accountPopupKeys = ["Alias", "Name", "ID"];

  selected: any = [];
  SelectionType = SelectionType;

  
  pageId = 0;
  isEdit = true;
  isEditApproved = true;
  isHigherApproved = true;

  constructor(
    private formBuilder: FormBuilder,
    private accountListService: AccountListService,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private menudataService: MenuDataService
  ) { 
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];      
      this.fetchMenuDataPermissions();
    }
  }

  ngOnInit(): void {
    this.accountListForm = this.formBuilder.group({
      list: ["", Validators.required]
    });
    this.fetchListDropdown();
    this.fetchAccountDropdown();
  }

  setInitialState() {
    this.isEditBtnDisabled = false;
    this.isSaveBtnDisabled = true;
    this.isUpdate = false;
    this.isInputDisabled = true;
  }

  fetchMenuDataPermissions(){
    let menuData = this.menudataService.getMenuDataFromStorage(Number(this.pageId));
    this.isEdit = menuData.isEdit;
    this.isEditApproved = menuData.isEditApproved;
    this.isHigherApproved = menuData.isHigherApproved;
  }

  fetchListDropdown(): void {
    this.accountListService
      .getDetails(EndpointConstant.FILLLISTDROPDOWN)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.listDropdown = response?.data;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  fetchAccountDropdown(): void {
    this.accountListService
      .getDetails(EndpointConstant.FILLLISTACCOUNTPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.accountPopup = response?.data;
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  onChangeList(): void {
    let selectedListId = this.accountListForm.get('list')?.value;
    this.accountListData = [];
    this.accountListService
      .getDetails(EndpointConstant.FILLACCOUNTSBYLISTID + selectedListId)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let accountListResponse = response?.data;
          accountListResponse.forEach((element: any) => {
            this.accountListData.push({
              "alias": element.alias,
              "name": element.name,
              "id": element.id
            })
          });

          this.accountListData = [...this.accountListData];
          if (accountListResponse.length > 0) {
            this.isUpdate = true;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  onClickEditAccountList() {
    if(!this.isEdit){
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    return true;
  }

  onClickSaveCurrencymaster() {
    if (this.accountListForm.invalid) {
      for (const field of Object.keys(this.accountListForm.controls)) {
        const control: any = this.accountListForm.get(field);
        if (control.invalid) {
          alert('Invalid field: ' + field);
          return;  // Stop after showing the first invalid field
        }
      }
      return;
    }

    if (this.findDuplicateIds(this.accountListData)) {
      alert('Duplicate accounts exist');
      return false;
    }
    let listObj = {};
    if (this.accountListForm.value.list) {
      this.listDropdown.forEach(element => {
        if (element.id == this.accountListForm.value.list) {
          listObj = element;
        }
      });
    }
    const payload = {
      "id": 0,
      "list": listObj,
      "accounts": this.accountListData
    };

    this.createCallback(payload);
    return true;
  }

  findDuplicateIds(accounts: any) {
    const seenIds = new Set();
    const duplicates = accounts.filter((account: any) => {
      if (seenIds.has(account.id)) {
        return true;
      } else {
        seenIds.add(account.id);
        return false;
      }
    });

    if (duplicates.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  createCallback(payload: any) {
    this.accountListService.saveDetails(EndpointConstant.SAVEACCOUNTLIST, payload)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          alert('Successfully saved Account list');
          this.setInitialState();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error saving Account list', error);
        },
      });
  }

  deleteAccount(accountId: any) {
    if(!this.isInputDisabled){
      if (confirm("Are you sure you want to delete this details?")) {
        const index = this.accountListData.findIndex(account => account.id === accountId);
        if (index !== -1) {
          this.accountListData.splice(index, 1);
        }
        this.accountListData = [...this.accountListData];
      }
    }
  }

  containsAccount(accountId: number): boolean {
    return this.accountListData.some(account => account.id === accountId);
  }
  onAccountPopupSelected(option: string, rowIndex: number): any {

    let selectedAccount = {
      "alias": "",
      "name": "",
      "id": 0
    };
    this.accountPopup.forEach(item => {
      if (item.alias === option) {
        selectedAccount =
        {
          "alias": item.alias,
          "name": item.name,
          "id": item.id
        };
      }
    });
    this.accountListData[rowIndex] = selectedAccount;
    this.accountListData = [...this.accountListData];
  }
  onSelect(selected: any) {
  }
  onActivate(event: any) {
    if (event.type === 'click') {
      this.selected = [event.row];
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Delete' && this.selected.length > 0) {
      this.deleteAccount(this.selected[0].id);
    }
  }

  ngAfterViewInit(): void {
    this.setMaxHeight();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.setMaxHeight();
  }

  setMaxHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0;

    const availableHeight = window.innerHeight - headerHeight - footerHeight - 90;
    const sections = document.querySelectorAll('.right-section');
    sections.forEach(section => {
      (section as HTMLElement).style.height = `${availableHeight}px`;
    });
  }

  adjustOverlayHeight(): void {
    const headerHeight = this.header.nativeElement.offsetHeight;
    const footerHeight = 0;
    const leftContentHeight = window.innerHeight - headerHeight - footerHeight;
    //this.overlayElement.nativeElement.style.height = `${leftContentHeight}px`;
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
