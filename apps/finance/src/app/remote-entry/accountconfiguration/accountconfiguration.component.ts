import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { ActivatedRoute, Router } from '@angular/router';
import { EndpointConstant, MainHeaderComponent, MenuDataService } from '@dfinance-frontend/shared';
import { ACCOUNTCONFIG, ACCOUNTPOPUP } from '../model/accountconfig.interface';

import { SelectionType } from '@swimlane/ngx-datatable';
import { AccountConfigService } from '../../services/accountconfig.service';


@Component({
  selector: 'dfinance-frontend-accountconfiguration',
  templateUrl: './accountconfiguration.component.html',
  styleUrls: ['./accountconfiguration.component.css'],
})
export class AccountconfigurationComponent {
  @ViewChild('dataTable', { static: false }) table!: ElementRef;
  @ViewChild(MainHeaderComponent, { read: ElementRef }) header!: ElementRef;
  @ViewChild('overlay') overlayElement!: ElementRef;
  isLoading = false;
  isEditBtnDisabled: boolean = false;
  isSaveBtnDisabled: boolean = true;
  isInputDisabled: boolean = true;

  accountConfigForm!: FormGroup;
  accConfigData=[] as Array<ACCOUNTCONFIG>
 
  destroySubscription: Subject<void> = new Subject<void>();
  isUpdate: boolean = false;
  accountPopup = [] as Array<ACCOUNTPOPUP>;
  accountPopupField = "accountCode";
  accountPopupKeys = ["AccountCode", "AccountName", "ID"];
  selected: any = [];
  SelectionType = SelectionType;
  pageId=0;
 // modifiedRowIndexes: Set<number> = new Set<number>();
 isView = true;
  isCreate = true;
  isEdit = true;
  isDelete = true;
  isCancel = true;
  isEditApproved = true;
  isHigherApproved = true;

  constructor(
    private formBuilder: FormBuilder,
    private accConfigService: AccountConfigService,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private menudataService:MenuDataService

  ) {
    const queryParams = this.route.snapshot.queryParams;
    if (queryParams && queryParams['pageId']) {
      this.pageId = queryParams['pageId'];
      this.fetchMenuDataPermissions();
    }
   }

  ngOnInit(): void {
    this.accountConfigForm = this.formBuilder.group({
     // list: ["", Validators.required]
    });
    this.fetchAccConfig();
    this.fetchAccountPopup();
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

  setInitialState() {
    this.isEditBtnDisabled = false;
    this.isSaveBtnDisabled = true;
    this.isUpdate = false;
    this.isInputDisabled = true;
  }

  fetchAccConfig():void{      
    this.accConfigData = [];
    this.accConfigService
      .getDetails(EndpointConstant.FILLACCOUNTCONFIG)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          let accountResponse = response?.data;
          accountResponse.forEach((element: any) => {
            this.accConfigData.push({
              "keyword": element.keyword,
              "accountCode": element.accountCode,
              "accountName": element.accountName,
              "accID":element.accID
            })
          });

          this.accConfigData = [...this.accConfigData];         
          if (accountResponse.length > 0) {
            this.isUpdate = true;
          }
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }
  onActivate(event: any) {
    if (event.type === 'click') {
      this.selected = [event.row];
    }
  }
  onSelect(selected: any) {
  }
  onAccountPopupSelected(option: string, rowIndex: number):any{
    let selectedAccount = {
      "id": 0,
      "name": "",
      "code": "",
      "description": ""
    };
    this.accountPopup.forEach(item => {
      if (item.accountCode === option) {
        selectedAccount =
        {
          "code": item.accountCode,
          "name": item.accountName,
          "id": item.id,
          "description":""
        };
      }
    });
    this.accConfigData[rowIndex].accountCode = selectedAccount.code;
    this.accConfigData[rowIndex].accountName = selectedAccount.name;
    this.accConfigData[rowIndex].accID = selectedAccount.id;   
    this.accConfigData = [...this.accConfigData];    
     
  }



  onClickEditAccConfig() {
    if(!this.isEdit){
      alert('Permission Denied!');
      return false;
    }
    this.isInputDisabled = !this.isInputDisabled;
    this.isSaveBtnDisabled = this.isInputDisabled;
    return true;
  }

  fetchAccountPopup(): void {
    console.log(this.accConfigService.getDetails(EndpointConstant.FILLACCOUNTCONFIGPOPUP));
    this.accConfigService
      .getDetails(EndpointConstant.FILLACCOUNTCONFIGPOPUP)
      .pipe(takeUntil(this.destroySubscription))
      .subscribe({
        next: (response) => {
          this.accountPopup = response?.data;
          console.log(this.accountPopup);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('An Error Occured', error);
        },
      });
  }

  onClickSaveAccountConfig() {
    if (this.accountConfigForm.invalid) {
      Object.keys(this.accountConfigForm.controls).forEach(field => {
        const control: any = this.accountConfigForm.get(field);
        if (control.invalid) {
          alert('Invalid field:' + field);
          return;
        }
      });
      return;
    }    
    const payload = this.accConfigData.map(config => ({
      keyword: config.keyword,  
      account: {
          id: config.accID,             
          name: config.accountName,    
          code: config.accountCode,    
          description: null             
      }
  }));
  this.createCallback(payload);
  return true;
}

createCallback(payload: any) {
  console.log("Payload:"+payload)
  this.accConfigService.updateDetails(EndpointConstant.UPDATEACCOUNTCONFIG, payload)
    .pipe(takeUntil(this.destroySubscription))
    .subscribe({
      next: (response) => {
        this.isLoading = false;
        alert('Successfully Updated Account Configuration');
        this.setInitialState();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error Updating Account Configuration', error);
      },
    });
}

ngAfterViewInit(): void {
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
